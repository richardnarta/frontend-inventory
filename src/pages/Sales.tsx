import { useState } from 'react';
import { RotateCcw, Plus, Trash2, Loader2, Calendar as CalendarIcon, FileDown } from 'lucide-react';
import { format } from "date-fns";
import { type DateRange } from "react-day-picker";
import * as XLSX from 'xlsx';

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
import { CreateSalesTransactionFormDialog } from '@/components/SalesTransactionFormDialog';
import { Dropdown } from '@/components/Dropdown';
import { ViewItemsDialog } from '@/components/ViewItemsDialog';

import { getBuyers } from '@/service/buyer';
import { getInventories } from '@/service/inventory';
import { createSalesTransaction, deleteSalesTransactionById, getSalesTransactions } from '@/service/sales_transaction';
import type { SalesTransactionCreateRequest } from '@/model/sales_transaction';
import { mapToDropdownItems } from '@/lib/mapper';
import { cn, formatCurrency, formatDate, formatNumber } from '@/lib/utils';
import { useRole } from '@/hooks/use-role';

export const SalesTransactionPage = () => {
    const { canWrite } = useRole();
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    const [viewItemsDialog, setViewItemsDialog] = useState<{ open: boolean; transactionId: number | null }>({
        open: false,
        transactionId: null
    });

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
        queryFn: () => getInventories({}, 1, 9999),
    });

    const createMutation = useMutation({
        mutationFn: createSalesTransaction,
        onSuccess: () => {
            toast.success(`Transaksi penjualan baru berhasil dibuat.`);
            queryClient.invalidateQueries({ queryKey: ['sales-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteSalesTransactionById,
        onSuccess: () => {
            toast.success(`Transaksi penjualan berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['sales-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const handleSave = async (data: SalesTransactionCreateRequest) => {
        createMutation.mutate(data);
    };

    const handleDelete = (id: number) => deleteMutation.mutate(id);

    const handleReset = () => {
        setBuyerId('');
        setInventoryId('');
        setDateRange(undefined);
    };

    const openAddDialog = () => setIsFormOpen(true);
    const closeDialog = () => setIsFormOpen(false);

    const transactions = transactionData?.items ?? [];
    const totalPages = transactionData?.total_pages ?? 1;

    const handleExport = async () => {
        if (typeof XLSX === 'undefined') {
            toast.error("Fungsi ekspor tidak tersedia.");
            return;
        }
        setIsExporting(true);
        toast.info("Mengekspor data...");
        try {
            const allTransactionsData = await getSalesTransactions({
                buyer_id: buyerId ? parseInt(buyerId) : undefined,
                inventory_id: inventoryId || undefined,
                ...formattedDateRange
            }, 1, 99999);

            if (!allTransactionsData || allTransactionsData.items.length === 0) {
                toast.warning("Tidak ada data untuk diekspor.");
                return;
            }

            let dateRangeString = `(${format(new Date(), 'dd-MM-yyyy')})`;
            if (dateRange?.from) {
                const startDate = format(dateRange.from, 'dd-MM-yyyy');
                if (dateRange.to) {
                    const endDate = format(dateRange.to, 'dd-MM-yyyy');
                    dateRangeString = startDate === endDate ? `(${startDate})` : `(${startDate} sampai ${endDate})`;
                } else {
                    dateRangeString = `(mulai ${startDate})`;
                }
            }

            const title = `Data Penjualan ${dateRangeString}`;
            const header = [
                "No. Transaksi",
                "Tanggal",
                "Pembeli",
                "Nama Barang",
                "Jumlah",
                "Harga Satuan",
                "Total Harga",
                "Total Penjualan"
            ];

            // Build data with one row per item
            const dataToExport: any[][] = [];
            const merges: any[] = [];
            let currentRow = 3; // Starting row (after title + blank + header)

            allTransactionsData.items.forEach(transaction => {
                const items = transaction.items || [];
                const itemCount = items.length || 1;

                if (items.length === 0) {
                    // Empty transaction - single row with no item details
                    dataToExport.push([
                        `#${transaction.id}`,
                        formatDate(transaction.transaction_date),
                        transaction.buyer?.name || '-',
                        '-',
                        0,
                        0,
                        0,
                        transaction.total_amount
                    ]);
                    currentRow++;
                } else {
                    // Transaction with items - one row per item
                    items.forEach((item, itemIndex) => {
                        dataToExport.push([
                            itemIndex === 0 ? `#${transaction.id}` : '', // Only first row shows transaction ID
                            itemIndex === 0 ? formatDate(transaction.transaction_date) : '',
                            itemIndex === 0 ? (transaction.buyer?.name || '-') : '',
                            item.inventory?.nama_barang || item.inventory_id,
                            item.quantity,
                            item.price_per_unit,
                            item.subtotal,
                            itemIndex === 0 ? transaction.total_amount : ''
                        ]);
                    });

                    // Merge cells for transaction-level fields (No Transaksi, Tanggal, Pembeli, Total Penjualan)
                    if (itemCount > 1) {
                        // Merge No. Transaksi (column 0)
                        merges.push({ s: { r: currentRow, c: 0 }, e: { r: currentRow + itemCount - 1, c: 0 } });
                        // Merge Tanggal (column 1)
                        merges.push({ s: { r: currentRow, c: 1 }, e: { r: currentRow + itemCount - 1, c: 1 } });
                        // Merge Pembeli (column 2)
                        merges.push({ s: { r: currentRow, c: 2 }, e: { r: currentRow + itemCount - 1, c: 2 } });
                        // Merge Total Penjualan (column 7)
                        merges.push({ s: { r: currentRow, c: 7 }, e: { r: currentRow + itemCount - 1, c: 7 } });
                    }

                    currentRow += itemCount;
                }
            });

            const worksheetData = [[title], [], header, ...dataToExport];
            const worksheet = XLSX.utils.aoa_to_sheet(worksheetData);

            // Merge title row across all columns
            worksheet['!merges'] = [
                { s: { r: 0, c: 0 }, e: { r: 0, c: header.length - 1 } },
                ...merges
            ];

            worksheet['!cols'] = [
                { wch: 15 },  // No. Transaksi
                { wch: 15 },  // Tanggal
                { wch: 25 },  // Pembeli
                { wch: 30 },  // Nama Barang
                { wch: 12 },  // Jumlah
                { wch: 15 },  // Harga Satuan
                { wch: 15 },  // Total Harga
                { wch: 18 }   // Total Penjualan
            ];

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Data Penjualan");

            const filename = `Data_Penjualan_${dateRangeString}.xlsx`;
            XLSX.writeFile(workbook, filename);

            toast.success("Data berhasil diekspor!");
        } catch (err) {
            console.error("Export failed:", err);
            toast.error("Gagal mengekspor data.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <PageHeading headingTitle="Data Penjualan" actionButtonTitle={isExporting ? "Dalam proses..." : "Ekspor data penjualan"} actionButtonIcon={isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FileDown className="mr-2 h-4 w-4" />} actionButton={handleExport} />
            <div className="bg-white dark:bg-gray-950 border p-4 rounded-xl shadow-sm mb-6">
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                    <div>
                        <Label className="block mb-2">Nama Pembeli</Label>
                        <Dropdown
                            items={mapToDropdownItems(buyerData?.items, { valueKey: 'id', labelKey: 'name' })}
                            value={buyerId}
                            onChange={setBuyerId}
                            placeholder='Pilih Pembeli'
                            isLoading={isBuyersLoading}
                        />
                    </div>
                    <div>
                        <Label className="block mb-2">Nama Barang</Label>
                        <Dropdown
                            items={mapToDropdownItems(inventoryData?.items, { valueKey: 'kode_barang', labelKey: 'nama_barang' })}
                            value={inventoryId}
                            onChange={setInventoryId}
                            placeholder='Pilih Barang'
                            isLoading={isInventoriesLoading}
                        />
                    </div>
                    <div>
                        <Label className="block mb-2">Rentang Tanggal</Label>
                        <Popover>
                            <PopoverTrigger asChild>
                                <Button variant={"outline"} className={cn("w-full justify-start text-left font-normal", !dateRange && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {dateRange?.from ? (dateRange.to ? <>{format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}</> : format(dateRange.from, "LLL dd, y")) : <span>Pilih tanggal</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar mode="range" defaultMonth={dateRange?.from} selected={dateRange} onSelect={setDateRange} numberOfMonths={2} />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-wrap gap-4 col-span-1 justify-start md:justify-end">
                        <Button variant="outline" onClick={handleReset}>
                            <RotateCcw className="mr-2 h-4 w-4" />Reset Filter
                        </Button>
                        {canWrite && (
                            <Button className="bg-green-400 hover:bg-green-500 text-gray-900" onClick={openAddDialog}>
                                <Plus className="mr-2 h-4 w-4" />Tambah Penjualan
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="w-full h-96 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : error ? (
                <div className="text-center p-8 text-red-500 bg-red-50 border rounded-xl shadow-sm">Error: {error.message}</div>
            ) : !transactions.length ? (
                <div className="text-center p-8 text-gray-500 bg-gray-50 border rounded-xl shadow-sm">Data transaksi penjualan kosong.</div>
            ) : (
                <div>
                    <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-green-200 hover:bg-green-200">
                                    <TableHead className="pl-6 py-4">No.</TableHead>
                                    <TableHead>Tanggal</TableHead>
                                    <TableHead>Pembeli</TableHead>
                                    <TableHead className="text-center">Jenis Barang</TableHead>
                                    <TableHead className="text-right">Total Jumlah</TableHead>
                                    <TableHead className="text-right">Total Harga</TableHead>
                                    <TableHead className="text-center">Aksi</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {transactions.map((data) => {
                                    const totalQuantity = data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                                    const itemCount = data.items?.length || 0;

                                    return (
                                        <TableRow key={data.id}>
                                            <TableCell className='pl-6 font-medium'>#{data.id}</TableCell>
                                            <TableCell>{formatDate(data.transaction_date)}</TableCell>
                                            <TableCell>{data.buyer?.name || '-'}</TableCell>
                                            <TableCell className="text-center">{itemCount} jenis</TableCell>
                                            <TableCell className="text-right">{formatNumber(totalQuantity)}</TableCell>
                                            <TableCell className="text-right font-semibold">{formatCurrency(data.total_amount)}</TableCell>
                                            <TableCell className="text-center py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() => setViewItemsDialog({ open: true, transactionId: data.id })}
                                                    >
                                                        Detail
                                                    </Button>
                                                    {canWrite && (
                                                        <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title={`Hapus transaksi penjualan #${data.id}?`}>
                                                            <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                                        </DeleteConfirmationDialog>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                            <TableFooter>
                                <TableRow>
                                    <TableCell colSpan={5} className="font-bold text-right py-4">Total Penjualan</TableCell>
                                    <TableCell className="text-right font-bold">{formatCurrency(transactions.reduce((sum, r) => sum + r.total_amount, 0))}</TableCell>
                                    <TableCell />
                                </TableRow>
                            </TableFooter>
                        </Table>
                    </div>

                    <div className="grid gap-4 md:hidden">
                        {transactions.map((data) => {
                            const totalQuantity = data.items?.reduce((sum, item) => sum + item.quantity, 0) || 0;
                            const itemCount = data.items?.length || 0;

                            return (
                                <Card key={data.id}>
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-center text-base">
                                            <span className="break-words">#{data.id} - {data.buyer?.name || '-'}</span>
                                            <span className="text-sm font-normal text-gray-500 whitespace-nowrap ml-2">{formatDate(data.transaction_date)}</span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="grid grid-cols-2 gap-x-4">
                                            <div className="font-semibold text-gray-500">Jenis Barang</div>
                                            <div className="text-right">{itemCount} jenis</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4">
                                            <div className="font-semibold text-gray-500">Total Jumlah</div>
                                            <div className="text-right">{formatNumber(totalQuantity)}</div>
                                        </div>
                                        <div className="col-span-2 border-t mt-2 pt-2 grid grid-cols-2">
                                            <div className="font-bold">Total Harga</div>
                                            <div className="text-right font-bold">{formatCurrency(data.total_amount)}</div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => setViewItemsDialog({ open: true, transactionId: data.id })}
                                        >
                                            Detail
                                        </Button>
                                        {canWrite && (
                                            <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title={`Hapus transaksi penjualan #${data.id}?`}>
                                                <Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button>
                                            </DeleteConfirmationDialog>
                                        )}
                                    </CardFooter>
                                </Card>
                            );
                        })}
                    </div>

                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className='mt-6' />
                </div>
            )}

            {isFormOpen && (
                <CreateSalesTransactionFormDialog
                    onSave={handleSave}
                    buyers={mapToDropdownItems(buyerData?.items, { valueKey: 'id', labelKey: 'name' })}
                    isBuyersLoading={isBuyersLoading}
                    closeDialog={closeDialog}
                />
            )}

            {/* View Items Detail Dialog */}
            {viewItemsDialog.open && viewItemsDialog.transactionId && (
                <ViewItemsDialog
                    open={viewItemsDialog.open}
                    onClose={() => setViewItemsDialog({ open: false, transactionId: null })}
                    items={transactions.find(t => t.id === viewItemsDialog.transactionId)?.items || []}
                    title={`Detail Transaksi Penjualan #${viewItemsDialog.transactionId}`}
                    totalAmount={transactions.find(t => t.id === viewItemsDialog.transactionId)?.total_amount || 0}
                />
            )}
        </Dialog>
    );
};
