<?php

namespace App\Http\Controllers;

use App\Models\InventoryItem;
use App\Models\Notification;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Inertia\Response;

class InventoryController extends Controller
{
    /**
     * Default seed items for chiropractic clinic supplies if inventory is empty.
     */
    protected array $defaultSupplies = [
        [
            'name' => 'Premium Soft Clinic Therapy Towels',
            'sku' => 'SUP-TOWL-01',
            'category' => 'Towels & Linen',
            'quantity' => 12,
            'reorder_threshold' => 15,
            'unit' => 'packs',
            'unit_cost' => 18.50,
            'supplier_name' => 'MedLinen Supplies Co.',
            'storage_location' => 'Linen Closet A1',
            'status' => 'low_stock',
        ],
        [
            'name' => 'Reusable TENS Electrotherapy Pads (4x4cm)',
            'sku' => 'SUP-TENS-02',
            'category' => 'Electrotherapy Pads',
            'quantity' => 8,
            'reorder_threshold' => 20,
            'unit' => 'boxes',
            'unit_cost' => 24.00,
            'supplier_name' => 'ElectroMed Tech',
            'storage_location' => 'Cabinet B3',
            'status' => 'low_stock',
        ],
        [
            'name' => 'Organic Arnica Chiropractic Massage Oil (1L)',
            'sku' => 'SUP-OIL-03',
            'category' => 'Massage Oils & Lotions',
            'quantity' => 25,
            'reorder_threshold' => 10,
            'unit' => 'bottles',
            'unit_cost' => 32.00,
            'supplier_name' => 'NatureCare Botanicals',
            'storage_location' => 'Treatment Room 1 Shelf',
            'status' => 'in_stock',
        ],
        [
            'name' => 'Cervical & Lumbar Traction Straps',
            'sku' => 'SUP-MED-04',
            'category' => 'Medical & Orthopedic Supplies',
            'quantity' => 15,
            'reorder_threshold' => 5,
            'unit' => 'units',
            'unit_cost' => 45.00,
            'supplier_name' => 'OrthoSpine Equipment',
            'storage_location' => 'Equipment Storage B',
            'status' => 'in_stock',
        ],
        [
            'name' => 'Hospital Grade Surface Disinfectant Wipes',
            'sku' => 'SUP-HYG-05',
            'category' => 'Disinfectants & Hygiene',
            'quantity' => 4,
            'reorder_threshold' => 12,
            'unit' => 'tubs',
            'unit_cost' => 14.50,
            'supplier_name' => 'SanitiClean Direct',
            'storage_location' => 'Sanitation Station',
            'status' => 'low_stock',
        ],
    ];

    /**
     * Display clinic inventory management dashboard.
     */
    public function index(Request $request): Response
    {
        // Seed default supplies if empty
        if (InventoryItem::count() === 0) {
            foreach ($this->defaultSupplies as $sup) {
                InventoryItem::create(array_merge($sup, ['last_restocked_at' => now()->subDays(rand(1, 10))]));
            }
        }

        $search = $request->input('search');
        $category = $request->input('category');
        $lowStockOnly = $request->boolean('low_stock_only');

        $inventoryItems = InventoryItem::query()
            ->when($search, function ($query, $search) {
                $query->where(function ($q) use ($search) {
                    $q->where('name', 'like', "%{$search}%")
                      ->orWhere('sku', 'like', "%{$search}%")
                      ->orWhere('supplier_name', 'like', "%{$search}%");
                });
            })
            ->when($category, function ($query, $category) {
                $query->where('category', $category);
            })
            ->when($lowStockOnly, function ($query) {
                $query->whereColumn('quantity', '<=', 'reorder_threshold');
            })
            ->latest('updated_at')
            ->paginate(12)
            ->withQueryString();

        $lowStockItems = InventoryItem::whereColumn('quantity', '<=', 'reorder_threshold')->get();

        return Inertia::render('Inventory/Index', [
            'inventoryItems' => $inventoryItems,
            'lowStockItems' => $lowStockItems,
            'filters' => [
                'search' => $search ?? '',
                'category' => $category ?? '',
                'low_stock_only' => $lowStockOnly,
            ],
            'categories' => [
                'Towels & Linen',
                'Electrotherapy Pads',
                'Massage Oils & Lotions',
                'Medical & Orthopedic Supplies',
                'Disinfectants & Hygiene',
            ],
        ]);
    }

    /**
     * Store a new supply item.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'sku' => ['required', 'string', 'max:255', 'unique:inventory_items,sku'],
            'category' => ['required', Rule::in([
                'Towels & Linen',
                'Electrotherapy Pads',
                'Massage Oils & Lotions',
                'Medical & Orthopedic Supplies',
                'Disinfectants & Hygiene'
            ])],
            'quantity' => ['required', 'integer', 'min:0'],
            'reorder_threshold' => ['required', 'integer', 'min:1'],
            'unit' => ['required', 'string', 'max:50'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
            'supplier_name' => ['nullable', 'string', 'max:255'],
            'storage_location' => ['nullable', 'string', 'max:255'],
        ]);

        $status = $validated['quantity'] == 0 ? 'out_of_stock' : ($validated['quantity'] <= $validated['reorder_threshold'] ? 'low_stock' : 'in_stock');

        $item = InventoryItem::create(array_merge($validated, [
            'status' => $status,
            'last_restocked_at' => now(),
        ]));

        return redirect()->back()->with('message', "Supply item '{$item->name}' added to inventory.");
    }

    /**
     * Update an inventory item.
     */
    public function update(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string'],
            'reorder_threshold' => ['required', 'integer', 'min:1'],
            'unit' => ['required', 'string', 'max:50'],
            'unit_cost' => ['required', 'numeric', 'min:0'],
            'supplier_name' => ['nullable', 'string', 'max:255'],
            'storage_location' => ['nullable', 'string', 'max:255'],
        ]);

        $inventoryItem->update($validated);

        return redirect()->back()->with('message', 'Inventory item details updated.');
    }

    /**
     * Restock an item (+N units).
     */
    public function restock(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1'],
        ]);

        $newQty = $inventoryItem->quantity + $validated['amount'];
        $status = $newQty <= $inventoryItem->reorder_threshold ? 'low_stock' : 'in_stock';

        $inventoryItem->update([
            'quantity' => $newQty,
            'status' => $status,
            'last_restocked_at' => now(),
        ]);

        return redirect()->back()->with('message', "Restocked {$validated['amount']} {$inventoryItem->unit} for '{$inventoryItem->name}'. New stock: {$newQty}");
    }

    /**
     * Record stock usage (-N units).
     */
    public function consume(Request $request, InventoryItem $inventoryItem)
    {
        $validated = $request->validate([
            'amount' => ['required', 'integer', 'min:1', "max:{$inventoryItem->quantity}"],
        ]);

        $newQty = max(0, $inventoryItem->quantity - $validated['amount']);
        $status = $newQty == 0 ? 'out_of_stock' : ($newQty <= $inventoryItem->reorder_threshold ? 'low_stock' : 'in_stock');

        $inventoryItem->update([
            'quantity' => $newQty,
            'status' => $status,
        ]);

        // Trigger notification if low stock or out of stock
        if ($newQty <= $inventoryItem->reorder_threshold) {
            Notification::create([
                'title' => "⚠️ Low Stock Alert: {$inventoryItem->name}",
                'message' => "Stock level for '{$inventoryItem->name}' has dropped to {$newQty} {$inventoryItem->unit} (Reorder Threshold: {$inventoryItem->reorder_threshold}). Please reorder from {$inventoryItem->supplier_name}.",
                'type' => 'alert',
                'target_role' => 'all',
                'is_read' => false,
            ]);
        }

        return redirect()->back()->with('message', "Recorded usage of {$validated['amount']} {$inventoryItem->unit} of '{$inventoryItem->name}'. Remaining stock: {$newQty}");
    }

    /**
     * Delete an inventory item.
     */
    public function destroy(InventoryItem $inventoryItem)
    {
        $inventoryItem->delete();

        return redirect()->back()->with('message', 'Inventory item removed.');
    }
}
