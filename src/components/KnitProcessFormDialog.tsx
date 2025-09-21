import { useState, useMemo, useEffect } from 'react';
import type { KnittingProcessData, KnittingProcessCreatePayload, KnittingProcessUpdatePayload } from '../model/knit_process';
import type { KnitFormulaData, FormulaItem } from '@/model/knit_formula';

import { format } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn, parseIndonesianNumber, formatNumber } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Save, Loader2 } from 'lucide-react';
import { Dropdown } from './Dropdown';

type CreateUpdateKnitProcessFormDialogProps = {
    process?: KnittingProcessData;
    onSave: (data: KnittingProcessCreatePayload | KnittingProcessUpdatePayload) => Promise<void> | void;
    closeDialog: () => void;
    formulas: KnitFormulaData[];
    isFormulasLoading: boolean;
    initialFormulaId?: string;
};

export const CreateUpdateKnitProcessFormDialog = ({
    process,
    onSave,
    closeDialog,
    formulas,
    isFormulasLoading,
    initialFormulaId,
}: CreateUpdateKnitProcessFormDialogProps) => {
    
    const [selectedFormulaId, setSelectedFormulaId] = useState('');
    const [date, setDate] = useState<Date>(new Date());
    const [actualWeight, setActualWeight] = useState('0');
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (process) {
            setSelectedFormulaId(String(process.knit_formula.id));
            setDate(new Date(process.date));
            setActualWeight(formatNumber(process.weight_kg));
        } else if (initialFormulaId) {
            setSelectedFormulaId(initialFormulaId);
            setDate(new Date());
            setActualWeight('0');
        } else {
            setSelectedFormulaId('');
            setDate(new Date());
            setActualWeight('0');
        }
    }, [process, initialFormulaId]);

    const selectedFormula = useMemo(() => {
        return formulas.find(f => f.id === Number(selectedFormulaId));
    }, [selectedFormulaId, formulas]);

    const finalMaterials = useMemo((): FormulaItem[] => {
        if (!selectedFormula || !selectedFormula.production_weight) {
            return [];
        }
        const weight = parseIndonesianNumber(actualWeight) || 0;
        if (weight <= 0) {
            return selectedFormula.formula; // Return original if actual weight is 0
        }
        const ratio = weight / selectedFormula.production_weight;
        return selectedFormula.formula.map(material => ({
            ...material,
            amount_kg: material.amount_kg * ratio,
        }));
    }, [selectedFormula, actualWeight]);

    const isFormInvalid = !selectedFormulaId || (parseIndonesianNumber(actualWeight) || 0) <= 0;

    const handleSubmit = async () => {
        setIsSaving(true);
        const dataToSave = {
            knit_formula_id: Number(selectedFormulaId),
            date: format(date, "yyyy-MM-dd"),
            weight_kg: parseIndonesianNumber(actualWeight) || 0,
        };
        await onSave(dataToSave);
        closeDialog();
        setIsSaving(false);
    };

    const formulaOptions = useMemo(() => 
        formulas.map(f => ({ value: String(f.id), label: f.product.name }))
    , [formulas]);

    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader><DialogTitle>{process ? 'Edit Proses Rajut' : 'Catat Proses Rajut Baru'}</DialogTitle></DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="date" className="text-right">Tanggal Rajut</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"} className={cn("col-span-3 justify-start text-left font-normal", !date && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "dd-MM-yyyy") : <span>Pilih tanggal</span>}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0"><Calendar mode="single" selected={date} onSelect={(d) => setDate(d || new Date())} disabled={(d) => d > new Date() || d < new Date("1900-01-01")} /></PopoverContent>
                    </Popover>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="formula" className="text-right">Formula Kain</Label>
                    <Dropdown items={formulaOptions} value={selectedFormulaId} onChange={setSelectedFormulaId} placeholder='Pilih formula...' isLoading={isFormulasLoading} className="col-span-3" disabled={!!process} />
                </div>

                {selectedFormula && (
                    <Card className="bg-gray-50 dark:bg-gray-900/50">
                        <CardHeader><CardTitle className="text-base">Resep Standar</CardTitle><CardDescription>Formula asli untuk {formatNumber(selectedFormula.production_weight)} Kg kain.</CardDescription></CardHeader>
                        <CardContent><ul className="space-y-1 text-sm">
                            {selectedFormula.formula.map(item => <li key={item.inventory_id} className="flex justify-between"><span>- {item.inventory_name}</span><span className="font-medium">{formatNumber(item.amount_kg)} Kg</span></li>)}
                        </ul></CardContent>
                    </Card>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="weight_kg" className="col-span-2 text-right">Jumlah Produksi (Kg)</Label>
                    <Input id="weight_kg" value={actualWeight} onChange={e => setActualWeight(e.target.value)} className="col-span-2" placeholder="e.g., 100" />
                </div>

                {finalMaterials.length > 0 && (
                    <Card>
                        <CardHeader><CardTitle className="text-base">Bahan Terpakai</CardTitle><CardDescription>Kalkulasi bahan untuk {formatNumber(parseIndonesianNumber(actualWeight))} Kg kain.</CardDescription></CardHeader>
                        <CardContent><ul className="space-y-1 text-sm">
                            {finalMaterials.map(item => <li key={item.inventory_id} className="flex justify-between"><span>- {item.inventory_name}</span><span className="font-semibold text-blue-600 dark:text-blue-400">{formatNumber(item.amount_kg, {maximumFractionDigits: 2})} Kg</span></li>)}
                        </ul></CardContent>
                    </Card>
                )}
            </div>
            <DialogFooter>
                <Button type="button" variant="outline" onClick={closeDialog}>Batal</Button>
                <Button onClick={handleSubmit} disabled={isSaving || isFormInvalid}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Simpan
                </Button>
            </DialogFooter>
        </DialogContent>
    );
};

