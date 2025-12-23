import { useState, useMemo } from 'react';
import { type InventoryData, type QuantityUnit } from '../model/inventory';

import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import {
    Save, Loader2
} from 'lucide-react';

import { parseIndonesianNumber, formatNumber } from '../lib/utils';


type CreateUpdateInventoryFormDialogProps = {
    product?: InventoryData;
    onSave: (data: InventoryData) => Promise<void> | void;
    closeDialog: () => void;
};


export const CreateUpdateInventoryFormDialog = ({
    product,
    onSave,
    closeDialog,
}: CreateUpdateInventoryFormDialogProps) => {

    const initialFormState = useMemo(() => ({
        kode_barang: product?.kode_barang || '',
        nama_barang: product?.nama_barang || '',
        quantity: product?.quantity ? formatNumber(product.quantity) : '',
        quantity_unit: product?.quantity_unit || 'buah' as QuantityUnit,
        harga_modal: product?.harga_modal ? formatNumber(product.harga_modal) : '',
        harga_jual_eceran: product?.harga_jual_eceran ? formatNumber(product.harga_jual_eceran) : '',
        harga_jual_grosir: product?.harga_jual_grosir ? formatNumber(product.harga_jual_grosir) : '',
    }), [product]);

    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false);

    const isUnchanged = useMemo(() => {
        return JSON.stringify(formData) === JSON.stringify(initialFormState);
    }, [formData, initialFormState]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;

        let cleanedValue = value.replace(/[^\d,]/g, '');
        const parts = cleanedValue.split(',');
        if (parts.length > 2) {
            cleanedValue = parts[0] + ',' + parts.slice(1).join('');
        }

        if (cleanedValue === '') {
            setFormData(prev => ({ ...prev, [id]: '' }));
            return;
        }

        const [integerPart, decimalPart] = cleanedValue.split(',');

        const formattedInteger = new Intl.NumberFormat('id-ID').format(
            Number(integerPart.replace(/\./g, ''))
        );

        let finalValue = formattedInteger;
        if (decimalPart !== undefined) {
            finalValue += ',' + decimalPart;
        }

        setFormData(prev => ({ ...prev, [id]: finalValue }));
    };

    const handleUnitChange = (value: string) => {
        setFormData(prev => ({ ...prev, quantity_unit: value as QuantityUnit }));
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        const dataToSave: InventoryData = {
            kode_barang: product ? product.kode_barang : formData.kode_barang.toUpperCase(),
            nama_barang: formData.nama_barang,
            quantity: parseIndonesianNumber(formData.quantity) || 0,
            quantity_unit: formData.quantity_unit,
            harga_modal: parseIndonesianNumber(formData.harga_modal) || 0,
            harga_jual_eceran: parseIndonesianNumber(formData.harga_jual_eceran) || 0,
            harga_jual_grosir: parseIndonesianNumber(formData.harga_jual_grosir) || 0,
        };

        await onSave(dataToSave);
        closeDialog();
        setIsSaving(false);
    };

    const isFormValid = formData.kode_barang !== '' && formData.nama_barang !== '';

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>
                    {product ? `Edit Data Barang` : `Tambah Barang Baru`}
                </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="kode_barang" className="text-right">Kode Barang</Label>
                    <Input
                        id="kode_barang"
                        value={formData.kode_barang}
                        onChange={handleChange}
                        className="col-span-3"
                        disabled={!!product}
                        spellCheck="false"
                        placeholder="e.g., BRG001"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="nama_barang" className="text-right">Nama Barang</Label>
                    <Input
                        id="nama_barang"
                        value={formData.nama_barang}
                        onChange={handleChange}
                        className="col-span-3"
                        spellCheck="false"
                        placeholder="e.g., Produk A"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity" className="text-right">Jumlah Stok</Label>
                    <Input
                        id="quantity"
                        type="numeric"
                        value={formData.quantity}
                        onChange={handleNumberChange}
                        className="col-span-3"
                        placeholder="e.g., 100"
                        spellCheck="false"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="quantity_unit" className="text-right">Satuan</Label>
                    <Select value={formData.quantity_unit} onValueChange={handleUnitChange}>
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
                    <Label htmlFor="harga_modal" className="text-right">Harga Modal</Label>
                    <Input
                        id="harga_modal"
                        type="numeric"
                        value={formData.harga_modal}
                        onChange={handleNumberChange}
                        className="col-span-3"
                        placeholder="e.g., 5.000"
                        spellCheck="false"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="harga_jual_eceran" className="text-right">Harga Eceran</Label>
                    <Input
                        id="harga_jual_eceran"
                        type="numeric"
                        value={formData.harga_jual_eceran}
                        onChange={handleNumberChange}
                        className="col-span-3"
                        placeholder="e.g., 7.000"
                        spellCheck="false"
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="harga_jual_grosir" className="text-right">Harga Grosir</Label>
                    <Input
                        id="harga_jual_grosir"
                        type="numeric"
                        value={formData.harga_jual_grosir}
                        onChange={handleNumberChange}
                        className="col-span-3"
                        placeholder="e.g., 6.000"
                        spellCheck="false"
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                    Kembali
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving || isUnchanged || !isFormValid}>
                    {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Save className="mr-2 h-4 w-4" />
                    )}
                    Simpan
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};