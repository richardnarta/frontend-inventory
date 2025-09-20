import { useState, useMemo } from 'react';
import type { PurchaseTransactionData, PurchaseTransactionUpdatePayload } from '../model/purchase_transaction';

import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Save, Loader2 } from 'lucide-react';
import { parseIndonesianNumber, formatNumber, formatDate } from '../lib/utils';
import { Dropdown, type DropdownItem } from './Dropdown';

type DyeingFormDialogProps = {
    transaction: PurchaseTransactionData;
    onSave: (data: PurchaseTransactionUpdatePayload) => Promise<void> | void;
    closeDialog: () => void;
};


const dyeStatusOptions: DropdownItem[] = [
    { value: 'true', label: 'Sudah Dicelup' },
    { value: 'false', label: 'Belum Dicelup' },
];


export const DyeingFormDialog = ({
    transaction,
    onSave,
    closeDialog,
}: DyeingFormDialogProps) => {

    const initialFormState = useMemo(() => ({
        dye_status: transaction.dye_status,
        dye_final_weight: transaction.dye_final_weight ? formatNumber(transaction.dye_final_weight) : '0',
        dye_overhead_cost: transaction.dye_overhead_cost ? formatNumber(transaction.dye_overhead_cost) : '0',
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
            dye_status: formData.dye_status,
            dye_final_weight: parseIndonesianNumber(formData.dye_final_weight) || 0,
            dye_overhead_cost: parseIndonesianNumber(formData.dye_overhead_cost) || 0,
        };
        await onSave(dataToSave);
        closeDialog();
        setIsSaving(false);
    };

    return (
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Update Status Celup</DialogTitle>
            </DialogHeader>

            <Card className="shadow-none border-dashed">
                <CardHeader>
                    <CardTitle className="text-lg">Detail Pembelian</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <div className="font-semibold text-gray-500">Supplier</div>
                    <div>{transaction.supplier?.name || '-'}</div>
                    <div className="font-semibold text-gray-500">Nama Barang</div>
                    <div>{transaction.inventory?.name || '-'}</div>
                    <div className="font-semibold text-gray-500">Tgl. Pembelian</div>
                    <div>{formatDate(transaction.transaction_date)}</div>
                    <div className="font-semibold text-gray-500">Berat Awal (Kg)</div>
                    <div>{formatNumber(transaction.weight_kg)} Kg</div>
                </CardContent>
            </Card>

            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dye_status" className="text-right">Status</Label>
                    <div className="col-span-3">
                        <Dropdown
                            items={dyeStatusOptions}
                            value={String(formData.dye_status)}
                            onChange={(value) => setFormData(prev => ({...prev, dye_status: value === 'true'}))}
                        />
                    </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dye_final_weight" className="text-right">Berat Akhir (Kg)</Label>
                    <Input id="dye_final_weight" type="text" inputMode="decimal" value={formData.dye_final_weight} onChange={handleNumberChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="dye_overhead_cost" className="text-right">Biaya Setting</Label>
                    <Input id="dye_overhead_cost" type="text" inputMode="decimal" value={formData.dye_overhead_cost} onChange={handleNumberChange} className="col-span-3" />
                </div>
            </div>

            <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>Batal</Button>
                <Button onClick={handleSubmit} disabled={isSaving || isUnchanged}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan Perubahan
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

