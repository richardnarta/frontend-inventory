// components/AccountReceivableFormDialog.tsx
import { useState, useMemo } from 'react';
import { 
    type AccountReceivableData, 
    type AccountReceivableCreatePayload, 
    type AccountReceivableUpdatePayload 
} from '../model/account_receivable';
import { type DropdownItem, Dropdown } from './Dropdown';

import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Save, Loader2 } from 'lucide-react';
import { parseIndonesianNumber, formatNumber } from '../lib/utils';

type CreateUpdateAccountReceivableFormDialogProps = {
    buyers: DropdownItem[];
    receivable?: AccountReceivableData;
    onSave: (data: AccountReceivableCreatePayload | AccountReceivableUpdatePayload) => Promise<void> | void;
    closeDialog: () => void;
};

export const CreateUpdateAccountReceivableFormDialog = ({
    buyers,
    receivable,
    onSave,
    closeDialog
}: CreateUpdateAccountReceivableFormDialogProps) => {
    const initialFormState = useMemo(() => ({
        buyer_id: receivable?.buyer?.id ? String(receivable.buyer.id) : '',
        period: receivable?.period || '',
        age_0_30_days: receivable?.age_0_30_days ? formatNumber(receivable.age_0_30_days) : '0',
        age_31_60_days: receivable?.age_31_60_days ? formatNumber(receivable.age_31_60_days) : '0',
        age_61_90_days: receivable?.age_61_90_days ? formatNumber(receivable.age_61_90_days) : '0',
        age_over_90_days: receivable?.age_over_90_days ? formatNumber(receivable.age_over_90_days) : '0',
    }), [receivable]);

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
            setFormData(prev => ({ ...prev, [id]: '0' }));
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
        const dataToSave = {
            buyer_id: parseInt(formData.buyer_id, 10),
            period: formData.period,
            age_0_30_days: parseIndonesianNumber(formData.age_0_30_days) || 0,
            age_31_60_days: parseIndonesianNumber(formData.age_31_60_days) || 0,
            age_61_90_days: parseIndonesianNumber(formData.age_61_90_days) || 0,
            age_over_90_days: parseIndonesianNumber(formData.age_over_90_days) || 0,
        };
        await onSave(dataToSave);
        closeDialog();
        setIsSaving(false);
    };

    return (
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>
                    {receivable ? 'Edit Data Piutang' : 'Tambah Data Piutang Baru'}
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
                        className='col-span-3'
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="period" className="text-right">Periode</Label>
                    <Input 
                        id="period" 
                        value={formData.period} 
                        onChange={handleChange} 
                        className="col-span-3" 
                        placeholder="e.g., Oct-25" 
                        spellCheck="false" 
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="age_0_30_days" className="text-right">0-30 Hari</Label>
                    <Input 
                        id="age_0_30_days" 
                        type="text" 
                        inputMode="decimal" 
                        value={formData.age_0_30_days} 
                        onChange={handleNumberChange} 
                        className="col-span-3" 
                        placeholder="e.g., 1.500.000" 
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="age_31_60_days" className="text-right">31-60 Hari</Label>
                    <Input 
                        id="age_31_60_days" 
                        type="text" 
                        inputMode="decimal" 
                        value={formData.age_31_60_days} 
                        onChange={handleNumberChange} 
                        className="col-span-3" 
                        placeholder="e.g., 2.000.000" 
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="age_61_90_days" className="text-right">61-90 Hari</Label>
                    <Input 
                        id="age_61_90_days" 
                        type="text" 
                        inputMode="decimal" 
                        value={formData.age_61_90_days} 
                        onChange={handleNumberChange} 
                        className="col-span-3" 
                        placeholder="e.g., 500.000" 
                    />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="age_over_90_days" className="text-right">&gt;90 Hari</Label>
                    <Input 
                        id="age_over_90_days" 
                        type="text" 
                        inputMode="decimal" 
                        value={formData.age_over_90_days} 
                        onChange={handleNumberChange} 
                        className="col-span-3" 
                        placeholder="e.g., 100.000" 
                    />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>
                    Kembali
                </Button>
                <Button onClick={handleSubmit} disabled={isSaving || isUnchanged || !formData.buyer_id || !formData.period}>
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