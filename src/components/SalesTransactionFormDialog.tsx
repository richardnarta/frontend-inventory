import { useState, useMemo, useEffect } from 'react';
import type { SalesTransactionCreateRequest } from '../model/sales_transaction';
import { type DropdownItem, Dropdown } from './Dropdown';
import { LazyDropdown } from './LazyDropdown';
import { type InventoryData } from '../model/inventory';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Save, Loader2 } from 'lucide-react';
import { parseIndonesianNumber, formatNumber } from '../lib/utils';
import { getInventoryById, getInventories } from '../service/inventory';

type CreateSalesTransactionFormDialogProps = {
    onSave: (data: SalesTransactionCreateRequest) => Promise<void> | void;
    closeDialog: () => void;
    buyers: DropdownItem[];
    inventories: DropdownItem[];
    isBuyersLoading: boolean;
    isInventoriesLoading: boolean;
};

export const CreateSalesTransactionFormDialog = ({
    onSave,
    closeDialog,
    buyers,
    isBuyersLoading,
}: CreateSalesTransactionFormDialogProps) => {

    const initialFormState = useMemo(() => ({
        transaction_date: new Date(),
        buyer_id: '',
        inventory_id: '',
        quantity: '0',
        price_per_unit: '0',
    }), []);

    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false);
    const [salesType, setSalesType] = useState<'eceran' | 'grosir'>('eceran');
    const [selectedInventory, setSelectedInventory] = useState<InventoryData | null>(null);
    const [isLoadingInventory, setIsLoadingInventory] = useState(false);

    // Fetch inventory details when inventory_id changes
    useEffect(() => {
        const fetchInventoryDetails = async () => {
            if (formData.inventory_id) {
                setIsLoadingInventory(true);
                try {
                    const inventory = await getInventoryById(formData.inventory_id);
                    setSelectedInventory(inventory);
                    // Don't auto-fill price here, wait for salesType change
                } catch (error) {
                    setSelectedInventory(null);
                } finally {
                    setIsLoadingInventory(false);
                }
            } else {
                setSelectedInventory(null);
            }
        };
        fetchInventoryDetails();
    }, [formData.inventory_id]);

    // Auto-fill price when inventory or sales type changes
    useEffect(() => {
        if (selectedInventory) {
            const price = salesType === 'grosir'
                ? selectedInventory.harga_jual_grosir
                : selectedInventory.harga_jual_eceran;
            setFormData(prev => ({
                ...prev,
                price_per_unit: formatNumber(price)
            }));
        }
    }, [selectedInventory, salesType]);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        let cleanedValue = value.replace(/[^\d,]/g, '');
        const parts = cleanedValue.split(',');
        if (parts.length > 2) cleanedValue = parts[0] + ',' + parts.slice(1).join('');
        if (cleanedValue === '') {
            setFormData(prev => ({ ...prev, [id]: '0' }));
            return;
        }
        const [integerPart, decimalPart] = cleanedValue.split(',');
        const formattedInteger = new Intl.NumberFormat('id-ID').format(Number(integerPart.replace(/\./g, '')));
        let finalValue = formattedInteger;
        if (decimalPart !== undefined) finalValue += ',' + decimalPart;
        setFormData(prev => ({ ...prev, [id]: finalValue }));
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        const quantity = parseIndonesianNumber(formData.quantity) || 0;
        const price_per_unit = parseIndonesianNumber(formData.price_per_unit) || 0;

        const dataToSave: SalesTransactionCreateRequest = {
            transaction_date: format(formData.transaction_date, "yyyy-MM-dd'T'HH:mm:ss"),
            buyer_id: parseInt(formData.buyer_id, 10),
            inventory_id: formData.inventory_id,
            quantity,
            // quantity_unit removed - backend auto-fills from inventory
            price_per_unit,
            total_price: quantity * price_per_unit,
        };
        await onSave(dataToSave);
        closeDialog();
        setIsSaving(false);
    };

    const isFormValid = formData.transaction_date && formData.buyer_id && formData.inventory_id &&
        parseIndonesianNumber(formData.price_per_unit) > 0 && parseIndonesianNumber(formData.quantity) > 0;

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Tambah Transaksi Penjualan Baru</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="transaction_date" className="text-right">Tgl. Transaksi</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal", !formData.transaction_date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.transaction_date ? format(formData.transaction_date, "dd-MM-yyyy") : <span>Pilih tanggal</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={formData.transaction_date} onSelect={(date) => setFormData(prev => ({ ...prev, transaction_date: date || new Date() }))} disabled={(date) => date > new Date() || date < new Date("1900-01-01")} />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="buyer_id" className="text-right">Nama Pembeli</Label>
                    <Dropdown items={buyers} value={formData.buyer_id} onChange={(value) => setFormData(prev => ({ ...prev, buyer_id: value }))} placeholder='Pilih pembeli' searchPlaceholder='Cari pembeli...' emptyMessage='Pembeli tidak ditemukan' isLoading={isBuyersLoading} className="col-span-3" />
                </div>


                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="inventory_id" className="text-right">Nama Barang</Label>
                    <LazyDropdown
                        value={formData.inventory_id}
                        onChange={(value) => setFormData(prev => ({ ...prev, inventory_id: value }))}
                        placeholder='Pilih barang'
                        searchPlaceholder='Cari nama barang...'
                        emptyMessage='Barang tidak ditemukan'
                        onSearch={async (query) => {
                            const results = await getInventories(
                                { nama_barang: query },
                                1,
                                20 // Only load 20 items at a time
                            );
                            return results.items.map(item => ({
                                value: item.kode_barang,
                                label: item.nama_barang
                            }));
                        }}
                        className="col-span-3"
                    />
                </div>


                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">Jumlah</Label>
                    <div className="col-span-3 flex gap-2 items-center">
                        <Input
                            id="quantity"
                            type="text"
                            inputMode="decimal"
                            value={formData.quantity}
                            onChange={handleNumberChange}
                            className="flex-1"
                            placeholder="e.g., 100"
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400 min-w-[60px]">
                            {isLoadingInventory ? '...' : selectedInventory ? selectedInventory.quantity_unit : '-'}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="sales_type" className="text-right">Tipe Penjualan</Label>
                    <Select value={salesType} onValueChange={(value) => setSalesType(value as 'eceran' | 'grosir')}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Pilih tipe" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="eceran">Eceran</SelectItem>
                            <SelectItem value="grosir">Grosir</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price_per_unit" className="text-right">Harga per Unit</Label>
                    <Input id="price_per_unit" type="text" inputMode="decimal" value={formData.price_per_unit} onChange={handleNumberChange} className="col-span-3" placeholder="e.g., 7.000" />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>Kembali</Button>
                <Button onClick={handleSubmit} disabled={isSaving || !isFormValid}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};
