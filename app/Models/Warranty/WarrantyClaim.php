<?php

namespace App\Models\Warranty;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WarrantyClaim extends Model
{
    public const STATUSES = ['new' => 'New', 'in_review' => 'In review', 'awaiting_information' => 'Awaiting information', 'approved' => 'Approved', 'rejected' => 'Rejected', 'resolved' => 'Resolved'];

    protected $guarded = ['id'];

    protected $hidden = ['session_hash', 'payload_hash', 'submission_key'];

    protected function casts(): array
    {
        return ['purchase_date' => 'date', 'problem_started_on' => 'date', 'claimed_at' => 'datetime', 'confirmed_at' => 'datetime', 'consented_at' => 'datetime', 'form_snapshot' => 'array'];
    }

    public function registration(): BelongsTo
    {
        return $this->belongsTo(WarrantyRegistration::class, 'warranty_registration_id');
    }

    public function assignee(): BelongsTo
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }

    public function activities(): HasMany
    {
        return $this->hasMany(WarrantyClaimActivity::class)->latest('id');
    }

    public function uploads(): HasMany
    {
        return $this->hasMany(WarrantyUpload::class);
    }
}
