import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import { Trash2 } from 'lucide-react';
import { formatNumber, parseIndonesianNumber } from '../lib/utils';
import { getInventoryById } from '../service/inventory';
import type { InventoryData } from '../model/inventory';
import { LazyDropdown } from './LazyDropdown';
import { getInventories } from '../service/inventory';
import type { DropdownItem } from './Dropdown';

export interface TransactionItem {
    tempId: string;  // Temporary ID for React keys
    inventory_id: string;
    quantity: number;
    price_per_unit: number;
    // Runtime data (fetched and calculated):
    inventory?: InventoryData;
    subtotal?: number;
}

interface TransactionItemsTableProps {
    items: TransactionItem[];
    onChange: (items: TransactionItem[]) => void;
    priceType?: 'wholesale' | 'retail'; // 'wholesale' = harga_modal (purchase), 'retail' = harga_jual_eceran (sales)
}

export function TransactionItemsTable({ items, onChange, priceType = 'wholesale' }: TransactionItemsTableProps) {
    const [selectedInventoryId, setSelectedInventoryId] = useState<string>('');
    const [loadingInventoryIds, setLoadingInventoryIds] = useState<Set<string>>(new Set());

    // Fetch inventory details for items that don't have it yet
    useEffect(() => {
        const fetchInventoryDetails = async () => {
            const itemsNeedingData = items.filter(
                item => !item.inventory && item.inventory_id && !loadingInventoryIds.has(item.inventory_id)
            );

            for (const item of itemsNeedingData) {
                setLoadingInventoryIds(prev => new Set(prev).add(item.inventory_id));

                try {
                    const inventoryData = await getInventoryById(item.inventory_id);
                    if (inventoryData) {
                        onChange(
                            items.map(i =>
                                i.tempId === item.tempId
                                    ? { ...i, inventory: inventoryData }
                                    : i
                            )
                        );
                    }
                } catch (error) {
                    console.error(`Failed to fetch inventory ${item.inventory_id}:`, error);
                } finally {
                    setLoadingInventoryIds(prev => {
                        const newSet = new Set(prev);
                        newSet.delete(item.inventory_id);
                        return newSet;
                    });
                }
            }
        };

        fetchInventoryDetails();
    }, [items]); // eslint-disable-line react-hooks/exhaustive-deps

    const addItem = async (inventoryId: string) => {
        if (!inventoryId) return;

        // Check if item already exists
        if (items.some(item => item.inventory_id === inventoryId)) {
            alert('Item sudah ada dalam daftar!');
            return;
        }

        // Fetch inventory data
        try {
            const inventoryData = await getInventoryById(inventoryId);

            // Determine initial price based on transaction type
            let initialPrice = 0;
            if (priceType === 'wholesale') {
                initialPrice = inventoryData.harga_modal; // Use cost price for purchases
            } else if (priceType === 'retail') {
                initialPrice = inventoryData.harga_jual_eceran; // Use retail price for sales
            }

            const newItem: TransactionItem = {
                tempId: crypto.randomUUID(),
                inventory_id: inventoryId,
                quantity: 1,
                price_per_unit: initialPrice,
                inventory: inventoryData,
                subtotal: initialPrice
            };

            onChange([...items, newItem]);
            setSelectedInventoryId(''); // Clear selection
        } catch (error) {
            console.error('Failed to add item:', error);
            alert('Gagal menambahkan item');
        }
    };

    const updateItem = (tempId: string, field: keyof TransactionItem, value: any) => {
        onChange(
            items.map(item => {
                if (item.tempId === tempId) {
                    const updated = { ...item, [field]: value };
                    // Recalculate subtotal
                    updated.subtotal = updated.quantity * updated.price_per_unit;
                    return updated;
                }
                return item;
            })
        );
    };

    const deleteItem = (tempId: string) => {
        onChange(items.filter(item => item.tempId !== tempId));
    };

    const handleNumberChange = (
        e: React.ChangeEvent<HTMLInputElement>,
        tempId: string,
        field: 'quantity' | 'price_per_unit'
    ) => {
        const value = parseIndonesianNumber(e.target.value);
        if (!isNaN(value) && value >= 0) {
            updateItem(tempId, field, value);
        }
    };

    const totalAmount = items.reduce((sum, item) => {
        return sum + (item.quantity * item.price_per_unit);
    }, 0);

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <div className="space-y-4">
            {/* Add Item Section */}
            <div className="flex gap-2 items-end">
                <div className="flex-1">
                    <label className="text-sm font-medium">Tambah Item</label>
                    <LazyDropdown
                        value={selectedInventoryId}
                        onChange={setSelectedInventoryId}
                        placeholder="Pilih barang..."
                        onSearch={async (searchTerm: string) => {
                            const response = await getInventories(
                                { nama_barang: searchTerm },
                                1,
                                50
                            );
                            return response.items.map((inv): DropdownItem => ({
                                value: inv.kode_barang,
                                label: `${inv.kode_barang} - ${inv.nama_barang}`
                            }));
                        }}
                    />
                </div>
                <Button
                    type="button"
                    onClick={() => addItem(selectedInventoryId)}
                    disabled={!selectedInventoryId}
                >
                    + Tambah
                </Button>
            </div>

            {/* Items Table */}
            {items.length > 0 ? (
                <>
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">No</TableHead>
                                    <TableHead>Nama Barang</TableHead>
                                    <TableHead className="w-32">Jumlah</TableHead>
                                    <TableHead className="w-20">Unit</TableHead>
                                    <TableHead className="w-40">Harga/Unit</TableHead>
                                    <TableHead className="text-right w-40">Subtotal</TableHead>
                                    <TableHead className="w-16"></TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {items.map((item, index) => (
                                    <TableRow key={item.tempId}>
                                        <TableCell className="font-medium">{index + 1}</TableCell>
                                        <TableCell>
                                            {item.inventory ? (
                                                <div>
                                                    <div className="font-medium">{item.inventory.nama_barang}</div>
                                                    <div className="text-sm text-muted-foreground">{item.inventory.kode_barang}</div>
                                                </div>
                                            ) : (
                                                <div className="text-sm text-muted-foreground">Loading...</div>
                                            )}
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="text"
                                                value={formatNumber(item.quantity)}
                                                onChange={(e) => handleNumberChange(e, item.tempId, 'quantity')}
                                                className="text-right"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <span className="text-sm">{item.inventory?.quantity_unit || '-'}</span>
                                        </TableCell>
                                        <TableCell>
                                            <Input
                                                type="text"
                                                value={formatNumber(item.price_per_unit)}
                                                onChange={(e) => handleNumberChange(e, item.tempId, 'price_per_unit')}
                                                className="text-right"
                                            />
                                        </TableCell>
                                        <TableCell className="text-right font-medium">
                                            Rp {formatNumber(item.quantity * item.price_per_unit)}
                                        </TableCell>
                                        <TableCell>
                                            <Button
                                                type="button"
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => deleteItem(item.tempId)}
                                                className="text-destructive hover:text-destructive"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    {/* Summary */}
                    <div className="flex justify-end gap-8 px-4 py-3 bg-muted/50 rounded-lg">
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">Total Item</div>
                            <div className="text-lg font-semibold">{formatNumber(totalItems)}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-muted-foreground">Total Harga</div>
                            <div className="text-lg font-semibold text-primary">
                                Rp {formatNumber(totalAmount)}
                            </div>
                        </div>
                    </div>
                </>
            ) : (
                <div className="text-center py-8 text-muted-foreground border rounded-lg border-dashed">
                    Belum ada item. Gunakan dropdown di atas untuk menambah item.
                </div>
            )}
        </div>
    );
}
