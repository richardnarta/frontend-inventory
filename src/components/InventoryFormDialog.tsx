import { useState, useMemo } from 'react';
import { type InventoryData } from '../model/inventory';

import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

import {
  Save, Loader2
} from 'lucide-react';

import { parseIndonesianNumber, formatNumber, capitalize } from '../lib/utils';


type CreateUpdateInventoryFormDialogProps = {
    typeMessage: string,
    product?: InventoryData;
    onSave: (data: Omit<InventoryData, 'total' | 'type'>) => Promise<void> | void;
    closeDialog: () => void;
};


export const CreateUpdateInventoryFormDialog = ({
    typeMessage,
    product,
    onSave,
    closeDialog,
}: CreateUpdateInventoryFormDialogProps) => {
    
    const initialFormState = useMemo(() => ({
        id: product?.id || '',
        name: product?.name || '',
        roll_count: product?.roll_count ? formatNumber(product.roll_count) : 0,
        weight_kg: product?.weight_kg ? formatNumber(product.weight_kg) : 0,
        bale_count: product?.bale_count ? formatNumber(product.bale_count) : 0,
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

    const handleSubmit = async () => {
        setIsSaving(true);
        const dataToSave: Omit<InventoryData, 'total' | 'type'> = {
            id: product ? product.id : formData.id,
            name: formData.name,
            roll_count: parseIndonesianNumber(formData.roll_count) || 0,
            weight_kg: parseIndonesianNumber(formData.weight_kg) || 0,
            bale_count: parseIndonesianNumber(formData.bale_count) || 0,
        };

        await onSave(dataToSave);
        closeDialog();
        setIsSaving(false);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    {
                        product ? 
                        `Edit Data ${capitalize(typeMessage)}` 
                        : `Tambah ${capitalize(typeMessage)} Baru`
                    }
                </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="id" className="text-right">Kode barang</Label>
                    <Input id="id" value={formData.id} onChange={handleChange} className="col-span-3" disabled={!!product} spellCheck="false"/>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Nama barang</Label>
                    <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" spellCheck="false"/>
                </div>
                {(typeMessage === 'kain') ? (
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="roll_count" className="text-right">Jumlah Roll</Label>
                        <Input id="roll_count" type="numeric" value={formData.roll_count} onChange={handleNumberChange} className="col-span-3" placeholder="e.g., 10" spellCheck="false"/>
                    </div>
                ):<div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="bale_count" className="text-right">Jumlah Bale</Label>
                    <Input id="bale_count" type="numeric" value={formData.bale_count} onChange={handleNumberChange} className="col-span-3" placeholder="e.g., 5" spellCheck="false"/>
                </div>}
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="weight_kg" className="text-right">Berat (Kg)</Label>
                    <Input id="weight_kg" type="numeric" step="any" value={formData.weight_kg} onChange={handleNumberChange} className="col-span-3" placeholder="e.g., 22,5" spellCheck="false"/>
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                    Kembali
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving || isUnchanged || formData.id == '' || formData.name == ''}>
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