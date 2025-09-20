import { useState, useMemo } from 'react';
import type { MachineData, MachineCreatePayload, MachineUpdatePayload } from '../model/machine';

import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Save, Loader2 } from 'lucide-react';

type CreateUpdateMachineFormDialogProps = {
    machine?: MachineData;
    onSave: (data: MachineCreatePayload | MachineUpdatePayload) => Promise<void> | void;
    closeDialog: () => void;
};

export const CreateUpdateMachineFormDialog = ({
    machine,
    onSave,
    closeDialog,
}: CreateUpdateMachineFormDialogProps) => {

    const initialFormState = useMemo(() => ({
        name: machine?.name || '',
    }), [machine]);

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
        await onSave(formData);
        closeDialog();
        setIsSaving(false);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>
                    {machine ? 'Edit Data Mesin' : 'Tambah Data Mesin Baru'}
                </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="name" className="text-right">Nama Mesin</Label>
                    <Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" spellCheck="false" />
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
