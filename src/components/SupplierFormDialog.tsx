import { useState, useMemo } from 'react';
import type { SupplierData, SupplierCreatePayload, SupplierUpdatePayload } from '../model/supplier';

import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Save, Loader2 } from 'lucide-react';

type CreateUpdateSupplierFormDialogProps = {
    supplier?: SupplierData;
    onSave: (data: SupplierCreatePayload | SupplierUpdatePayload) => Promise<void> | void;
    closeDialog: () => void;
};

export const CreateUpdateSupplierFormDialog = ({
    supplier,
    onSave,
    closeDialog,
}: CreateUpdateSupplierFormDialogProps) => {

    const initialFormState = useMemo(() => ({
        name: supplier?.name || '',
        phone_num: supplier?.phone_num || '',
    }), [supplier]);

    const [formData, setFormData] = useState(initialFormState);
    const [isSaving, setIsSaving] = useState(false);

    const isUnchanged = useMemo(() => {
        return JSON.stringify(formData) === JSON.stringify(initialFormState);
    }, [formData, initialFormState]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        const dataToSave = {
            ...formData,
            phone_num: formData.phone_num || null,
        };
        await onSave(dataToSave);
        closeDialog();
        setIsSaving(false);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    {supplier ? 'Edit Data Supplier' : 'Tambah Data Supplier Baru'}
                </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Nama Supplier</Label>
                    <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" spellCheck="false" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="phone_num" className="text-right">No. Telepon</Label>
                    <Input id="phone_num" value={formData.phone_num ?? ''} onChange={handleChange} className="col-span-3" placeholder="(Opsional)" spellCheck="false" />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                    Kembali
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving || isUnchanged || !formData.name}>
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