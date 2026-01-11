import { useState, useEffect, useRef } from 'react';
import { type InventoryData } from '../model/inventory';
import { useDebounce } from '../hooks/debouncing';

import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

import { CreateUpdateInventoryFormDialog } from '../components/InventoryFormDialog';
import { DeleteConfirmationDialog } from '../components/DeleteDialog';

import { getInventories, createInventory, updateInventory, deleteInventoryById, batchUploadInventory, exportInventoryToExcel } from '../service/inventory';

import {
    RotateCcw,
    Plus,
    Pencil,
    Trash2,
    Loader2,
    Upload,
    Download
} from 'lucide-react';

import { formatNumber } from '../lib/utils';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { PageHeading } from '@/components/PageHeading';
import { Pagination } from '@/components/Pagination';

export const InventoryPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<InventoryData | undefined>(undefined);
    const [searchKode, setSearchKode] = useState('');
    const [searchNama, setSearchNama] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isExporting, setIsExporting] = useState(false);

    const debouncedSearchKode = useDebounce(searchKode, 500);
    const debouncedSearchNama = useDebounce(searchNama, 500);
    const itemsPerPage = 10;

    const queryClient = useQueryClient();

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchNama, debouncedSearchKode]);

    const { data: productsData, isLoading, error } = useQuery({
        queryKey: ['inventories', { nama_barang: debouncedSearchNama, kode_barang: debouncedSearchKode, page: currentPage }],
        queryFn: () => getInventories({ nama_barang: debouncedSearchNama, kode_barang: debouncedSearchKode }, currentPage, itemsPerPage),
        placeholderData: keepPreviousData,
    });

    const products = productsData?.items ?? [];
    const totalPages = productsData?.total_pages ?? 1;

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
        mutationFn: deleteInventoryById,
        onSuccess: () => {
            toast.success(`Data barang berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
        },
        onError: () => {
            toast.error(`Data barang gagal dihapus.`);
        },
    });

    const uploadMutation = useMutation({
        mutationFn: batchUploadInventory,
        onSuccess: (data) => {
            toast.success(
                `Berhasil: ${data.successful_imports} | Duplikat: ${data.duplicate_skipped} | Di-skip: ${data.skipped_rows}`,
                { duration: 5000 }
            );
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        },
        onError: (error: Error) => {
            toast.error(`Gagal upload: ${error.message}`);
            // Reset file input
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

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            // Validate file type
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
                        <Button className="bg-green-400 hover:bg-green-500 text-gray-900" onClick={openAddDialog}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Barang
                        </Button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="w-full h-100 flex justify-center items-center p-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : error ? (
                <div className="text-center p-8 text-red-500 bg-red-50 border rounded-xl shadow-sm">
                    Error: {error instanceof Error ? error.message : 'Gagal mengambil data. Mohon coba lagi.'}
                </div>
            ) : (
                productsData?.item_count == 0 ? (
                    <div className="text-center p-8 text-gray-500 bg-gray-50 border rounded-xl shadow-sm">
                        Data barang kosong. Mohon tambahkan data baru.
                    </div>
                ) : (
                    <div>
                        <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-green-200 hover:bg-green-200">
                                        <TableHead className="pl-6 py-4">Kode Barang</TableHead>
                                        <TableHead>Nama Barang</TableHead>
                                        <TableHead className="text-right">Stok</TableHead>
                                        <TableHead className="text-center">Satuan</TableHead>
                                        <TableHead className="text-right">Harga Modal</TableHead>
                                        <TableHead className="text-right">Harga Eceran</TableHead>
                                        <TableHead className="text-right">Harga Grosir</TableHead>
                                        <TableHead className="text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((p) => (
                                        <TableRow key={p.kode_barang}>
                                            <TableCell className="font-medium pl-6">{p.kode_barang}</TableCell>
                                            <TableCell>{p.nama_barang}</TableCell>
                                            <TableCell className="text-right">{formatNumber(p.quantity)}</TableCell>
                                            <TableCell className="text-center uppercase">{p.quantity_unit}</TableCell>
                                            <TableCell className="text-right">Rp {formatNumber(p.harga_modal)}</TableCell>
                                            <TableCell className="text-right">Rp {formatNumber(p.harga_jual_eceran)}</TableCell>
                                            <TableCell className="text-right">Rp {formatNumber(p.harga_jual_grosir)}</TableCell>
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
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="grid gap-4 md:hidden">
                            {products.map((p) => (
                                <Card key={p.kode_barang}>
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-center">
                                            <span>{p.nama_barang}</span>
                                            <span className="text-sm font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                {p.kode_barang}
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div className="font-semibold text-gray-500">Stok</div>
                                        <div className="text-right">{formatNumber(p.quantity)} {p.quantity_unit}</div>
                                        <div className="font-semibold text-gray-500">Harga Modal</div>
                                        <div className="text-right">Rp {formatNumber(p.harga_modal)}</div>
                                        <div className="font-semibold text-gray-500">Harga Eceran</div>
                                        <div className="text-right">Rp {formatNumber(p.harga_jual_eceran)}</div>
                                        <div className="font-semibold text-gray-500">Harga Grosir</div>
                                        <div className="text-right">Rp {formatNumber(p.harga_jual_grosir)}</div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                        <Button variant="outline" size="icon" onClick={() => openEditDialog(p)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <DeleteConfirmationDialog onConfirm={() => handleDelete(p.kode_barang)} title="Apakah anda yakin ingin menghapus data barang ini?">
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
                <CreateUpdateInventoryFormDialog
                    product={editingProduct}
                    onSave={handleSave}
                    closeDialog={closeDialog}
                />
            )}
        </Dialog>
    );
};