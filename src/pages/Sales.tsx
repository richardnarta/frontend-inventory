import { useState } from 'react';
import { RotateCcw, Plus, Pencil, Trash2, Loader2, Calendar as CalendarIcon } from 'lucide-react';
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";

import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell, TableFooter } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";

import { keepPreviousData, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PageHeading } from '@/components/PageHeading';
import { Pagination } from '@/components/Pagination';
import { DeleteConfirmationDialog } from '@/components/DeleteDialog';
import { CreateUpdateSalesTransactionFormDialog } from '@/components/SalesTransactionFormDialog';
import { Dropdown } from '@/components/Dropdown';

import { getBuyers } from '@/service/buyer';
import { getInventories } from '@/service/inventory';
import { createSalesTransaction, deleteSalesTransactionById, getSalesTransactions, updateSalesTransaction } from '@/service/sales_transaction';
import type { SalesTransactionCreatePayload, SalesTransactionData, SalesTransactionUpdatePayload } from '@/model/sales_transaction';
import { mapToDropdownItems } from '@/lib/mapper';
import { cn, formatCurrency, formatDate, formatNumber } from '@/lib/utils';


export const SalesTransactionPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingTransaction, setEditingTransaction] = useState<SalesTransactionData | undefined>(undefined);
    
    // Filter states
    const [buyerId, setBuyerId] = useState('');
    const [inventoryId, setInventoryId] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const itemsPerPage = 10;
    const queryClient = useQueryClient();
    
    const formattedDateRange = {
        start_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    };

    const { data: transactionData, isLoading, error } = useQuery({
        queryKey: ['sales-transactions', { buyerId, inventoryId, ...formattedDateRange, currentPage }],
        queryFn: () => getSalesTransactions({ 
            buyer_id: buyerId ? parseInt(buyerId) : undefined, 
            inventory_id: inventoryId || undefined,
            ...formattedDateRange 
        }, currentPage, itemsPerPage),
        placeholderData: keepPreviousData,
    });

    const { data: buyerData, isLoading: isBuyersLoading } = useQuery({
        queryKey: ['buyers-all'],
        queryFn: () => getBuyers({ name: '' }, 1, 9999),
    });

    const { data: inventoryData, isLoading: isInventoriesLoading } = useQuery({
        queryKey: ['inventories-all'],
        queryFn: () => getInventories({ type: 'fabric' }, 1, 9999),
    });

    const createMutation = useMutation({
        mutationFn: createSalesTransaction,
        onSuccess: () => {
            toast.success(`Transaksi penjualan baru berhasil dibuat.`);
            queryClient.invalidateQueries({ queryKey: ['sales-transactions'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const updateMutation = useMutation({
        mutationFn: (variables: SalesTransactionUpdatePayload & { id: number }) => {
            const { id, ...data } = variables;
            return updateSalesTransaction(id, data);
        },
        onSuccess: () => {
            toast.success(`Transaksi penjualan berhasil diubah.`);
            queryClient.invalidateQueries({ queryKey: ['sales-transactions'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSalesTransactionById,
        onSuccess: () => {
            toast.success(`Transaksi penjualan berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['sales-transactions'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const handleSave = async (data: SalesTransactionCreatePayload | SalesTransactionUpdatePayload) => {
        if (editingTransaction) {
            updateMutation.mutate({ ...data, id: editingTransaction.id });
        } else {
            createMutation.mutate(data as SalesTransactionCreatePayload);
        }
    };
    
    const handleDelete = (id: number) => deleteMutation.mutate(id);
    const handleReset = () => {
        setBuyerId('');
        setInventoryId('');
        setDateRange(undefined);
    };

    const openAddDialog = () => {
        setEditingTransaction(undefined);
        setIsFormOpen(true);
    };

    const openEditDialog = (transaction: SalesTransactionData) => {
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
            <PageHeading headingTitle={`Menu Penjualan`} actionButton={() => {}} />
            <div className="bg-white dark:bg-gray-950 border p-4 rounded-xl shadow-sm mb-6">
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                    <div>
                        <Label htmlFor="buyerFilter" className="block mb-2">Nama Pembeli</Label>
                        <Dropdown 
                            items={mapToDropdownItems(buyerData?.items, {valueKey: 'id', labelKey: 'name'})} 
                            value={buyerId} 
                            onChange={setBuyerId} 
                            placeholder='Pilih Pembeli' 
                            isLoading={isBuyersLoading}
                        />
                    </div>
                     <div>
                        <Label htmlFor="inventoryFilter" className="block mb-2">Nama Kain</Label>
                        <Dropdown 
                            items={mapToDropdownItems(inventoryData?.items, {valueKey: 'id', labelKey: 'name'})} 
                            value={inventoryId} 
                            onChange={setInventoryId} 
                            placeholder='Pilih Kain' 
                            isLoading={isInventoriesLoading}
                        />
                    </div>
                    <div>
                         <Label htmlFor="dateRangeFilter" className="block mb-2">Rentang Tanggal</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                    id="date"
                                    variant={"outline"}
                                    className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {dateRange?.from ? (
                                    dateRange.to ? (
                                    <>
                                        {format(dateRange.from, "LLL dd, y")} -{" "}
                                        {format(dateRange.to, "LLL dd, y")}
                                    </>
                                    ) : (
                                    format(dateRange.from, "LLL dd, y")
                                    )
                                ) : (
                                    <span>Pilih tanggal</span>
                                )}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="range"
                                    defaultMonth={dateRange?.from}
                                    selected={dateRange}
                                    onSelect={setDateRange}
                                    numberOfMonths={2}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-wrap gap-4 col-span-1 justify-start md:justify-end">
                        <Button variant="outline" onClick={handleReset}><RotateCcw className="mr-2 h-4 w-4" />Reset Filter</Button>
                        <Button className="bg-blue-500 hover:bg-blue-600" onClick={openAddDialog}><Plus className="mr-2 h-4 w-4" />Tambah Data Penjualan</Button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="w-full h-96 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : error ? (
                <div className="text-center p-8 text-red-500 bg-red-50 border rounded-xl shadow-sm">
                    Error: {error.message}
                </div>
            ) : (
                !transactions.length ? (
                    <div className="text-center p-8 text-gray-500 bg-gray-50 border rounded-xl shadow-sm">
                       Data transaksi penjualan kosong.
                    </div>
                ) : (
                    <div>
                        <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden hidden md:block">
                            <Table>
                                <TableHeader><TableRow className="bg-blue-200 hover:bg-blue-200">
                                    <TableHead className="pl-6 py-4">Tanggal Transaksi</TableHead>
                                    <TableHead>Nama Pembeli</TableHead>
                                    <TableHead>Nama Kain</TableHead>
                                    <TableHead className="text-right">Roll</TableHead>
                                    <TableHead className="text-right">Berat (Kg)</TableHead>
                                    <TableHead className="text-right">Harga per Kg</TableHead>
                                    <TableHead className="text-right">Total</TableHead>
                                    <TableHead className="text-center">Aksi</TableHead>
                                </TableRow></TableHeader>
                                <TableBody>
                                    {transactions.map((data) => (
                                        <TableRow key={data.id}>
                                            <TableCell className='pl-6'>{formatDate(data.transaction_date)}</TableCell>
                                            <TableCell>{data.buyer?.name || '-'}</TableCell>
                                            <TableCell>{data.inventory?.name || '-'}</TableCell>
                                            <TableCell className="text-right">{formatNumber(data.roll_count)}</TableCell>
                                            <TableCell className="text-right">{formatNumber(data.weight_kg)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(data.price_per_kg)}</TableCell>
                                            <TableCell className="text-right font-semibold">{formatCurrency(data.total)}</TableCell>
                                            <TableCell className="text-center"><div className="flex items-center justify-center gap-2">
                                                <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}><Pencil className="h-4 w-4" /></Button>
                                                <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title={`Hapus transaksi ini?`}><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></DeleteConfirmationDialog>
                                            </div></TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={6} className="font-bold text-right py-4">Total Penjualan</TableCell>
                                        <TableCell className="text-right font-bold">{formatCurrency(transactions.reduce((sum, r) => sum + r.total, 0))}</TableCell>
                                        <TableCell/>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>

                        <div className="grid gap-4 md:hidden">
                            {transactions.map((data) => (
                                <Card key={data.id}>
                                    <CardHeader><CardTitle className="flex justify-between items-center text-base">
                                        <span>{data.buyer?.name || 'N/A'}</span>
                                        <span className="text-sm font-normal text-gray-500">{formatDate(data.transaction_date)}</span>
                                    </CardTitle></CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div className="font-semibold col-span-2 pb-1 border-b">{data.inventory?.name || 'N/A'}</div>
                                        <div className="font-semibold text-gray-500">Roll</div><div className="text-right">{data.roll_count}</div>
                                        <div className="font-semibold text-gray-500">Berat (Kg)</div><div className="text-right">{data.weight_kg}</div>
                                        <div className="font-semibold text-gray-500">Harga per Kg</div><div className="text-right">{formatCurrency(data.price_per_kg)}</div>
                                        <div className="col-span-2 border-t mt-2 pt-2 grid grid-cols-2">
                                            <div className="font-bold">Total</div><div className="text-right font-bold">{formatCurrency(data.total)}</div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                        <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}><Pencil className="h-4 w-4" /></Button>
                                        <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title={`Hapus transaksi ini?`}><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></DeleteConfirmationDialog>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                        <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className='mt-6'/>
                    </div>
                )
            )}
            
            {isFormOpen && (
                <CreateUpdateSalesTransactionFormDialog
                    transaction={editingTransaction}
                    onSave={handleSave}
                    buyers={mapToDropdownItems(buyerData?.items, {valueKey: 'id', labelKey: 'name'})}
                    inventories={mapToDropdownItems(inventoryData?.items, {valueKey: 'id', labelKey: 'name'})}
                    isBuyersLoading={isBuyersLoading}
                    isInventoriesLoading={isInventoriesLoading}
                    closeDialog={closeDialog}
                />
            )}
        </Dialog>
    );
};