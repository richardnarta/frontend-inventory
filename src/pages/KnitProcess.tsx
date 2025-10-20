import { useState, useMemo, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { RotateCcw, Plus, Pencil, Trash2, Loader2, Calendar as CalendarIcon, BookText } from 'lucide-react';
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";

import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Badge } from "@/components/ui/badge";

import { keepPreviousData, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PageHeading } from '@/components/PageHeading';
import { Pagination } from '@/components/Pagination';
import { DeleteConfirmationDialog } from '@/components/DeleteDialog';
import { Dropdown } from '@/components/Dropdown';
import { CreateUpdateKnitProcessFormDialog } from '@/components/KnitProcessFormDialog';

import { getKnitFormulas } from '@/service/knit_formula';
import { createKnitProcess, deleteKnitProcessById, getKnitProcesses, updateKnitProcess } from '@/service/knit_process';
import type { KnittingProcessCreatePayload, KnittingProcessData, KnittingProcessUpdatePayload } from '@/model/knit_process';
import { cn, formatNumber } from '@/lib/utils';

const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd-MM-yyyy HH:mm");
};

export const KnitProcessPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProcess, setEditingProcess] = useState<KnittingProcessData | undefined>(undefined);
    
    const [formulaId, setFormulaId] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const [searchParams, setSearchParams] = useSearchParams();

    const itemsPerPage = 10;
    const queryClient = useQueryClient();

    const createFormulaId = searchParams.get('create');
    
    const formattedDateRange = {
        start_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    };

    const { data: processData, isLoading, error } = useQuery({
        queryKey: ['knit-processes', { formulaId, ...formattedDateRange, currentPage }],
        queryFn: () => getKnitProcesses({ 
            knit_formula_id: formulaId ? parseInt(formulaId) : undefined, 
            ...formattedDateRange 
        }, currentPage, itemsPerPage),
        placeholderData: keepPreviousData,
    });

    const { data: formulaData, isLoading: isFormulasLoading } = useQuery({
        queryKey: ['knit-formulas-all'],
        queryFn: () => getKnitFormulas(1, 9999),
    });

    const createMutation = useMutation({
        mutationFn: createKnitProcess,
        onSuccess: () => {
            toast.success(`Proses rajut baru berhasil dicatat.`);
            queryClient.invalidateQueries({ queryKey: ['knit-processes'] });
        },
        onError: (err) => { toast.error(err.message); },
    });

    const updateMutation = useMutation({
        mutationFn: (vars: { id: number, data: KnittingProcessUpdatePayload }) => updateKnitProcess(vars.id, vars.data),
        onSuccess: () => {
            toast.success(`Proses rajut berhasil diubah.`);
            queryClient.invalidateQueries({ queryKey: ['knit-processes'] });
        },
        onError: (err) => { toast.error(err.message); },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteKnitProcessById,
        onSuccess: () => {
            toast.success(`Proses rajut berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['knit-processes'] });
        },
        onError: (err) => { toast.error(err.message); },
    });

    const handleSave = async (data: KnittingProcessCreatePayload | KnittingProcessUpdatePayload) => {
        if (editingProcess) {
            updateMutation.mutate({ id: editingProcess.id, data: data as KnittingProcessUpdatePayload });
        } else {
            createMutation.mutate(data as KnittingProcessCreatePayload);
        }
    };

    useEffect(() => {
        if (createFormulaId) {
            setEditingProcess(undefined);
            setIsFormOpen(true);
        }
    }, [createFormulaId]);
    
    const handleDelete = (id: number) => deleteMutation.mutate(id);
    const handleReset = () => {
        setFormulaId('');
        setDateRange(undefined);
    };

    const openAddDialog = () => {
        setEditingProcess(undefined);
        setIsFormOpen(true);
    };

    const openEditDialog = (process: KnittingProcessData) => {
        setEditingProcess(process);
        setIsFormOpen(true);
    };

    const closeDialog = () => {
        setEditingProcess(undefined);
        setIsFormOpen(false);

        setSearchParams({}, { replace: true });
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            closeDialog();
        } else {
            setIsFormOpen(true);
        }
    };

    const processes = processData?.items ?? [];
    const totalPages = processData?.total_pages ?? 1;
    const formulaOptions = useMemo(() => 
        (formulaData?.items || []).map(f => ({ value: String(f.id), label: f.product.name }))
    , [formulaData]);

    return (
        <Dialog open={isFormOpen} onOpenChange={handleOpenChange}>
            <PageHeading headingTitle="Menu Rajut" actionButton={() => {}}/>

            <div className="bg-white dark:bg-gray-950 border p-4 rounded-xl shadow-sm mb-4">
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <Label className="block mb-2">Nama Kain (Formula)</Label>
                        <Dropdown items={formulaOptions} value={formulaId} onChange={setFormulaId} placeholder='Semua Formula' isLoading={isFormulasLoading} />
                    </div>
                    <div>
                         <Label className="block mb-2">Rentang Tanggal Mulai</Label>
                         <Popover>
                            <PopoverTrigger asChild><Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (dateRange.to ? (`${format(dateRange.from, "dd LLL y")} - ${format(dateRange.to, "dd LLL y")}`) : format(dateRange.from, "dd LLL y")) : (<span>Pilih tanggal</span>)}
                            </Button></PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start"><Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2}/></PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-wrap gap-4 col-span-1 md:col-span-2 justify-start md:justify-end">
                        <Button variant="outline" onClick={handleReset}>
                            <RotateCcw className="mr-2 h-4 w-4" />Reset Filter
                        </Button>
                        <Button className="bg-blue-500 hover:bg-blue-600" onClick={openAddDialog}>
                            <Plus className="mr-2 h-4 w-4" />Tambah Proses Rajut
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex justify-start mb-4">
                <Link to="/rajut/formula">
                    <Button className="bg-blue-500 hover:bg-blue-600">
                        <BookText className="mr-2 h-4 w-4" /> Daftar Formula Rajut
                    </Button>
                </Link>
            </div>

            {isLoading ? (
                <div className="w-full h-96 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : error ? (
                <div className="text-center p-8 text-red-500 bg-red-50 border rounded-xl shadow-sm">Error: {error.message}</div>
            ) : !processes.length ? (
                <div className="text-center p-8 text-gray-500 bg-gray-50 border rounded-xl shadow-sm">Belum ada proses rajut yang dicatat.</div>
            ) : (
                <div>
                    <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden hidden md:block">
                        <Table>
                            <TableHeader><TableRow className="bg-blue-200 hover:bg-blue-200">
                                <TableHead className="pl-6 py-4">Tanggal Mulai</TableHead>
                                <TableHead>Tanggal Selesai</TableHead>
                                <TableHead>Nama Kain</TableHead>
                                <TableHead>Bahan Terpakai</TableHead>
                                <TableHead>Operator</TableHead>
                                <TableHead className="max-w-[200px]">Mesin</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="text-right">Berat (Kg)</TableHead>
                                <TableHead className="text-right">Jumlah Rol</TableHead>
                                <TableHead className="text-center">Aksi</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {processes.map((data) => (
                                    <TableRow key={data.id}>
                                        <TableCell className='pl-6'>{formatDateTime(data.start_date)}</TableCell>
                                        <TableCell>{data.end_date ? formatDateTime(data.end_date) : '-'}</TableCell>
                                        <TableCell>{data.knit_formula.product.name}</TableCell>
                                        <TableCell className='py-4'>
                                            <ul className="space-y-1">
                                                {data.materials.map((item, index) => (
                                                    <li key={index} className="text-s">
                                                        <span className="font-mono text-xs text-gray-500">({item.inventory_id})</span> {item.inventory_name} : <span className="font-semibold">{formatNumber(item.amount_kg, {maximumFractionDigits: 2})} Kg</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </TableCell>
                                        <TableCell>{data.operator.name}</TableCell>
                                        <TableCell className="max-w-[200px]">
                                            <div className="break-words whitespace-normal">
                                                {data.machine.name}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            {data.knit_status ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">Sudah Rajut</Badge>
                                            ) : (
                                                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200">Belum Rajut</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">{formatNumber(data.weight_kg)}</TableCell>
                                        <TableCell className="text-right font-semibold">{formatNumber(data.roll_count)}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {!data.knit_status && (
                                                    <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title="Hapus catatan proses rajut ini?">
                                                    <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                                </DeleteConfirmationDialog>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="grid gap-4 md:hidden">
                        {processes.map((data) => (
                            <Card key={data.id}>
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center">
                                        <span>{data.knit_formula.product.name}</span>
                                        {data.knit_status ? (
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">Sudah Rajut</Badge>
                                        ) : (
                                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200">Belum Rajut</Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3 text-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <span className="font-semibold text-gray-500">Tanggal Mulai:</span>
                                        <span>{formatDateTime(data.start_date)}</span>
                                        <span className="font-semibold text-gray-500">Tanggal Selesai:</span>
                                        <span>{data.end_date ? formatDateTime(data.end_date) : '-'}</span>
                                        <span className="font-semibold text-gray-500">Operator:</span>
                                        <span>{data.operator.name}</span>
                                        <span className="font-semibold text-gray-500">Mesin:</span>
                                        <span>{data.machine.name}</span>
                                        <span className="font-semibold text-gray-500">Berat:</span>
                                        <span className="font-semibold">{formatNumber(data.weight_kg)} Kg</span>
                                    </div>
                                    <div className="pt-2 border-t">
                                        <p className="font-semibold text-gray-500 mb-2">Bahan Terpakai:</p>
                                        <ul className="space-y-1 pl-4 list-disc">
                                            {data.materials.map((item, index) => (
                                                <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                                    <span className="font-mono text-xs">({item.inventory_id})</span> {item.inventory_name} : <span className="font-semibold">{formatNumber(item.amount_kg, {maximumFractionDigits: 2})} Kg</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    {!data.knit_status && (
                                        <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title="Hapus catatan proses rajut ini?">
                                        <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                    </DeleteConfirmationDialog>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className='mt-6'/>
                </div>
            )}
            
            {isFormOpen && (
                <CreateUpdateKnitProcessFormDialog
                    process={editingProcess}
                    onSave={handleSave}
                    formulas={formulaData?.items || []}
                    isFormulasLoading={isFormulasLoading}
                    closeDialog={closeDialog}
                    initialFormulaId={searchParams.get('create') || undefined}
                />
            )}
        </Dialog>
    );
};