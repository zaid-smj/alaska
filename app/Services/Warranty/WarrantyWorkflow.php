<?php

namespace App\Services\Warranty;

use App\Models\Product;
use App\Models\User;
use App\Models\Warranty\WarrantyClaim;
use App\Models\Warranty\WarrantyRegistration;
use App\Models\Warranty\WarrantyUpload;
use App\Services\AuditLogger;
use App\Warranty\WarrantyAccess;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class WarrantyWorkflow
{
    public static function normalizeIdentifier(string $value): string
    {
        return preg_replace('/[^A-Z0-9]/', '', strtoupper($value));
    }

    public function submit(string $kind, array $input, string $session): array
    {
        $rules = [
            'name' => ['required', 'string', 'max:255'], 'phone' => ['required', 'string', 'regex:/^[+\d][\d\s()\-]{7,29}$/'], 'email' => ['required', 'email', 'max:255'], 'city' => ['required', 'string', 'max:255'],
            'product_type' => ['required', Rule::in(array_keys(config('warranty.types')))], 'product_model' => ['required', 'string', 'max:255'],
            'serial_number' => ['required', 'string', 'max:255'], 'card_number' => [$kind === 'registration' ? 'required' : 'nullable', 'string', 'max:255'],
            'purchase_date' => ['required', 'date_format:Y-m-d', 'before_or_equal:today'], 'dealer' => ['required', 'string', 'max:255'],
            'submission_key' => ['required', 'uuid'], 'upload_id' => ['nullable', 'uuid'], 'confirmed' => ['required', 'accepted'], 'consent' => ['required', 'accepted'],
        ];
        if ($kind === 'claim') {
            $rules += ['registration_reference' => ['nullable', 'string', 'max:80'], 'problem_started_on' => ['required', 'date_format:Y-m-d', 'before_or_equal:today', 'after_or_equal:purchase_date'], 'usage' => ['nullable', 'string', 'max:1000'], 'issue' => ['required', Rule::in(config('warranty.issues'))], 'description' => ['required', 'string', 'max:1200']];
        }
        $data = validator($input, $rules)->validate();
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $data[$key] = trim($value);
            }
        }
        $data['email'] = strtolower($data['email']);
        if (self::normalizeIdentifier($data['serial_number']) === '' || ($kind === 'registration' && self::normalizeIdentifier($data['card_number']) === '')) {
            throw ValidationException::withMessages(['serial_number' => 'Enter a valid product serial and warranty card number.']);
        }
        $payloadHash = hash('sha256', json_encode($data));
        $sessionHash = hash('sha256', $session);
        $model = $kind === 'registration' ? WarrantyRegistration::class : WarrantyClaim::class;

        return DB::transaction(function () use ($kind, $data, $payloadHash, $sessionHash, $model) {
            $existing = $model::where('submission_key', $data['submission_key'])->lockForUpdate()->first();
            if ($existing) {
                if (! hash_equals($existing->session_hash, $sessionHash) || ! hash_equals($existing->payload_hash, $payloadHash)) {
                    throw ValidationException::withMessages(['submission_key' => 'This submission reference was already used. Reload the form before submitting different information.']);
                }

                return $this->receipt($existing);
            }
            $upload = null;
            if (! empty($data['upload_id'])) {
                $upload = WarrantyUpload::whereKey($data['upload_id'])->lockForUpdate()->first();
                if (! $upload || ! hash_equals($upload->session_hash, $sessionHash) || $upload->expires_at->isPast() || $upload->warranty_registration_id || $upload->warranty_claim_id) {
                    throw ValidationException::withMessages(['upload_id' => 'Upload the attachment again before submitting.']);
                }
            }
            $attributes = Arr::only($data, ['name', 'phone', 'email', 'city', 'product_type', 'product_model', 'serial_number', 'card_number', 'purchase_date', 'dealer']);
            $attributes += ['reference' => ($kind === 'registration' ? 'WR-' : 'WC-').Str::ulid(), 'submission_key' => $data['submission_key'], 'session_hash' => $sessionHash, 'payload_hash' => $payloadHash, 'form_snapshot' => $data, 'form_version' => 1, 'confirmed_at' => now(), 'consented_at' => now()];
            if ($kind === 'registration') {
                $identity = $this->identity($data);
                if (WarrantyRegistration::where('identity_hash', $identity)->exists()) {
                    throw ValidationException::withMessages(['serial_number' => 'This product may already be registered. Use your existing warranty reference or contact support.']);
                }
                $family = $this->family($data['product_type']);
                $attributes += ['identity_hash' => $identity, 'registered_at' => now(), 'product_id' => Product::forPublicUse()->forFamily($family)->where('name', $data['product_model'])->value('id')];
                $record = WarrantyRegistration::create($attributes);
            } else {
                $registration = $this->registrationForClaim($data);
                if (! $registration && ! config('warranty.allow_unregistered_claims')) {
                    throw ValidationException::withMessages(['registration_reference' => 'Register the product before filing a claim. Contact support for an existing paper warranty.']);
                }
                $state = ! $registration ? 'unregistered_transition' : ($registration->registered_at->timezone(config('app.display_timezone', 'Asia/Karachi'))->toDateString() < $data['problem_started_on'] ? 'registered_before_problem' : 'late_or_same_day_registration');
                $attributes += Arr::only($data, ['registration_reference', 'problem_started_on', 'usage', 'issue', 'description']);
                $attributes += ['warranty_registration_id' => $registration?->id, 'registration_state' => $state, 'claimed_at' => now(), 'status' => 'new'];
                $record = WarrantyClaim::create($attributes);
                $record->activities()->create(['event' => 'submitted', 'changes' => ['status' => ['from' => null, 'to' => 'new']], 'note' => $state === 'unregistered_transition' ? 'Transition exception: no matching prior online registration; verify documents manually.' : ($state === 'late_or_same_day_registration' ? 'Registration was on or after the reported problem date; verify eligibility manually.' : 'Linked to a prior registration. Eligibility still requires staff review.')]);
            }
            if ($upload) {
                $upload->update([$kind === 'registration' ? 'warranty_registration_id' : 'warranty_claim_id' => $record->id]);
            }
            app(AuditLogger::class)->record('warranty.'.$kind.'.submitted', 'Customer submitted a warranty '.$kind.'.', $record, ['reference' => $record->reference]);

            return $this->receipt($record);
        });
    }

    private function family(string $type): string
    {
        return in_array($type, ['dry-charge', 'maintenance-free'], true) ? 'lead-acid' : $type;
    }

    private function identity(array $data): string
    {
        return hash('sha256', $this->family($data['product_type']).'|'.self::normalizeIdentifier($data['serial_number']).'|'.self::normalizeIdentifier($data['card_number'] ?? ''));
    }

    private function registrationForClaim(array $data): ?WarrantyRegistration
    {
        $query = WarrantyRegistration::where('email', $data['email']);
        if (! empty($data['registration_reference'])) {
            $registration = $query->where('reference', strtoupper($data['registration_reference']))->first();
            if (! $registration || ! $this->matches($registration, $data)) {
                throw ValidationException::withMessages(['registration_reference' => 'The reference and supplied product/contact details do not match. Check them, or leave the reference blank for staff to review an unregistered claim.']);
            }

            return $registration;
        }
        // Matching never returns any stored personal information to the browser.
        $candidates = $query->where('product_type', $data['product_type'])->get()->filter(fn ($record) => $this->matches($record, $data));

        return $candidates->count() === 1 ? $candidates->first() : null;
    }

    private function matches(WarrantyRegistration $record, array $data): bool
    {
        return $this->family($record->product_type) === $this->family($data['product_type'])
            && self::normalizeIdentifier($record->serial_number) === self::normalizeIdentifier($data['serial_number'])
            && (! empty($data['card_number']) ? self::normalizeIdentifier($record->card_number) === self::normalizeIdentifier($data['card_number']) : ! empty($data['registration_reference']));
    }

    private function receipt($record): array
    {
        return ['success' => true, 'reference' => $record->reference, 'received_at' => ($record instanceof WarrantyRegistration ? $record->registered_at : $record->claimed_at)->toIso8601String(), 'message' => $record instanceof WarrantyRegistration ? 'Registration saved. Keep this warranty reference for future claims. Registration does not replace the warranty terms or purchase date.' : 'Your claim is in the review queue. Staff will review the information and documents; submission does not confirm warranty eligibility.'];
    }

    public function review(WarrantyClaim $claim, User $actor, array $data): void
    {
        abort_unless(WarrantyAccess::allows($actor), 403);
        $data = validator($data, ['status' => ['required', Rule::in(array_keys(WarrantyClaim::STATUSES))], 'assigned_to' => ['nullable', 'integer', 'exists:users,id'], 'note' => ['nullable', 'string', 'max:5000']])->validate();
        if (! empty($data['assigned_to']) && ! WarrantyAccess::allows(User::find($data['assigned_to']))) {
            throw ValidationException::withMessages(['assigned_to' => 'Assign this claim to an active staff member with warranty access.']);
        }
        DB::transaction(function () use ($claim, $actor, $data) {
            $record = WarrantyClaim::whereKey($claim->id)->lockForUpdate()->firstOrFail();
            $changes = [];
            foreach (['status', 'assigned_to'] as $field) {
                $value = $data[$field] ?? null;
                if ((string) $record->$field !== (string) $value) {
                    $changes[$field] = ['from' => $record->$field, 'to' => $value];
                    $record->$field = $value;
                }
            }
            $record->save();
            $record->activities()->create(['actor_id' => $actor->id, 'event' => 'reviewed', 'changes' => $changes, 'note' => $data['note'] ?? null]);
            app(AuditLogger::class)->record('warranty.claim.reviewed', 'Warranty claim review updated.', $record, ['changes' => $changes], actor: $actor);
        });
    }
}
