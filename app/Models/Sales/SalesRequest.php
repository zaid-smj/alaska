<?php

namespace App\Models\Sales;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Validation\ValidationException;

class SalesRequest extends Model
{
    protected $guarded = ['id'];

    protected $hidden = ['session_hash', 'payload_hash', 'submission_key'];

    public const STATUSES = ['assigned' => 'Assigned', 'proposal_sent' => 'Proposal sent externally', 'awaiting_response' => 'Awaiting response', 'accepted' => 'Accepted', 'declined' => 'Declined', 'return_requested' => 'Return requested', 'returned' => 'Returned', 'closed' => 'Closed', 'new' => 'New enquiry', 'contacted' => 'Contacted', 'pending' => 'Pending / follow-up', 'confirmed' => 'Confirmed', 'processing' => 'Processing', 'awaiting_payment' => 'Awaiting payment', 'payment_verification_required' => 'Payment verification required', 'ready_for_dispatch' => 'Ready for dispatch', 'shipped' => 'Shipped', 'delivered' => 'Delivered / Collected', 'completed' => 'Completed', 'cancelled' => 'Cancelled', 'refund_requested' => 'Refund requested', 'refunded' => 'Refunded'];

    protected function casts(): array
    {
        return ['applications' => 'array', 'consented_at' => 'datetime', 'completed_at' => 'datetime', 'estimate_cents' => 'integer', 'claimed_at' => 'datetime', 'follow_up_at' => 'datetime', 'checkout_snapshot' => 'array', 'payment_status_recorded_at' => 'datetime'];
    }

    protected static function booted(): void
    {
        static::updating(function (self $record) {
            if ($record->getRawOriginal('request_kind') === 'checkout' && $record->isDirty(['checkout_snapshot', 'checkout_preview_id', 'payment_method', 'currency', 'request_kind'])) {
                throw ValidationException::withMessages(['checkout' => 'Original checkout method, prices, taxes and shipping are immutable.']);
            }
        });
    }

    public function paymentRecorder()
    {
        return $this->belongsTo(User::class, 'payment_status_recorded_by');
    }

    public const PAYMENT_STATUSES = ['awaiting_verification' => 'Bank transfer awaiting verification', 'bank_transfer_verified' => 'Bank transfer verified externally', 'verification_failed' => 'Bank transfer verification failed', 'awaiting_collection' => 'COD awaiting collection', 'cod_collected' => 'COD collected externally', 'collection_failed' => 'COD collection failed'];

    public function attachments()
    {
        return $this->hasMany(SalesAttachment::class);
    }

    public function items()
    {
        return $this->hasMany(SalesRequestItem::class);
    }

    public function activities()
    {
        return $this->hasMany(SalesActivity::class)->latest('id');
    }

    public function invoice()
    {
        return $this->hasOne(SalesInvoice::class);
    }

    public function assignee()
    {
        return $this->belongsTo(User::class, 'assigned_to');
    }
}
