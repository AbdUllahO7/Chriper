<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class InventoryItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'sku',
        'category',
        'quantity',
        'reorder_threshold',
        'unit',
        'unit_cost',
        'supplier_name',
        'storage_location',
        'last_restocked_at',
        'status',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'reorder_threshold' => 'integer',
        'unit_cost' => 'float',
        'last_restocked_at' => 'datetime',
    ];

    protected $appends = [
        'is_low_stock',
    ];

    public function getIsLowStockAttribute(): bool
    {
        return $this->quantity <= $this->reorder_threshold;
    }
}
