// pages/PurchaseTransactionPage.tsx
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
import { CreatePurchaseTransactionFormDialog } from '@/components/PurchaseTransactionFormDialog';
import { Dropdown } from '@/components/Dropdown';

import { getSuppliers } from '@/service/supplier';
import { getInventories } from '@/service/inventory';
import { createPurchaseTransaction, deletePurchaseTransactionById, getPurchaseTransactions } from '@/service/purchase_transaction';
import type { PurchaseTransactionCreatePayload } from '@/model/purchase_transaction';
import { mapToDropdownItems } from '@/lib/mapper';
import { capitalize, cn, formatCurrency, formatDate, formatNumber } from '@/lib/utils';

interface PurchasePageProps {
  type: string;
  typeMessage: string;
}


export const PurchaseTransactionPage = ({ type, typeMessage }: PurchasePageProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [isExporting, setIsExporting] = useState(false);
    
    // Filter states
    const [supplierId, setSupplierId] = useState('');
    const [inventoryId, setInventoryId] = useState('');
    const [dateRange, setDateRange] = useState<DateRange | undefined>();

    const itemsPerPage = 10;
    const queryClient = useQueryClient();
    
    const formattedDateRange = {
        start_date: dateRange?.from ? format(dateRange.from, "yyyy-MM-dd") : undefined,
        end_date: dateRange?.to ? format(dateRange.to, "yyyy-MM-dd") : undefined,
    };

    const { data: transactionData, isLoading, error } = useQuery({
        queryKey: ['purchase-transactions', { supplierId, inventoryId, ...formattedDateRange, currentPage, type: type }],
        queryFn: () => getPurchaseTransactions({ 
            supplier_id: supplierId ? parseInt(supplierId) : undefined, 
            inventory_id: inventoryId || undefined,
            type: type,
            ...formattedDateRange 
        }, currentPage, itemsPerPage),
        placeholderData: keepPreviousData,
    });

    const { data: supplierData, isLoading: isSuppliersLoading } = useQuery({
        queryKey: ['suppliers-all'],
        queryFn: () => getSuppliers({ name: '' }, 1, 9999),
    });

    const { data: inventoryData, isLoading: isInventoriesLoading } = useQuery({
        queryKey: ['inventories-all'],
        queryFn: () => getInventories({ type: type }, 1, 9999),
    });

    const createMutation = useMutation({
        mutationFn: createPurchaseTransaction,
        onSuccess: () => {
            toast.success(`Transaksi pembelian baru berhasil dibuat.`);
            queryClient.invalidateQueries({ queryKey: ['purchase-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const deleteMutation = useMutation({
        mutationFn: deletePurchaseTransactionById,
        onSuccess: () => {
            toast.success(`Transaksi pembelian berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['purchase-transactions'] });
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const handleSave = async (data: PurchaseTransactionCreatePayload) => {
        createMutation.mutate(data);
    };
    
    const handleDelete = (id: number) => deleteMutation.mutate(id);
    
    const handleReset = () => {
        setSupplierId('');
        setInventoryId('');
        setDateRange(undefined);
    };

    const openAddDialog = () => {
        setIsFormOpen(true);
    };

    const closeDialog = () => {
        setIsFormOpen(false);
    };

    const transactions = transactionData?.items ?? [];
    const totalPages = transactionData?.total_pages ?? 1;

    const handleExport = async () => {
        if (typeof XLSX === 'undefined') {
            toast.error("Fungsi ekspor tidak tersedia. Silakan hubungi dukungan.");
            console.error("XLSX library is not loaded.");
            return;
        }
        setIsExporting(true);
        toast.info("Mengekspor data... Ini mungkin memakan waktu beberapa saat.");
        try {
            // Fetch all transactions with the current filters by setting a high limit.
            const allTransactionsData = await getPurchaseTransactions({
                supplier_id: supplierId ? parseInt(supplierId) : undefined,
                inventory_id: inventoryId || undefined,
                type: type,
                ...formattedDateRange
            }, 1, 99999); 

            if (!allTransactionsData || allTransactionsData.items.length === 0) {
                toast.warning("Tidak ada data untuk diekspor.");
                return;
            }

            // Map the fetched data to a more readable format for the Excel sheet.
            const dataToExport = allTransactionsData.items.map(data => ({
                "Tanggal Transaksi": formatDate(data.transaction_date),
                "Nama Supplier": data.supplier?.name || '-',
                [type === 'fabric' ? "Nama Kain" : "Nama Benang"]: data.inventory?.name || '-',
                [type === 'fabric' ? "Jumlah Roll" : "Jumlah Bale"]: type === 'fabric' ? data.roll_count : data.bale_count,
                "Berat (Kg)": data.weight_kg,
                "Harga per Kg": data.price_per_kg,
                "Total": data.total
            }));

            // Create a new worksheet and a new workbook.
            const worksheet = XLSX.utils.json_to_sheet(dataToExport);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Data Pembelian");
            
            // Set column widths for better readability in the exported file.
            worksheet['!cols'] = [
                { wch: 20 }, // Tanggal Transaksi
                { wch: 30 }, // Nama Supplier
                { wch: 30 }, // Nama Kain/Benang
                { wch: 15 }, // Jumlah Roll/Bale
                { wch: 15 }, // Berat (Kg)
                { wch: 20 }, // Harga per Kg
                { wch: 20 }  // Total
            ];

            // Trigger the file download on the user's computer.
            XLSX.writeFile(workbook, `Data_Pembelian_${capitalize(typeMessage)}_${format(new Date(), 'yyyy-MM-dd')}.xlsx`);

            toast.success("Data berhasil diekspor!");
        } catch (err) {
            console.error("Export failed:", err);
            toast.error("Gagal mengekspor data. Silakan coba lagi.");
        } finally {
            setIsExporting(false);
        }
    };

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <PageHeading headingTitle={`Data Pembelian ${capitalize(typeMessage)}`} actionButtonTitle={isExporting ? "Dalam proses..." : "Ekspor data pembelian"} actionButtonIcon={isExporting ? <Loader2 className="mr-2 h-4 w-4 animate-spin"/> : <FileDown className="mr-2 h-4 w-4"/>} actionButton={handleExport} />
            <div className="bg-white dark:bg-gray-950 border p-4 rounded-xl shadow-sm mb-6">
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-center">
                    <div>
                        <Label htmlFor="supplierFilter" className="block mb-2">Nama Supplier</Label>
                        <Dropdown 
                            items={mapToDropdownItems(supplierData?.items, {valueKey: 'id', labelKey: 'name'})} 
                            value={supplierId} 
                            onChange={setSupplierId} 
                            placeholder='Pilih Supplier' 
                            isLoading={isSuppliersLoading}
                        />
                    </div>
                    {(type === 'fabric') ? (
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
                    ):
                        <div>
                            <Label htmlFor="inventoryFilter" className="block mb-2">Nama Benang</Label>
                            <Dropdown 
                                items={mapToDropdownItems(inventoryData?.items, {valueKey: 'id', labelKey: 'name'})} 
                                value={inventoryId} 
                                onChange={setInventoryId} 
                                placeholder='Pilih Benang' 
                                isLoading={isInventoriesLoading}
                            />
                        </div>
                    }
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
                        <Button variant="outline" onClick={handleReset}>
                            <RotateCcw className="mr-2 h-4 w-4" />Reset Filter
                        </Button>
                        <Button className="bg-blue-500 hover:bg-blue-600" onClick={openAddDialog}>
                            <Plus className="mr-2 h-4 w-4" />Tambah Data Pembelian
                        </Button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="w-full h-96 flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : error ? (
                <div className="text-center p-8 text-red-500 bg-red-50 border rounded-xl shadow-sm">
                    Error: {error.message}
                </div>
            ) : (
                !transactions.length ? (
                    <div className="text-center p-8 text-gray-500 bg-gray-50 border rounded-xl shadow-sm">
                        Data transaksi pembelian {typeMessage} kosong.
                    </div>
                ) : (
                    <div>
                        {/* Desktop Table */}
                        <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-blue-200 hover:bg-blue-200">
                                        <TableHead className="pl-6 py-4">Tanggal Transaksi</TableHead>
                                        <TableHead>Nama Supplier</TableHead>
                                        {(type === 'fabric') ? (
                                            <TableHead>Nama Kain</TableHead>
                                        ):<TableHead>Nama Benang</TableHead>}
                                        
                                        {(type === 'fabric') ? (
                                            <TableHead className="text-right">Jumlah Roll</TableHead>
                                        ):<TableHead className="text-right">Jumlah Bale</TableHead>}
                                        <TableHead className="text-right">Berat (Kg)</TableHead>
                                        <TableHead className="text-right">Harga per Kg</TableHead>
                                        <TableHead className="text-right">Total</TableHead>
                                        <TableHead className="text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {transactions.map((data) => (
                                        <TableRow key={data.id}>
                                            <TableCell className='pl-6'>{formatDate(data.transaction_date)}</TableCell>
                                            <TableCell>{data.supplier?.name || '-'}</TableCell>
                                            <TableCell>{data.inventory?.name || '-'}</TableCell>
                                            {(type === 'fabric') ? (
                                                <TableCell className="text-right">{formatNumber(data.roll_count)}</TableCell>
                                            ):<TableCell className="text-right">{formatNumber(data.bale_count)}</TableCell>}
                                            <TableCell className="text-right">{formatNumber(data.weight_kg)}</TableCell>
                                            <TableCell className="text-right">{formatCurrency(data.price_per_kg)}</TableCell>
                                            <TableCell className="text-right font-semibold">{formatCurrency(data.total)}</TableCell>
                                            <TableCell className="text-center py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <DeleteConfirmationDialog 
                                                        onConfirm={() => handleDelete(data.id)} 
                                                        title={`Hapus transaksi pembelian dari "${data.supplier?.name}"?`}
                                                    >
                                                        <Button variant="destructive" size="icon">
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </DeleteConfirmationDialog>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                                <TableFooter>
                                    <TableRow>
                                        <TableCell colSpan={6} className="font-bold text-right py-4">
                                            Total Pembelian
                                        </TableCell>
                                        <TableCell className="text-right font-bold">
                                            {formatCurrency(transactions.reduce((sum, r) => sum + r.total, 0))}
                                        </TableCell>
                                        <TableCell/>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>

                        {/* Mobile Cards */}
                        <div className="grid gap-4 md:hidden">
                            {transactions.map((data) => (
                                <Card key={data.id}>
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-center text-base">
                                            <span className="break-words">{data.supplier?.name || '-'}</span>
                                            <span className="text-sm font-normal text-gray-500 whitespace-nowrap ml-2">
                                                {formatDate(data.transaction_date)}
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="font-semibold col-span-2 pb-2 border-b">
                                            {data.inventory?.name || '-'}
                                        </div>
                                        {type === 'fabric' ? (
                                            <div className="grid grid-cols-2 gap-x-4">
                                                <div className="font-semibold text-gray-500">Bal</div>
                                                <div className="text-right">{formatNumber(data.bale_count)}</div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-x-4">
                                                <div className="font-semibold text-gray-500">Roll</div>
                                                <div className="text-right">{formatNumber(data.roll_count)}</div>
                                            </div>
                                        )}
                                        <div className="grid grid-cols-2 gap-x-4">
                                            <div className="font-semibold text-gray-500">Berat (Kg)</div>
                                            <div className="text-right">{formatNumber(data.weight_kg)}</div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-x-4">
                                            <div className="font-semibold text-gray-500">Harga per Kg</div>
                                            <div className="text-right">{formatCurrency(data.price_per_kg)}</div>
                                        </div>
                                        <div className="col-span-2 border-t mt-2 pt-2 grid grid-cols-2">
                                            <div className="font-bold">Total</div>
                                            <div className="text-right font-bold">{formatCurrency(data.total)}</div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                        <DeleteConfirmationDialog 
                                            onConfirm={() => handleDelete(data.id)} 
                                            title={`Hapus transaksi pembelian dari "${data.supplier?.name}"?`}
                                        >
                                            <Button variant="destructive" size="icon">
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </DeleteConfirmationDialog>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>

                        <Pagination 
                            currentPage={currentPage} 
                            totalPages={totalPages} 
                            onPageChange={setCurrentPage} 
                            className='mt-6'
                        />
                    </div>
                )
            )}
            
            {isFormOpen && (
                <CreatePurchaseTransactionFormDialog
                    typeMessage={typeMessage}
                    onSave={handleSave}
                    suppliers={mapToDropdownItems(supplierData?.items, {valueKey: 'id', labelKey: 'name'})}
                    inventories={mapToDropdownItems(inventoryData?.items, {valueKey: 'id', labelKey: 'name'})}
                    isSuppliersLoading={isSuppliersLoading}
                    isInventoriesLoading={isInventoriesLoading}
                    closeDialog={closeDialog}
                />
            )}
        </Dialog>
    );
};