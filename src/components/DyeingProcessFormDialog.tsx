import { useState, useMemo, useEffect } from 'react';
import type { DyeingProcessData, DyeingProcessCreatePayload, DyeingProcessUpdatePayload } from '../model/dyeing_process';

import { format } from 'date-fns';
import { Calendar as CalendarIcon, Save, Loader2, Clock } from 'lucide-react';
import { cn, parseIndonesianNumber, formatNumber } from '@/lib/utils';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dropdown, type DropdownItem } from './Dropdown';
import { useQuery } from '@tanstack/react-query';
import { getInventories } from '@/service/inventory';

type CreateUpdateDyeingProcessFormDialogProps = {
    process?: DyeingProcessData;
    onSave: (data: DyeingProcessCreatePayload | DyeingProcessUpdatePayload) => Promise<void> | void;
    closeDialog: () => void;
};

const statusOptions: DropdownItem[] = [
    { value: 'false', label: 'Belum Celup' },
    { value: 'true', label: 'Sudah Celup' },
];

export const CreateUpdateDyeingProcessFormDialog = ({
    process,
    onSave,
    closeDialog,
}: CreateUpdateDyeingProcessFormDialogProps) => {
    
    const [selectedProductId, setSelectedProductId] = useState('');
    const [dyeingWeight, setDyeingWeight] = useState('0');
    const [dyeingRoll, setDyeingRoll] = useState('0');
    const [dyeingStatus, setDyeingStatus] = useState('false');
    const [endDate, setEndDate] = useState<Date | undefined>(undefined);
    const [endTime, setEndTime] = useState({ hours: '', minutes: '' });
    const [finalWeight, setFinalWeight] = useState('0');
    const [overheadCost, setOverheadCost] = useState('0');
    const [note, setNote] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // Fetch fabric products only
    const { data: productData, isLoading: isProductsLoading } = useQuery({
        queryKey: ['inventories-fabric'],
        queryFn: () => getInventories({ type: 'fabric' }, 1, 9999),
    });

    useEffect(() => {
        if (process) {
            setSelectedProductId(process.product.id);
            setDyeingWeight(formatNumber(process.dyeing_weight));
            setDyeingRoll(formatNumber(process.dyeing_roll_count))
            setDyeingStatus(String(process.dyeing_status));
            setNote(process.dyeing_note || '');
            
            if (process.end_date) {
                const endDateTime = new Date(process.end_date);
                setEndDate(endDateTime);
                setEndTime({
                    hours: String(endDateTime.getHours()).padStart(2, '0'),
                    minutes: String(endDateTime.getMinutes()).padStart(2, '0'),
                });
            } else {
                setEndDate(undefined);
                setEndTime({ hours: '', minutes: '' });
            }
            
            setFinalWeight(process.dyeing_final_weight ? formatNumber(process.dyeing_final_weight) : '0');
            setOverheadCost(process.dyeing_overhead_cost ? formatNumber(process.dyeing_overhead_cost) : '0');
        } else {
            setSelectedProductId('');
            setDyeingRoll('0')
            setDyeingWeight('0');
            setDyeingStatus('false');
            setEndDate(undefined);
            setEndTime({ hours: '', minutes: '' });
            setFinalWeight('0');
            setOverheadCost('0');
            setNote('');
        }
    }, [process]);

    const isStatusTrue = dyeingStatus === 'true';
    
    const isFormInvalid = process 
        ? (isStatusTrue && (!endDate || (parseIndonesianNumber(finalWeight) || 0) <= 0 || (parseIndonesianNumber(overheadCost) || 0) < 0))
        : (!selectedProductId || (parseIndonesianNumber(dyeingWeight) || 0) <= 0);

    const handleSubmit = async () => {
        setIsSaving(true);
        
        if (process) {
            // Update mode
            let endDateTime: string | undefined = undefined;
            if (isStatusTrue && endDate) {
                const year = endDate.getFullYear();
                const month = String(endDate.getMonth() + 1).padStart(2, '0');
                const day = String(endDate.getDate()).padStart(2, '0');
                const hours = endTime.hours.padStart(2, '0');
                const minutes = endTime.minutes.padStart(2, '0');
                endDateTime = `${year}-${month}-${day}T${hours}:${minutes}:00`;
            }

            const dataToSave: DyeingProcessUpdatePayload = {
                dyeing_status: isStatusTrue || undefined,
                end_date: endDateTime,
                dyeing_final_weight: isStatusTrue ? (parseIndonesianNumber(finalWeight) || 0) : undefined,
                dyeing_overhead_cost: isStatusTrue ? (parseIndonesianNumber(overheadCost) || 0) : undefined,
                dyeing_note: note || undefined,
                dyeing_roll_count: parseIndonesianNumber(dyeingRoll) || undefined,
            };
            await onSave(dataToSave);
        } else {
            // Create mode
            const dataToSave: DyeingProcessCreatePayload = {
                product_id: selectedProductId,
                dyeing_weight: parseIndonesianNumber(dyeingWeight) || 0,
                dyeing_note: note || undefined,
                dyeing_roll_count: parseIndonesianNumber(dyeingRoll) || 0
            };
            await onSave(dataToSave);
        }
        
        closeDialog();
        setIsSaving(false);
    };

    const productOptions = useMemo(() => 
        (productData?.items || []).map(p => ({ value: p.id, label: p.name }))
    , [productData]);

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
                <DialogTitle>{process ? 'Edit Proses Celup' : 'Catat Proses Celup Baru'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-6">
                {!process ? (
                    <>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="product" className="text-right">Nama Kain</Label>
                            <Dropdown 
                                items={productOptions} 
                                value={selectedProductId} 
                                onChange={setSelectedProductId} 
                                placeholder='Pilih kain...' 
                                isLoading={isProductsLoading} 
                                className="col-span-3" 
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dyeing_weight" className="col-span-1 text-right">Berat Awal (Kg)</Label>
                            <Input 
                                id="dyeing_weight" 
                                type="text"
                                inputMode="decimal"
                                value={dyeingWeight} 
                                onChange={(e) => handleNumberChange(e, setDyeingWeight)} 
                                className="col-span-3" 
                                placeholder="e.g., 100" 
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="dyeing_roll" className="col-span-1 text-right">Jumlah Roll</Label>
                            <Input 
                                id="dyeing_roll" 
                                type="text"
                                inputMode="decimal"
                                value={dyeingRoll} 
                                onChange={(e) => handleNumberChange(e, setDyeingRoll)} 
                                className="col-span-3" 
                                placeholder="e.g., 100" 
                            />
                        </div>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="note" className="text-right">Catatan</Label>
                            <Textarea
                                id="note"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="col-span-3"
                                placeholder="Catatan proses celup (opsional)"
                                rows={3}
                            />
                        </div>
                    </>
                ) : (
                    <>
                        <Card className="bg-gray-50 dark:bg-gray-900/50">
                            <CardHeader>
                                <CardTitle className="text-base">Detail Proses</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Nama Kain:</span>
                                    <span className="font-medium">{process.product.name}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Berat Awal:</span>
                                    <span className="font-medium">{formatNumber(process.dyeing_weight)} Kg</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Jumlah Rol:</span>
                                    <span className="font-medium">{formatNumber(process.dyeing_roll_count)}</span>
                                </div>
                                {process.dyeing_note && (
                                    <div className="pt-2 border-t">
                                        <p className="text-gray-500 mb-1">Catatan:</p>
                                        <p className="text-xs">{process.dyeing_note}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="status" className="text-right">Status</Label>
                            <Dropdown 
                                items={statusOptions} 
                                value={dyeingStatus} 
                                onChange={setDyeingStatus} 
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
                                    <Label htmlFor="final_weight" className="text-right">Berat Akhir (Kg)</Label>
                                    <Input 
                                        id="final_weight" 
                                        type="text"
                                        inputMode="decimal"
                                        value={finalWeight} 
                                        onChange={(e) => handleNumberChange(e, setFinalWeight)} 
                                        className="col-span-3" 
                                        placeholder="e.g., 95" 
                                    />
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="dyeing_roll" className="text-right">Jumlah Rol Akhir</Label>
                                    <Input 
                                        id="dyeing_roll" 
                                        type="text"
                                        inputMode="decimal"
                                        value={dyeingRoll} 
                                        onChange={(e) => handleNumberChange(e, setDyeingRoll)} 
                                        className="col-span-3" 
                                        placeholder="e.g., 95" 
                                    />
                                </div>

                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="overhead_cost" className="text-right">Biaya Overhead</Label>
                                    <Input 
                                        id="overhead_cost" 
                                        type="text"
                                        inputMode="decimal"
                                        value={overheadCost} 
                                        onChange={(e) => handleNumberChange(e, setOverheadCost)} 
                                        className="col-span-3" 
                                        placeholder="e.g., 500000" 
                                    />
                                </div>
                            </>
                        )}

                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="note_update" className="text-right">Catatan</Label>
                            <Textarea
                                id="note_update"
                                value={note}
                                onChange={(e) => setNote(e.target.value)}
                                className="col-span-3"
                                placeholder="Catatan proses celup (opsional)"
                                rows={3}
                            />
                        </div>
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