import { useState, useMemo, useEffect } from 'react';
import type { KnittingProcessData, KnittingProcessCreatePayload, KnittingProcessUpdatePayload } from '../model/knit_process';
import type { KnitFormulaData, FormulaItem } from '@/model/knit_formula';

import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save, Loader2, Clock } from 'lucide-react';
import { cn, parseIndonesianNumber, formatNumber } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Dropdown, type DropdownItem } from './Dropdown';
import { useQuery } from '@tanstack/react-query';
import { getOperators } from '@/service/operator';
import { getMachines } from '@/service/machine';

type CreateUpdateKnitProcessFormDialogProps = {
    process?: KnittingProcessData;
    onSave: (data: KnittingProcessCreatePayload | KnittingProcessUpdatePayload) => Promise<void> | void;
    closeDialog: () => void;
    formulas: KnitFormulaData[];
    isFormulasLoading: boolean;
    initialFormulaId?: string;
};

const statusOptions: DropdownItem[] = [
    { value: 'false', label: 'Belum Rajut' },
    { value: 'true', label: 'Sudah Rajut' },
];

export const CreateUpdateKnitProcessFormDialog = ({
    process,
    onSave,
    closeDialog,
    formulas,
    isFormulasLoading,
    initialFormulaId,
}: CreateUpdateKnitProcessFormDialogProps) => {
    
    const [selectedFormulaId, setSelectedFormulaId] = useState('');
    const [selectedOperatorId, setSelectedOperatorId] = useState('');
    const [selectedMachineId, setSelectedMachineId] = useState('');
    const [actualWeight, setActualWeight] = useState('0');
    const [rollCount, setRollCount] = useState('');
    const [knitStatus, setKnitStatus] = useState('false');
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [endTime, setEndTime] = useState({ hours: '', minutes: '' });
    const [isSaving, setIsSaving] = useState(false);

    // Fetch operators and machines
    const { data: operatorData, isLoading: isOperatorsLoading } = useQuery({
        queryKey: ['operators-all'],
        queryFn: () => getOperators({}, 1, 9999),
    });

    const { data: machineData, isLoading: isMachinesLoading } = useQuery({
        queryKey: ['machines-all'],
        queryFn: () => getMachines({}, 1, 9999),
    });

    useEffect(() => {
        if (process) {
            setSelectedFormulaId(String(process.knit_formula.id));
            setSelectedOperatorId(String(process.operator.id));
            setSelectedMachineId(String(process.machine.id));
            setActualWeight(formatNumber(process.weight_kg));
            setKnitStatus(String(process.knit_status));
            if (process.end_date) {
                const endDateTime = new Date(process.end_date);
                setEndDate(endDateTime);
                setEndTime({
                    hours: String(endDateTime.getHours()).padStart(2, '0'),
                    minutes: String(endDateTime.getMinutes()).padStart(2, '0'),
                });
                setRollCount(formatNumber(process.roll_count))
            } else {
                setEndDate(undefined);
                setEndTime({ hours: '', minutes: '' });
            }
        } else if (initialFormulaId) {
            setSelectedFormulaId(initialFormulaId);
            setSelectedOperatorId('');
            setSelectedMachineId('');
            setActualWeight('0');
            setKnitStatus('false');
            setEndDate(undefined);
            setEndTime({ hours: '', minutes: '' });
        } else {
            setSelectedFormulaId('');
            setSelectedOperatorId('');
            setSelectedMachineId('');
            setActualWeight('0');
            setKnitStatus('false');
            setEndDate(undefined);
            setEndTime({ hours: '', minutes: '' });
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
            return selectedFormula.formula;
        }
        const ratio = weight / selectedFormula.production_weight;
        return selectedFormula.formula.map(material => ({
            ...material,
            amount_kg: material.amount_kg * ratio,
        }));
    }, [selectedFormula, actualWeight]);

    const isStatusTrue = knitStatus === 'true';
    const isFormInvalid = process 
        ? (isStatusTrue && !endDate && !rollCount) // For update: if status is true, end_date is required
        : (!selectedFormulaId || !selectedOperatorId || !selectedMachineId || (parseIndonesianNumber(actualWeight) || 0) <= 0); // For create

    const handleSubmit = async () => {
        setIsSaving(true);
        
        if (process) {
            // Update mode
            let endDateTime: string | undefined = undefined;
            if (isStatusTrue && endDate && rollCount) {
                const year = endDate.getFullYear();
                const month = String(endDate.getMonth() + 1).padStart(2, '0');
                const day = String(endDate.getDate()).padStart(2, '0');
                const hours = endTime.hours.padStart(2, '0');
                const minutes = endTime.minutes.padStart(2, '0');
                // Send as local datetime without timezone (no 'Z' suffix)
                endDateTime = `${year}-${month}-${day}T${hours}:${minutes}:00`;
            }

            const dataToSave: KnittingProcessUpdatePayload = {
                operator_id: Number(selectedOperatorId) || undefined,
                machine_id: Number(selectedMachineId) || undefined,
                knit_status: isStatusTrue || undefined,
                end_date: endDateTime,
                roll_count: parseIndonesianNumber(rollCount)
            };
            await onSave(dataToSave);
        } else {
            // Create mode
            const dataToSave: KnittingProcessCreatePayload = {
                knit_formula_id: Number(selectedFormulaId),
                operator_id: Number(selectedOperatorId),
                machine_id: Number(selectedMachineId),
                weight_kg: parseIndonesianNumber(actualWeight) || 0,
            };
            await onSave(dataToSave);
        }
        
        closeDialog();
        setIsSaving(false);
    };

    const formulaOptions = useMemo(() => 
        formulas.map(f => ({ value: String(f.id), label: f.product.name }))
    , [formulas]);

    const operatorOptions = useMemo(() => 
        (operatorData?.items || []).map(o => ({ value: String(o.id), label: o.name }))
    , [operatorData]);

    const machineOptions = useMemo(() => 
        (machineData?.items || []).map(m => ({ value: String(m.id), label: m.name }))
    , [machineData]);

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>, setter: (value: string) => void) => {
        const { value } = e.target;
        let cleanedValue = value.replace(/[^\d,]/g, '');
        const parts = cleanedValue.split(',');
        if (parts.length > 2) cleanedValue = parts[0] + ',' + parts.slice(1).join('');
        if (cleanedValue === '') {
            setter('');
            return;
        }
        const [integerPart, decimalPart] = cleanedValue.split(',');
        const formattedInteger = new Intl.NumberFormat('id-ID').format(Number(integerPart.replace(/\./g, '')));
        let finalValue = formattedInteger;
        if (decimalPart !== undefined) finalValue += ',' + decimalPart;
        setter(finalValue);
    };

    return (
        <DialogContent className="sm:max-w-2xl">
            <DialogHeader>
                <DialogTitle>{process ? 'Edit Proses Rajut' : 'Catat Proses Rajut Baru'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                {!process && (
                    <>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="formula" className="text-right">Formula Kain</Label>
                            <Dropdown 
                                items={formulaOptions} 
                                value={selectedFormulaId} 
                                onChange={setSelectedFormulaId} 
                                placeholder='Pilih formula...' 
                                isLoading={isFormulasLoading} 
                                className="col-span-3" 
                            />
                        </div>

                        {selectedFormula && (
                            <Card className="bg-gray-50 dark:bg-gray-900/50">
                                <CardHeader>
                                    <CardTitle className="text-base">Resep Standar</CardTitle>
                                    <CardDescription>Formula asli untuk {formatNumber(selectedFormula.production_weight)} Kg kain.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-1 text-sm">
                                        {selectedFormula.formula.map(item => 
                                            <li key={item.inventory_id} className="flex justify-between">
                                                <span>- {item.inventory_name}</span>
                                                <span className="font-medium">{formatNumber(item.amount_kg)} Kg</span>
                                            </li>
                                        )}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="weight_kg" className="col-span-1 text-left">Jumlah Produksi (Kg)</Label>
                            <Input 
                                id="weight_kg" 
                                value={actualWeight} 
                                onChange={e => setActualWeight(e.target.value)} 
                                className="col-span-3" 
                                placeholder="e.g., 100" 
                            />
                        </div>

                        {finalMaterials.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-base">Bahan Terpakai</CardTitle>
                                    <CardDescription>Kalkulasi bahan untuk {formatNumber(parseIndonesianNumber(actualWeight))} Kg kain.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ul className="space-y-1 text-sm">
                                        {finalMaterials.map(item => 
                                            <li key={item.inventory_id} className="flex justify-between">
                                                <span>- {item.inventory_name}</span>
                                                <span className="font-semibold text-blue-600 dark:text-blue-400">
                                                    {formatNumber(item.amount_kg, {maximumFractionDigits: 2})} Kg
                                                </span>
                                            </li>
                                        )}
                                    </ul>
                                </CardContent>
                            </Card>
                        )}
                    </>
                )}

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="operator" className="text-right">Operator</Label>
                    <Dropdown 
                        items={operatorOptions} 
                        value={selectedOperatorId} 
                        onChange={setSelectedOperatorId} 
                        placeholder='Pilih operator...' 
                        isLoading={isOperatorsLoading} 
                        className="col-span-3" 
                        disabled={!!process}
                    />
                </div>

                <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="machine" className="text-right">Mesin</Label>
                    <Dropdown 
                        items={machineOptions} 
                        value={selectedMachineId} 
                        onChange={setSelectedMachineId} 
                        placeholder='Pilih mesin...' 
                        isLoading={isMachinesLoading} 
                        className="col-span-3" 
                        disabled={!!process}
                    />
                </div>

                {process && (
                    <>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status</Label>
                            <Dropdown 
                                items={statusOptions} 
                                value={knitStatus} 
                                onChange={setKnitStatus} 
                                className="col-span-3" 
                            />
                        </div>

                        {isStatusTrue && (
                            <>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="end_date" className="text-right">Tanggal Selesai</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button 
                                                variant={"outline"} 
                                                className={cn(
                                                    "col-span-3 justify-start text-left font-normal", 
                                                    !endDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {endDate ? format(endDate, "dd-MM-yyyy") : <span>Pilih tanggal selesai</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar 
                                                mode="single" 
                                                selected={endDate} 
                                                onSelect={(d) => setEndDate(d || undefined)} 
                                                disabled={(d) => d > new Date() || d < new Date("1900-01-01")} 
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="end_time" className="text-right">Waktu Selesai</Label>
                                    <div className="col-span-3 flex items-center gap-2">
                                        <Clock className="h-4 w-4 text-gray-500" />
                                        <Input
                                            id="end_hours"
                                            type="number"
                                            min="0"
                                            max="23"
                                            value={endTime.hours}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '') {
                                                    setEndTime(prev => ({ ...prev, hours: '00' }));
                                                } else if (parseInt(val) >= 0 && parseInt(val) <= 23) {
                                                    setEndTime(prev => ({ ...prev, hours: val }));
                                                }
                                            }}
                                            onBlur={(e) => {
                                                const val = e.target.value;
                                                if (val !== '') {
                                                    setEndTime(prev => ({ ...prev, hours: val.padStart(2, '0') }));
                                                }
                                            }}
                                            className="w-20 text-center"
                                            placeholder="00"
                                        />
                                        <span className="text-lg font-semibold">:</span>
                                        <Input
                                            id="end_minutes"
                                            type="number"
                                            min="0"
                                            max="59"
                                            value={endTime.minutes}
                                            onChange={(e) => {
                                                const val = e.target.value;
                                                if (val === '') {
                                                    setEndTime(prev => ({ ...prev, minutes: '00' }));
                                                } else if (parseInt(val) >= 0 && parseInt(val) <= 59) {
                                                    setEndTime(prev => ({ ...prev, minutes: val }));
                                                }
                                            }}
                                            onBlur={(e) => {
                                                const val = e.target.value;
                                                if (val !== '') {
                                                    setEndTime(prev => ({ ...prev, minutes: val.padStart(2, '0') }));
                                                }
                                            }}
                                            className="w-20 text-center"
                                            placeholder="00"
                                        />
                                        <span className="text-sm text-gray-500">(HH:MM)</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="knit_roll" className="col-span-1 text-right">Jumlah Rol</Label>
                                    <Input 
                                        id="knit_roll" 
                                        type="text"
                                        inputMode="decimal"
                                        value={rollCount} 
                                        onChange={(e) => handleNumberChange(e, setRollCount)} 
                                        className="col-span-3" 
                                        placeholder="e.g., 100" 
                                    />
                                </div>
                            </>
                        )}

                        <Card className="bg-gray-50 dark:bg-gray-900/50">
                            <CardHeader>
                                <CardTitle className="text-base">Detail Proses</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Formula:</span>
                                    <span className="font-medium">{process.knit_formula.product.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Berat Produksi:</span>
                                    <span className="font-medium">{formatNumber(process.weight_kg)} Kg</span>
                                </div>
                                <div className="pt-2 border-t">
                                    <p className="font-semibold mb-1">Bahan Terpakai:</p>
                                    <ul className="space-y-1 pl-4">
                                        {process.materials.map(item => 
                                            <li key={item.inventory_id} className="flex justify-between text-xs">
                                                <span>- {item.inventory_name}</span>
                                                <span>{formatNumber(item.amount_kg, {maximumFractionDigits: 2})} Kg</span>
                                            </li>
                                        )}
                                    </ul>
                                </div>
                            </CardContent>
                        </Card>
                    </>
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