import { useState } from 'react';
import { RotateCcw, Pencil, Loader2, Calendar as CalendarIcon, Trash2, Plus } from 'lucide-react';
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
import { DyeingFormDialog } from '@/components/DyeingFormDialog';
import { Dropdown } from '@/components/Dropdown';

import { deletePurchaseTransactionById, getPurchaseTransactions, updatePurchaseTransaction } from '@/service/purchase_transaction';
import type { PurchaseTransactionData, PurchaseTransactionUpdatePayload } from '@/model/purchase_transaction';
import { cn, formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { DeleteConfirmationDialog } from '@/components/DeleteDialog';
import { Link } from 'react-router-dom';

const dyedStatusOptions = [
    { value: 'true', label: 'Sudah Celup' },
    { value: 'false', label: 'Belum Celup' },
];

export const DyeingPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<PurchaseTransactionData | undefined>(undefined);
    
    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [dyedStatus, setDyedStatus] = useState<boolean | undefined>(undefined);

    const itemsPerPage = 10;
    const queryClient = useQueryClient();
    
    const formattedDateRange = {
        start_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    };

    const { data: transactionData, isLoading, error } = useQuery({
        queryKey: ['purchase-transactions-dyeing', { dyedStatus, ...formattedDateRange, currentPage }],
        queryFn: () => getPurchaseTransactions({ 
            dyed: dyedStatus,
            ...formattedDateRange 
        }, currentPage, itemsPerPage),
        placeholderData: keepPreviousData,
    });

    const updateMutation = useMutation({
        mutationFn: (variables: PurchaseTransactionUpdatePayload & { id: number }) => {
            const { id, ...data } = variables;
            return updatePurchaseTransaction(id, data);
        },
        onSuccess: () => {
            toast.success(`Status celup berhasil diubah.`);
            queryClient.invalidateQueries({ queryKey: ['purchase-transactions-dyeing'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const deleteMutation = useMutation({
        mutationFn: deletePurchaseTransactionById,
        onSuccess: () => {
            toast.success(`Transaksi pembelian berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['purchase-transactions-dyeing'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const handleSave = async (data: PurchaseTransactionUpdatePayload) => {
        if (editingTransaction) {
            updateMutation.mutate({ ...data, id: editingTransaction.id });
        }
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };
    
    const handleReset = () => {
        setDateRange(undefined);
        setDyedStatus(undefined);
    };

    const handleDyedStatusChange = (value: string) => {
        if (value === undefined) {
            setDyedStatus(undefined);
        } else {
            setDyedStatus(value === 'true');
        }
    };

    const openEditDialog = (transaction: PurchaseTransactionData) => {
        setEditingTransaction(transaction);
        setIsFormOpen(true);
    };

    const closeDialog = () => {
        setEditingTransaction(undefined);
        setIsFormOpen(false);
    };

    const transactions = transactionData?.items ?? [];
    const totalPages = transactionData?.total_pages ?? 1;

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <PageHeading headingTitle={`Menu Celup`} actionButton={() => {}}/>
            <div className="bg-white dark:bg-gray-950 border p-4 rounded-xl shadow-sm mb-6">
                <div className="p-3 grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
                    <div>
                        <Label className="block mb-2">Status Celup</Label>
                        <Dropdown 
                            items={dyedStatusOptions}
                            value={String(dyedStatus)}
                            onChange={handleDyedStatusChange}
                            placeholder='Pilih status'
                        />
                    </div>
                    <div>
                         <Label className="block mb-2">Rentang Tanggal Pembelian</Label>
                         <Popover>
                            <PopoverTrigger asChild><Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (dateRange.to ? (`${format(dateRange.from, "dd LLL y")} - ${format(dateRange.to, "dd LLL y")}`) : format(dateRange.from, "dd LLL y")) : (<span>Pilih tanggal</span>)}
                            </Button></PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start"><Calendar mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2}/></PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-wrap gap-4 justify-start md:justify-end">
                        <Button variant="outline" onClick={handleReset}><RotateCcw className="mr-2 h-4 w-4" />Reset Filter</Button>
                        <Link to="/pembelian?action=add">
                            <Button className="bg-blue-500 hover:bg-blue-600">
                                <Plus className="mr-2 h-4 w-4" />Tambah Data Pembelian
                            </Button>
                        </Link>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="w-full h-96 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : error ? (
                <div className="text-center p-8 text-red-500 bg-red-50 border rounded-xl shadow-sm">Error: {error.message}</div>
            ) : !transactions.length ? (
                <div className="text-center p-8 text-gray-500 bg-gray-50 border rounded-xl shadow-sm">Tidak ada data celup.</div>
            ) : (
                <div>
                    <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden hidden md:block">
                        <Table>
                            <TableHeader><TableRow className="bg-blue-200 hover:bg-blue-200">
                                <TableHead className="pl-6 py-4">Tanggal Pembelian</TableHead>
                                <TableHead>Nama Supplier</TableHead>
                                <TableHead>Nama Kain</TableHead>
                                <TableHead className="text-center">Status Celup</TableHead>
                                <TableHead className="text-right">Berat Awal (Kg)</TableHead>
                                <TableHead className="text-right">Berat Akhir (Kg)</TableHead>
                                <TableHead className="text-right">Biaya Setting</TableHead>
                                <TableHead className="text-center">Aksi</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {transactions.map((data) => (
                                    <TableRow key={data.id}>
                                        <TableCell className='pl-6'>{formatDate(data.transaction_date)}</TableCell>
                                        <TableCell>{data.supplier?.name || '-'}</TableCell>
                                        <TableCell>{data.inventory?.name || '-'}</TableCell>
                                        <TableCell className="text-center">
                                            {data.dye_status ? (
                                                <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">Sudah Celup</Badge>
                                            ) : (
                                                <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200">Belum Celup</Badge>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right">{formatNumber(data.weight_kg)}</TableCell>
                                        <TableCell className="text-right">{data.dye_final_weight ? formatNumber(data.dye_final_weight) : '-'}</TableCell>
                                        <TableCell className="text-right">{data.dye_overhead_cost ? formatCurrency(data.dye_overhead_cost) : '-'}</TableCell>
                                        <TableCell className="text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}><Pencil className="h-4 w-4" /></Button>
                                                <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title={`Hapus transaksi celup ini?`}>
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
                        {transactions.map((data) => (
                            <Card key={data.id}>
                                <CardHeader><CardTitle className="flex justify-between items-center text-base">
                                    <span>{data.supplier?.name || 'N/A'}</span>
                                    {data.dye_status ? (
                                        <Badge className="bg-green-100 text-green-800 hover:bg-green-100 dark:bg-green-900 dark:text-green-200">Sudah Celup</Badge>
                                    ) : (
                                        <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-200">Belum Celup</Badge>
                                    )}
                                </CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div className="font-semibold col-span-2 pb-1 border-b">{data.inventory?.name || 'N/A'}</div>
                                    <div className="font-semibold text-gray-500">Tanggal Pembelian</div><div className="text-right">{formatDate(data.transaction_date)}</div>
                                    <div className="font-semibold text-gray-500">Berat Awal</div><div className="text-right">{formatNumber(data.weight_kg)} Kg</div>
                                    <div className="font-semibold text-gray-500">Berat Akhir</div><div className="text-right">{data.dye_final_weight ? `${formatNumber(data.dye_final_weight)} Kg` : '-'}</div>
                                    <div className="font-semibold text-gray-500">Biaya Setting</div><div className="text-right">{data.dye_overhead_cost ? formatCurrency(data.dye_overhead_cost) : '-'}</div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title={`Hapus transaksi celup ini?`}>
                                        <Button variant="destructive" size="icon">
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </DeleteConfirmationDialog>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className='mt-6'/>
                </div>
            )}
            
            {isFormOpen && editingTransaction && (
                <DyeingFormDialog
                    transaction={editingTransaction}
                    onSave={handleSave}
                    closeDialog={closeDialog}
                />
            )}
        </Dialog>
    );
};
