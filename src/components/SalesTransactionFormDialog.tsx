import { useState, useMemo } from 'react';
import type { SalesTransactionData, SalesTransactionCreatePayload, SalesTransactionUpdatePayload } from '../model/sales_transaction';
import { type DropdownItem, Dropdown } from './Dropdown';

import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import { Save, Loader2 } from 'lucide-react';
import { parseIndonesianNumber, formatNumber } from '../lib/utils';

type CreateUpdateSalesTransactionFormDialogProps = {
    transaction?: SalesTransactionData;
    onSave: (data: SalesTransactionCreatePayload | SalesTransactionUpdatePayload) => Promise<void> | void;
    closeDialog: () => void;
    buyers: DropdownItem[];
    inventories: DropdownItem[];
    isBuyersLoading: boolean;
    isInventoriesLoading: boolean;
};

export const CreateUpdateSalesTransactionFormDialog = ({
    transaction,
    onSave,
    closeDialog,
    buyers,
    inventories,
    isBuyersLoading,
    isInventoriesLoading,
}: CreateUpdateSalesTransactionFormDialogProps) => {

    const initialFormState = useMemo(() => ({
        buyer_id: transaction?.buyer?.id ? String(transaction.buyer.id) : '',
        inventory_id: transaction?.inventory?.id || '',
        roll_count: transaction?.roll_count ? formatNumber(transaction.roll_count) : '0',
        weight_kg: transaction?.weight_kg ? formatNumber(transaction.weight_kg) : '0',
        price_per_kg: transaction?.price_per_kg ? formatNumber(transaction.price_per_kg) : '0',
    }), [transaction]);

    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false);

    const isUnchanged = useMemo(() => {
        return JSON.stringify(formData) === JSON.stringify(initialFormState);
    }, [formData, initialFormState]);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        let cleanedValue = value.replace(/[^\d,]/g, '');
        const parts = cleanedValue.split(',');
        if (parts.length > 2) cleanedValue = parts[0] + ',' + parts.slice(1).join('');
        if (cleanedValue === '') {
            setFormData(prev => ({ ...prev, [id]: '' }));
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
            buyer_id: parseInt(formData.buyer_id, 10),
            inventory_id: formData.inventory_id,
            roll_count: parseIndonesianNumber(formData.roll_count) || 0,
            weight_kg: parseIndonesianNumber(formData.weight_kg) || 0,
            price_per_kg: parseIndonesianNumber(formData.price_per_kg) || 0,
        };
        await onSave(dataToSave);
        closeDialog();
        setIsSaving(false);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    {transaction ? 'Edit Transaksi Penjualan' : 'Tambah Transaksi Penjualan Baru'}
                </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="buyer_id" className="text-right">Nama Pembeli</Label>
                    <Dropdown
                        items={buyers}
                        value={formData.buyer_id}
                        onChange={(value) => setFormData(prev => ({ ...prev, buyer_id: value }))}
                        placeholder='Pilih pembeli'
                        searchPlaceholder='Cari pembeli...'
                        emptyMessage='Pembeli tidak ditemukan'
                        isLoading={isBuyersLoading}
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
                    <Label htmlFor="roll_count" className="text-right">Jumlah Roll</Label>
                    <Input id="roll_count" type="text" inputMode="decimal" value={formData.roll_count} onChange={handleNumberChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="weight_kg" className="text-right">Berat (Kg)</Label>
                    <Input id="weight_kg" type="text" inputMode="decimal" value={formData.weight_kg} onChange={handleNumberChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="price_per_kg" className="text-right">Harga per Kg</Label>
                    <Input id="price_per_kg" type="text" inputMode="decimal" value={formData.price_per_kg} onChange={handleNumberChange} className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>Kembali</Button>
                <Button onClick={handleSubmit} disabled={isSaving || isUnchanged || !formData.buyer_id || !formData.inventory_id || !formData.price_per_kg}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};