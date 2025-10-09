import { useState, useMemo } from 'react';
import type { PurchaseTransactionCreatePayload } from '../model/purchase_transaction';
import { type DropdownItem, Dropdown } from './Dropdown';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';

import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Save, Loader2 } from 'lucide-react';
import { capitalize, parseIndonesianNumber } from '../lib/utils';

type CreatePurchaseTransactionFormDialogProps = {
    typeMessage: string,
    onSave: (data: PurchaseTransactionCreatePayload) => Promise<void> | void;
    closeDialog: () => void;
    suppliers: DropdownItem[];
    inventories: DropdownItem[];
    isSuppliersLoading: boolean;
    isInventoriesLoading: boolean;
};

export const CreatePurchaseTransactionFormDialog = ({
    typeMessage,
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
        bale_count: '0',
        roll_count: '0',
        weight_kg: '0',
        price_per_kg: '0',
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
        const dataToSave = {
            transaction_date: format(formData.transaction_date, "yyyy-MM-dd"),
            supplier_id: parseInt(formData.supplier_id, 10),
            inventory_id: formData.inventory_id,
            bale_count: parseIndonesianNumber(formData.bale_count) || 0,
            roll_count: parseIndonesianNumber(formData.roll_count) || 0,
            weight_kg: parseIndonesianNumber(formData.weight_kg) || 0,
            price_per_kg: parseIndonesianNumber(formData.price_per_kg) || 0,
        };
        await onSave(dataToSave);
        closeDialog();
        setIsSaving(false);
    };

    const isFormValid = formData.transaction_date && formData.supplier_id && formData.inventory_id && 
                        parseIndonesianNumber(formData.price_per_kg) > 0;

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Tambah Transaksi Pembelian {`${capitalize(typeMessage)}`} Baru</DialogTitle>
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
                {(typeMessage === 'kain') ? (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="inventory_id" className="text-right">Nama Kain</Label>
                        <Dropdown 
                            items={inventories} 
                            value={formData.inventory_id} 
                            onChange={(value) => setFormData(prev => ({ ...prev, inventory_id: value }))} 
                            placeholder='Pilih kain' 
                            searchPlaceholder='Cari kain...'
                            emptyMessage='Kain tidak ditemukan'
                            isLoading={isInventoriesLoading} 
                            className="col-span-3" 
                        />
                    </div>
                ):(
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="inventory_id" className="text-right">Nama Benang</Label>
                        <Dropdown 
                            items={inventories} 
                            value={formData.inventory_id} 
                            onChange={(value) => setFormData(prev => ({ ...prev, inventory_id: value }))} 
                            placeholder='Pilih benang' 
                            searchPlaceholder='Cari benang...'
                            emptyMessage='Benang tidak ditemukan'
                            isLoading={isInventoriesLoading} 
                            className="col-span-3" 
                        />
                    </div>
                )}
                {(typeMessage === 'kain') ? (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="roll_count" className="text-right">Jumlah Rol</Label>
                        <Input 
                            id="roll_count" 
                            type="text" 
                            inputMode="decimal" 
                            value={formData.roll_count} 
                            onChange={handleNumberChange} 
                            className="col-span-3" 
                            placeholder="e.g., 50"
                        />
                    </div>
                ):(
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bale_count" className="text-right">Jumlah Bal</Label>
                        <Input 
                            id="bale_count" 
                            type="text" 
                            inputMode="decimal" 
                            value={formData.bale_count} 
                            onChange={handleNumberChange} 
                            className="col-span-3" 
                            placeholder="e.g., 10"
                        />
                    </div>
                )}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="weight_kg" className="text-right">Berat (Kg)</Label>
                    <Input 
                        id="weight_kg" 
                        type="text" 
                        inputMode="decimal" 
                        value={formData.weight_kg} 
                        onChange={handleNumberChange} 
                        className="col-span-3" 
                        placeholder="e.g., 1.000"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price_per_kg" className="text-right">Harga per Kg</Label>
                    <Input 
                        id="price_per_kg" 
                        type="text" 
                        inputMode="decimal" 
                        value={formData.price_per_kg} 
                        onChange={handleNumberChange} 
                        className="col-span-3" 
                        placeholder="e.g., 50.000"
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