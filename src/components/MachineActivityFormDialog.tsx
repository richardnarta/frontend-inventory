import { useState, useMemo } from 'react';
import type { MachineActivityData, MachineActivityCreatePayload, MachineActivityUpdatePayload } from '../model/machine_activity';
import type { DropdownItem } from './Dropdown';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Save, Loader2 } from 'lucide-react';
import { parseIndonesianNumber, formatNumber } from '../lib/utils';
import { Dropdown } from './Dropdown';

type CreateUpdateMachineActivityFormDialogProps = {
    activity?: MachineActivityData;
    onSave: (data: MachineActivityCreatePayload | MachineActivityUpdatePayload) => Promise<void> | void;
    closeDialog: () => void;
    inventories: DropdownItem[];
    isInventoriesLoading: boolean;
    machineId: number;
};

export const CreateUpdateMachineActivityFormDialog = ({
    activity,
    onSave,
    closeDialog,
    inventories,
    isInventoriesLoading,
    machineId,
}: CreateUpdateMachineActivityFormDialogProps) => {

    const initialFormState = useMemo(() => ({
        date: activity ? new Date(activity.date) : new Date(),
        inventory_id: activity?.inventory.id || '',
        lot: activity?.lot || '',
        operator: activity?.operator || '',
        damaged_thread: activity?.damaged_thread ? formatNumber(activity.damaged_thread) : '0',
        product_weight: activity?.product_weight ? formatNumber(activity.product_weight) : '0',
        note: activity?.note || '',
    }), [activity]);

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
    
    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { id, value } = e.target;
        setFormData(prev => ({ ...prev, [id]: value }));
    };

    const handleSubmit = async () => {
        setIsSaving(true);
        const dataToSave = {
            machine_id: machineId, // Automatically use the machineId from props
            inventory_id: formData.inventory_id,
            date: format(formData.date, "yyyy-MM-dd"),
            lot: formData.lot,
            operator: formData.operator,
            damaged_thread: parseIndonesianNumber(formData.damaged_thread) || 0,
            product_weight: parseIndonesianNumber(formData.product_weight) || 0,
            note: formData.note || null,
        };
        await onSave(dataToSave);
        closeDialog();
        setIsSaving(false);
    };

    return (
        <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
                <DialogTitle>
                    {activity ? 'Edit Aktivitas Mesin' : 'Tambah Aktivitas Mesin Baru'}
                </DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">Tanggal</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal", !formData.date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {formData.date ? format(formData.date, "dd-MM-yyyy") : <span>Pilih tanggal</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar mode="single" selected={formData.date} onSelect={(d) => setFormData(p => ({ ...p, date: d || new Date() }))} disabled={(d) => d > new Date() || d < new Date("1900-01-01")} />
                        </PopoverContent>
                    </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="inventory_id" className="text-left">Produksi</Label>
                    <Dropdown items={inventories} value={formData.inventory_id} onChange={(v) => setFormData(p => ({...p, inventory_id: v}))} placeholder='Pilih kain' isLoading={isInventoriesLoading} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="lot" className="text-left">Lot</Label>
                    <Input id="lot" value={formData.lot} onChange={handleChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="operator" className="text-left">Operator</Label>
                    <Input id="operator" value={formData.operator} onChange={handleChange} className="col-span-3" />
                </div>
                 <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="damaged_thread" className="text-left">Benang Putus</Label>
                    <Input id="damaged_thread" value={formData.damaged_thread} onChange={handleNumberChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="product_weight" className="text-right">Hasil (Kg)</Label>
                    <Input id="product_weight" value={formData.product_weight} onChange={handleNumberChange} className="col-span-3" />
                </div>
                <div className="grid grid-cols-4 items-start gap-4">
                    <Label htmlFor="note" className="text-left pt-2">Keterangan</Label>
                    <Textarea id="note" value={formData.note ?? ''} onChange={handleChange} className="col-span-3" />
                </div>
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>Batal</Button>
                <Button onClick={handleSubmit} disabled={isSaving || isUnchanged || !formData.inventory_id || !formData.lot || !formData.operator}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};
