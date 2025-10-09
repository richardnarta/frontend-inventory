import { useState } from 'react';
import { RotateCcw, Plus, Pencil, Trash2, Loader2, Calendar as CalendarIcon } from 'lucide-react';
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
import { CreateUpdateDyeingProcessFormDialog } from '@/components/DyeingProcessFormDialog';

import { createDyeingProcess, deleteDyeingProcessById, getDyeingProcesses, updateDyeingProcess } from '@/service/dyeing_process';
import type { DyeingProcessCreatePayload, DyeingProcessData, DyeingProcessUpdatePayload } from '@/model/dyeing_process';
import { cn, formatCurrency, formatNumber } from '@/lib/utils';

const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, "dd-MM-yyyy HH:mm");
};

const dyeingStatusOptions = [
    { value: 'true', label: 'Sudah Celup' },
    { value: 'false', label: 'Belum Celup' },
];

export const DyeingProcessPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProcess, setEditingProcess] = useState<DyeingProcessData | undefined>(undefined);
    
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [dyeingStatus, setDyeingStatus] = useState<string>('');

    const itemsPerPage = 10;
    const queryClient = useQueryClient();
    
    const formattedDateRange = {
        start_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    };

    const dyeingStatusBoolean = dyeingStatus === '' ? undefined : dyeingStatus === 'true';

    const { data: processData, isLoading, error } = useQuery({
        queryKey: ['dyeing-processes', { dyeingStatus: dyeingStatusBoolean, ...formattedDateRange, currentPage }],
        queryFn: () => getDyeingProcesses({ 
            dyeing_status: dyeingStatusBoolean,
            ...formattedDateRange 
        }, currentPage, itemsPerPage),
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: createDyeingProcess,
        onSuccess: () => {
            toast.success(`Proses celup baru berhasil dicatat.`);
            queryClient.invalidateQueries({ queryKey: ['dyeing-processes'] });
        },
        onError: (err) => { toast.error(err.message); },
    });

    const updateMutation = useMutation({
        mutationFn: (vars: { id: number, data: DyeingProcessUpdatePayload }) => updateDyeingProcess(vars.id, vars.data),
        onSuccess: () => {
            toast.success(`Proses celup berhasil diubah.`);
            queryClient.invalidateQueries({ queryKey: ['dyeing-processes'] });
        },
        onError: (err) => { toast.error(err.message); },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteDyeingProcessById,
        onSuccess: () => {
            toast.success(`Proses celup berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['dyeing-processes'] });
        },
        onError: (err) => { toast.error(err.message); },
    });

    const handleSave = async (data: DyeingProcessCreatePayload | DyeingProcessUpdatePayload) => {
        if (editingProcess) {
            updateMutation.mutate({ id: editingProcess.id, data: data as DyeingProcessUpdatePayload });
        } else {
            createMutation.mutate(data as DyeingProcessCreatePayload);
        }
    };

    const handleDelete = (id: number) => deleteMutation.mutate(id);
    const handleReset = () => {
        setDyeingStatus('');
        setDateRange(undefined);
    };

    const openAddDialog = () => {
        setEditingProcess(undefined);
        setIsFormOpen(true);
    };

    const openEditDialog = (process: DyeingProcessData) => {
        setEditingProcess(process);
        setIsFormOpen(true);
    };

    const closeDialog = () => {
        setEditingProcess(undefined);
        setIsFormOpen(false);
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

    return (
        <Dialog open={isFormOpen} onOpenChange={handleOpenChange}>
            <PageHeading headingTitle="Menu Celup" actionButton={() => {}}/>

            <div className="bg-white dark:bg-gray-950 border p-4 rounded-xl shadow-sm mb-4">
                <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <Label className="block mb-2">Status Celup</Label>
                        <Dropdown 
                            items={dyeingStatusOptions} 
                            value={dyeingStatus} 
                            onChange={setDyeingStatus} 
                            placeholder='Semua Status' 
                        />
                    </div>
                    <div>
                         <Label className="block mb-2">Rentang Tanggal Mulai</Label>
                         <Popover>
                            <PopoverTrigger asChild><Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (dateRange?.to ? (`${format(dateRange.from, "dd LLL y")} - ${format(dateRange.to, "dd LLL y")}`) : format(dateRange.from, "dd LLL y")) : (<span>Pilih tanggal</span>)}
                            </Button></PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start"><Calendar initialFocus mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2}/></PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-start md:justify-end">
                        <Button variant="outline" onClick={handleReset}>
                            <RotateCcw className="mr-2 h-4 w-4" />Reset Filter
                        </Button>
                        <Button className="bg-blue-500 hover:bg-blue-600" onClick={openAddDialog}>
                            <Plus className="mr-2 h-4 w-4" />Tambah Proses Celup
                        </Button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="w-full h-96 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : error ? (
                <div className="text-center p-8 text-red-500 bg-red-50 border rounded-xl shadow-sm">Error: {error.message}</div>
            ) : !processes.length ? (
                <div className="text-center p-8 text-gray-500 bg-gray-50 border rounded-xl shadow-sm">Belum ada proses celup yang dicatat.</div>
            ) : (
                <div>
                    <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden hidden md:block">
                        <Table>
                            <TableHeader><TableRow className="bg-blue-200 hover:bg-blue-200">
                                <TableHead className="pl-6 py-4">Tanggal Mulai</TableHead>
                                <TableHead>Tanggal Selesai</TableHead>
                                <TableHead>Nama Kain</TableHead>
                                <TableHead className="text-center">Status</TableHead>
                                <TableHead className="max-w-xs">Catatan</TableHead>
                                <TableHead className="text-right">Berat Awal (Kg)</TableHead>
                                <TableHead className="text-right">Berat Akhir (Kg)</TableHead>
                                <TableHead className="text-right">Jumlah Rol</TableHead>
                                <TableHead className="text-right">Biaya Overhead</TableHead>
                                <TableHead className="text-center">Aksi</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {processes.map((data) => (
                                    <TableRow key={data.id}>
                                        <TableCell className='pl-6'>{formatDateTime(data.start_date)}</TableCell>
                                        <TableCell>{data.end_date ? formatDateTime(data.end_date) : '-'}</TableCell>
                                        <TableCell>{data.product.name}</TableCell>
                                        <TableCell className="text-center">
                                            {data.dyeing_status ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">Sudah Celup</Badge>
                                            ) : (
                                                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200">Belum Celup</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="max-w-xs">
                                            <div className="break-words whitespace-normal">
                                                {data.dyeing_note || '-'}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right font-semibold">{formatNumber(data.dyeing_weight)}</TableCell>
                                        <TableCell className="text-right">{data.dyeing_final_weight ? formatNumber(data.dyeing_final_weight) : '-'}</TableCell>
                                        <TableCell className="text-right">{data.dyeing_roll_count ? formatNumber(data.dyeing_roll_count) : '-'}</TableCell>
                                        <TableCell className="text-right">{data.dyeing_overhead_cost ? formatCurrency(data.dyeing_overhead_cost) : '-'}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                {!data.dyeing_status && (
                                                    <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                )}
                                                <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title="Hapus catatan proses celup ini?">
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
                                        <span>{data.product.name}</span>
                                        {data.dyeing_status ? (
                                            <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">Sudah Celup</Badge>
                                        ) : (
                                            <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200">Belum Celup</Badge>
                                        )}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2 text-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                        <span className="font-semibold text-gray-500">Tanggal Mulai:</span>
                                        <span>{formatDateTime(data.start_date)}</span>
                                        <span className="font-semibold text-gray-500">Tanggal Selesai:</span>
                                        <span>{data.end_date ? formatDateTime(data.end_date) : '-'}</span>
                                        <span className="font-semibold text-gray-500">Berat Awal:</span>
                                        <span className="font-semibold">{formatNumber(data.dyeing_weight)} Kg</span>
                                        <span className="font-semibold text-gray-500">Berat Akhir:</span>
                                        <span>{data.dyeing_final_weight ? `${formatNumber(data.dyeing_final_weight)} Kg` : '-'}</span>
                                        <span className="font-semibold text-gray-500">Biaya Overhead:</span>
                                        <span>{data.dyeing_overhead_cost ? formatCurrency(data.dyeing_overhead_cost) : '-'}</span>
                                    </div>

                                    {data.dyeing_note && (
                                        <div className="pt-2 border-t">
                                            <div className="font-semibold text-gray-500 mb-1">Catatan</div>
                                            <div className="text-gray-700 dark:text-gray-300 break-words whitespace-normal">
                                                {data.dyeing_note}
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    {data.dyeing_status && (
                                        <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                    )}
                                    <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title="Hapus catatan proses celup ini?">
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
                <CreateUpdateDyeingProcessFormDialog
                    process={editingProcess}
                    onSave={handleSave}
                    closeDialog={closeDialog}
                />
            )}
        </Dialog>
    );
};