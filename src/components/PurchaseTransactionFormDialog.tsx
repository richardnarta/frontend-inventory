import { useState, useMemo } from 'react';
import type { PurchaseTransactionCreateRequest } from '../model/purchase_transaction';
import { type DropdownItem, Dropdown } from './Dropdown';
import { type QuantityUnit } from '../model/inventory';

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
import { parseIndonesianNumber } from '../lib/utils';

type CreatePurchaseTransactionFormDialogProps = {
    onSave: (data: PurchaseTransactionCreateRequest) => Promise<void> | void;
    closeDialog: () => void;
    suppliers: DropdownItem[];
    inventories: DropdownItem[];
    isSuppliersLoading: boolean;
    isInventoriesLoading: boolean;
};

export const CreatePurchaseTransactionFormDialog = ({
    onSave,
    closeDialog,
    suppliers,
    inventories,
    isSuppliersLoading,
    isInventoriesLoading,
}: CreatePurchaseTransactionFormDialogProps) => {

    const initialFormState = useMemo(() => ({
        transaction_date: new Date(),
        supplier_id: '',
        inventory_id: '',
        quantity: '0',
        quantity_unit: 'buah' as QuantityUnit,
        price_per_unit: '0',
    }), []);

    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false);

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

        const dataToSave: PurchaseTransactionCreateRequest = {
            transaction_date: format(formData.transaction_date, "yyyy-MM-dd'T'HH:mm:ss"),
            supplier_id: parseInt(formData.supplier_id, 10),
            inventory_id: formData.inventory_id,
            quantity,
            quantity_unit: formData.quantity_unit,
            price_per_unit,
            total_price: quantity * price_per_unit,
        };
        await onSave(dataToSave);
        closeDialog();
        setIsSaving(false);
    };

    const isFormValid = formData.transaction_date && formData.supplier_id && formData.inventory_id &&
        parseIndonesianNumber(formData.price_per_unit) > 0 && parseIndonesianNumber(formData.quantity) > 0;

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Tambah Transaksi Pembelian Baru</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="transaction_date" className="text-right">Tgl. Transaksi</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button
                                variant={"outline"}
                                className={cn("col-span-3 justify-start text-left font-normal", !formData.transaction_date && "text-muted-foreground")}
                            >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.transaction_date ? format(formData.transaction_date, "dd-MM-yyyy") : <span>Pilih tanggal</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={formData.transaction_date}
                                onSelect={(date) => setFormData(prev => ({ ...prev, transaction_date: date || new Date() }))}
                                disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="supplier_id" className="text-right">Nama Supplier</Label>
                    <Dropdown
                        items={suppliers}
                        value={formData.supplier_id}
                        onChange={(value) => setFormData(prev => ({ ...prev, supplier_id: value }))}
                        placeholder='Pilih supplier'
                        searchPlaceholder='Cari supplier...'
                        emptyMessage='Supplier tidak ditemukan'
                        isLoading={isSuppliersLoading}
                        className="col-span-3"
                    />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="inventory_id" className="text-right">Nama Barang</Label>
                    <Dropdown
                        items={inventories}
                        value={formData.inventory_id}
                        onChange={(value) => setFormData(prev => ({ ...prev, inventory_id: value }))}
                        placeholder='Pilih barang'
                        searchPlaceholder='Cari barang...'
                        emptyMessage='Barang tidak ditemukan'
                        isLoading={isInventoriesLoading}
                        className="col-span-3"
                    />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">Jumlah</Label>
                    <Input
                        id="quantity"
                        type="text"
                        inputMode="decimal"
                        value={formData.quantity}
                        onChange={handleNumberChange}
                        className="col-span-3"
                        placeholder="e.g., 100"
                    />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity_unit" className="text-right">Satuan</Label>
                    <Select value={formData.quantity_unit} onValueChange={(value) => setFormData(prev => ({ ...prev, quantity_unit: value as QuantityUnit }))}>
                        <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Pilih satuan" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="buah">Buah</SelectItem>
                            <SelectItem value="lusin">Lusin</SelectItem>
                            <SelectItem value="kodi">Kodi</SelectItem>
                            <SelectItem value="dus">Dus</SelectItem>
                            <SelectItem value="bal">Bal</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price_per_unit" className="text-right">Harga per Unit</Label>
                    <Input
                        id="price_per_unit"
                        type="text"
                        inputMode="decimal"
                        value={formData.price_per_unit}
                        onChange={handleNumberChange}
                        className="col-span-3"
                        placeholder="e.g., 5.000"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                    Kembali
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving || !isFormValid}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};