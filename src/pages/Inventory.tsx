import { useState, useEffect, useRef } from 'react';
import { type InventoryData } from '../model/inventory';
import { useDebounce } from '../hooks/debouncing';

import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { toast } from 'sonner';

import { CreateUpdateInventoryFormDialog } from '../components/InventoryFormDialog';
import { DeleteConfirmationDialog } from '../components/DeleteDialog';

import { getInventories, createInventory, updateInventory, deleteInventoryByKode, bulkDeleteInventory, batchUploadInventory, exportInventoryToExcel } from '../service/inventory';

import {
    RotateCcw,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Upload,
    Download,
    AlertTriangle
} from 'lucide-react';

import { formatNumber } from '../lib/utils';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { PageHeading } from '@/components/PageHeading';
import { Pagination } from '@/components/Pagination';
import { useRole } from '@/hooks/use-role';

export const InventoryPage = () => {
    const { canWrite } = useRole();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<InventoryData | undefined>(undefined);
    const [searchKode, setSearchKode] = useState('');
    const [searchNama, setSearchNama] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const debouncedSearchKode = useDebounce(searchKode, 500);
    const debouncedSearchNama = useDebounce(searchNama, 500);

    const queryClient = useQueryClient();

    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds([]); // reset selection on search change
    }, [debouncedSearchNama, debouncedSearchKode, itemsPerPage]);

    const { data: productsData, isLoading, error } = useQuery({
        queryKey: ['inventories', { nama_barang: debouncedSearchNama, kode_barang: debouncedSearchKode, page: currentPage, limit: itemsPerPage }],
        queryFn: () => getInventories({ nama_barang: debouncedSearchNama, kode_barang: debouncedSearchKode }, currentPage, itemsPerPage),
        placeholderData: keepPreviousData,
    });

    const products = productsData?.items ?? [];
    const totalPages = productsData?.total_pages ?? 1;
    const totalCount = productsData?.item_count ?? 0;

    const saveMutation = useMutation({
        mutationFn: async (variables: InventoryData & { create: boolean }) => {
            const { create, ...data } = variables;
            if (!create) {
                return updateInventory(data.kode_barang, data);
            } else {
                return createInventory(data);
            }
        },
        onSuccess: (_, variables) => {
            if (!variables.create) {
                toast.success(`Data barang berhasil diperbarui.`);
            } else {
                toast.success(`Data barang baru berhasil dibuat.`);
            }
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
        },
        onError: () => {
            toast.error(`Gagal menyimpan data barang.`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteInventoryByKode,
        onSuccess: () => {
            toast.success(`Data barang berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
            setSelectedIds([]);
        },
        onError: () => {
            toast.error(`Data barang gagal dihapus.`);
        },
    });

    const bulkDeleteMutation = useMutation({
        mutationFn: ({ ids, deleteAll }: { ids?: string[], deleteAll: boolean }) => bulkDeleteInventory(ids, deleteAll),
        onSuccess: (data) => {
            toast.success(data.message || `Data barang berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
            setSelectedIds([]);
        },
        onError: (err: any) => {
            toast.error(err.message || `Gagal menghapus data barang.`);
        },
    });

    const uploadMutation = useMutation({
        mutationFn: batchUploadInventory,
        onSuccess: (data) => {
            toast.success(
                `Berhasil: ${data.successful_imports} | Duplikat: ${data.duplicate_skipped} | Di-skip: ${data.skipped_rows}`,
                { duration: 5000 }
            );

            if (data.errors && data.errors.length > 0) {
                console.warn(`Detail data yang di-skip atau gagal (${data.errors.length} baris):`);
                console.table(data.errors);
                toast.warning(`Lihat console (F12) untuk detail ${data.skipped_rows} baris yang di-skip/gagal.`, { duration: 8000 });
            }

            queryClient.invalidateQueries({ queryKey: ['inventories'] });
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
        onError: (error: Error) => {
            toast.error(`Gagal upload: ${error.message}`);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
    });

    const handleReset = () => {
        setSearchKode('');
        setSearchNama('');
    };

    const handleSave = async (data: InventoryData) => {
        const payload = {
            ...data,
            create: editingProduct ? false : true,
        }
        saveMutation.mutate(payload);
    };

    const handleDelete = (kode_barang: string) => {
        deleteMutation.mutate(kode_barang);
    };

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        bulkDeleteMutation.mutate({ ids: selectedIds, deleteAll: false });
    };

    const handleDeleteAll = () => {
        bulkDeleteMutation.mutate({ deleteAll: true });
    };

    const handleSelectAllOnPage = () => {
        const pageIds = products.map(p => p.kode_barang);
        const allSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.includes(id));
        if (allSelected) return;

        setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    };

    const handleSelectOne = (kode: string, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, kode]);
        } else {
            setSelectedIds(prev => prev.filter(id => id !== kode));
        }
    };

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
                toast.error('File harus berformat Excel (.xlsx atau .xls)');
                return;
            }
            uploadMutation.mutate(file);
        }
    };

    const handleExport = async () => {
        setIsExporting(true);
        try {
            await exportInventoryToExcel();
            toast.success('Berhasil export inventory ke Excel');
        } catch (error) {
            toast.error(`Gagal export: ${error instanceof Error ? error.message : 'Unknown error'}`);
        } finally {
            setIsExporting(false);
        }
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const openAddDialog = () => {
        setEditingProduct(undefined);
        setIsFormOpen(true);
    };

    const openEditDialog = (product: InventoryData) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const closeDialog = () => {
        setEditingProduct(undefined);
        setIsFormOpen(false);
    };

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <PageHeading headingTitle="Data Barang" actionButton={() => { }} />

            <div className="bg-white dark:bg-gray-950 border p-4 rounded-xl shadow-sm mb-6">
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <Label htmlFor="searchKode" className="block mb-2">Kode Barang</Label>
                        <Input id="searchKode" placeholder="Cari kode barang..." value={searchKode} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchKode(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="searchNama" className="block mb-2">Nama Barang</Label>
                        <Input id="searchNama" placeholder="Cari nama barang..." value={searchNama} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchNama(e.target.value)} />
                    </div>
                    <div className="flex flex-wrap gap-4 col-span-1 md:col-span-2 justify-start md:justify-end">
                        <Button variant="outline" onClick={handleReset}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Reset Filter
                        </Button>
                        {canWrite && (
                            <>
                                <input
                                    ref={fileInputRef}
                                    type="file"
                                    accept=".xlsx,.xls"
                                    onChange={handleFileChange}
                                    className="hidden"
                                />
                                <Button
                                    variant="outline"
                                    onClick={triggerFileInput}
                                    disabled={uploadMutation.isPending}
                                >
                                    {uploadMutation.isPending ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Uploading...
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="mr-2 h-4 w-4" /> Upload Excel
                                        </>
                                    )}
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={handleExport}
                                    disabled={isExporting}
                                >
                                    {isExporting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Exporting...
                                        </>
                                    ) : (
                                        <>
                                            <Download className="mr-2 h-4 w-4" /> Export Excel
                                        </>
                                    )}
                                </Button>
                                <Button className="bg-orange-400 hover:bg-orange-500 text-gray-900" onClick={openAddDialog}>
                                    <Plus className="mr-2 h-4 w-4" /> Tambah Barang
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {canWrite && selectedIds.length > 0 && (
                <div className="bg-orange-50 animate-in fade-in slide-in-from-top-4 border border-orange-200 p-3 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="text-orange-800 font-medium">
                        {selectedIds.length} item terpilih
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" onClick={() => setSelectedIds([])} className="bg-white hover:bg-gray-100 text-gray-700">
                            Batal Pilih
                        </Button>
                        <DeleteConfirmationDialog onConfirm={handleBulkDelete} title={`Hapus ${selectedIds.length} item terpilih?`}>
                            <Button variant="destructive" size="sm" disabled={bulkDeleteMutation.isPending}>
                                {bulkDeleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                Hapus Terpilih
                            </Button>
                        </DeleteConfirmationDialog>

                        <DeleteConfirmationDialog onConfirm={handleDeleteAll} title={`PERINGATAN! Anda akan menghapus SEMUA data barang (${totalCount} item). Lanjutkan?`}>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" disabled={bulkDeleteMutation.isPending}>
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Hapus Semua Data Kosongkan
                            </Button>
                        </DeleteConfirmationDialog>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="w-full h-100 flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : error ? (
                <div className="text-center p-8 text-red-500 bg-red-50 border rounded-xl shadow-sm">
                    Error: {error instanceof Error ? error.message : 'Gagal mengambil data. Mohon coba lagi.'}
                </div>
            ) : (
                totalCount === 0 ? (
                    <div className="text-center p-8 text-gray-500 bg-gray-50 border rounded-xl shadow-sm">
                        Data barang kosong. Mohon tambahkan data baru.
                    </div>
                ) : (
                    <div>
                        {canWrite && (
                            <div className="mb-4">
                                <Button variant="outline" size="sm" onClick={handleSelectAllOnPage} className="bg-white shadow-sm border-gray-300">
                                    Pilih Semua di Halaman
                                </Button>
                            </div>
                        )}
                        <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-orange-200 hover:bg-orange-200 *:first:rounded-tl-lg *:last:rounded-tr-lg">
                                        {canWrite && (
                                            <TableHead className="w-12 pl-4 py-4"></TableHead>
                                        )}
                                        <TableHead className={canWrite ? "py-4" : "pl-6 py-4"}>Kode Barang</TableHead>
                                        <TableHead className="py-4">Nama Barang</TableHead>
                                        <TableHead className="text-right py-4">Stok</TableHead>
                                        <TableHead className="text-center py-4">Satuan</TableHead>
                                        {canWrite && <TableHead className="text-right py-4">Harga Modal</TableHead>}
                                        <TableHead className="text-right py-4">Harga Eceran</TableHead>
                                        <TableHead className="text-right py-4">Harga Grosir</TableHead>
                                        {canWrite && <TableHead className="text-center py-4">Aksi</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((p) => (
                                        <TableRow key={p.kode_barang} data-state={selectedIds.includes(p.kode_barang) ? "selected" : undefined}>
                                            {canWrite && (
                                                <TableCell className="pl-4">
                                                    <Checkbox
                                                        checked={selectedIds.includes(p.kode_barang)}
                                                        onCheckedChange={(checked: boolean | "indeterminate") => handleSelectOne(p.kode_barang, checked === true)}
                                                        aria-label={`Pilih ${p.nama_barang}`}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell className={canWrite ? "font-medium" : "font-medium pl-6 py-4"}>{p.kode_barang}</TableCell>
                                            <TableCell>{p.nama_barang}</TableCell>
                                            <TableCell className="text-right">{formatNumber(p.quantity)}</TableCell>
                                            <TableCell className="text-center uppercase">{p.quantity_unit}</TableCell>
                                            {canWrite && <TableCell className="text-right">Rp {formatNumber(p.harga_modal)}</TableCell>}
                                            <TableCell className="text-right">Rp {formatNumber(p.harga_jual_eceran)}</TableCell>
                                            <TableCell className="text-right">Rp {formatNumber(p.harga_jual_grosir)}</TableCell>
                                            {canWrite && (
                                                <TableCell className="text-center py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button variant="outline" size="icon" onClick={() => openEditDialog(p)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <DeleteConfirmationDialog onConfirm={() => handleDelete(p.kode_barang)} title="Apakah anda yakin ingin menghapus data barang ini?">
                                                            <Button variant="destructive" size="icon">
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </DeleteConfirmationDialog>
                                                    </div>
                                                </TableCell>
                                            )}
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Mobile view */}
                        <div className="grid gap-4 md:hidden">
                            {products.map((p) => (
                                <Card key={p.kode_barang} className={selectedIds.includes(p.kode_barang) ? "border-orange-500 bg-orange-50" : ""}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex justify-between items-start gap-4">
                                            <div className="flex gap-3 items-start">
                                                {canWrite && (
                                                    <div className="pt-1">
                                                        <Checkbox
                                                            checked={selectedIds.includes(p.kode_barang)}
                                                            onCheckedChange={(checked: boolean | "indeterminate") => handleSelectOne(p.kode_barang, checked === true)}
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-base">{p.nama_barang}</div>
                                                    <div className="text-sm font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded mt-1 inline-block">
                                                        {p.kode_barang}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm pt-2">
                                        <div className="font-semibold text-gray-500">Stok</div>
                                        <div className="text-right">{formatNumber(p.quantity)} {p.quantity_unit}</div>
                                        {canWrite && (
                                            <>
                                                <div className="font-semibold text-gray-500">Harga Modal</div>
                                                <div className="text-right">Rp {formatNumber(p.harga_modal)}</div>
                                            </>
                                        )}
                                        <div className="font-semibold text-gray-500">Harga Eceran</div>
                                        <div className="text-right">Rp {formatNumber(p.harga_jual_eceran)}</div>
                                        <div className="font-semibold text-gray-500">Harga Grosir</div>
                                        <div className="text-right">Rp {formatNumber(p.harga_jual_grosir)}</div>
                                    </CardContent>
                                    {canWrite && (
                                        <CardFooter className="flex justify-end gap-2 pt-0 pb-4">
                                            <Button variant="outline" size="icon" onClick={() => openEditDialog(p)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <DeleteConfirmationDialog onConfirm={() => handleDelete(p.kode_barang)} title="Apakah anda yakin ingin menghapus data barang ini?">
                                                <Button variant="destructive" size="icon">
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </DeleteConfirmationDialog>
                                        </CardFooter>
                                    )}
                                </Card>
                            ))}
                        </div>

                        <Pagination
                            currentPage={currentPage}
                            totalPages={totalPages}
                            onPageChange={setCurrentPage}
                            itemsPerPage={itemsPerPage}
                            onItemsPerPageChange={setItemsPerPage}
                            totalItems={totalCount}
                            className='mt-6'
                        />
                    </div>
                )
            )}

            {isFormOpen && (
                <CreateUpdateInventoryFormDialog
                    product={editingProduct}
                    onSave={handleSave}
                    closeDialog={closeDialog}
                />
            )}
        </Dialog>
    );
};