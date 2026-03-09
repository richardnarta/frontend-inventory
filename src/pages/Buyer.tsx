import { useState, useEffect } from 'react';
import { RotateCcw, Plus, Pencil, Trash2, Loader2, AlertTriangle } from 'lucide-react';

import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';

import { keepPreviousData, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PageHeading } from '@/components/PageHeading';
import { Pagination } from '@/components/Pagination';
import { DeleteConfirmationDialog } from '@/components/DeleteDialog';
import { CreateUpdateBuyerFormDialog } from '@/components/BuyerFormDialog';

import type { BuyerCreatePayload, BuyerData, BuyerUpdatePayload } from '@/model/buyer';
import { createBuyer, deleteBuyerById, bulkDeleteBuyers, getBuyers, updateBuyer } from '@/service/buyer';
import { useRole } from '@/hooks/use-role';

export const BuyerPage = () => {
    const { canWrite } = useRole();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBuyer, setEditingBuyer] = useState<BuyerData | undefined>(undefined);
    const [searchName, setSearchName] = useState('');
    const [selectedIds, setSelectedIds] = useState<number[]>([]);

    const queryClient = useQueryClient();

    useEffect(() => {
        setCurrentPage(1);
        setSelectedIds([]);
    }, [searchName, itemsPerPage]);

    const { data: buyerData, isLoading, error } = useQuery({
        queryKey: ['buyers', { name: searchName, page: currentPage, limit: itemsPerPage }],
        queryFn: () => getBuyers({ name: searchName }, currentPage, itemsPerPage),
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: createBuyer,
        onSuccess: () => {
            toast.success(`Data pembeli baru berhasil dibuat.`);
            queryClient.invalidateQueries({ queryKey: ['buyers'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const updateMutation = useMutation({
        mutationFn: (variables: BuyerUpdatePayload & { id: number }) => {
            const { id, ...data } = variables;
            return updateBuyer(id, data);
        },
        onSuccess: () => {
            toast.success(`Data pembeli berhasil diubah.`);
            queryClient.invalidateQueries({ queryKey: ['buyers'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteBuyerById,
        onSuccess: () => {
            toast.success(`Data pembeli berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['buyers'] });
            setSelectedIds([]);
        },
        onError: (error) => { toast.error(error.message); },
    });

    const bulkDeleteMutation = useMutation({
        mutationFn: ({ ids, deleteAll }: { ids?: number[], deleteAll: boolean }) => bulkDeleteBuyers(ids, deleteAll),
        onSuccess: (data) => {
            toast.success(data.message || `Data pembeli berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['buyers'] });
            setSelectedIds([]);
        },
        onError: (error: any) => { toast.error(error.message || `Gagal menghapus data.`); },
    });

    const handleSave = async (data: BuyerCreatePayload | BuyerUpdatePayload) => {
        if (editingBuyer) {
            updateMutation.mutate({ ...data, id: editingBuyer.id });
        } else {
            createMutation.mutate(data as BuyerCreatePayload);
        }
    };

    const handleDelete = (id: number) => deleteMutation.mutate(id);
    const handleReset = () => setSearchName('');

    const handleBulkDelete = () => {
        if (selectedIds.length === 0) return;
        bulkDeleteMutation.mutate({ ids: selectedIds, deleteAll: false });
    };

    const handleDeleteAll = () => {
        bulkDeleteMutation.mutate({ deleteAll: true });
    };

    const handleSelectAllOnPage = () => {
        const pageIds = buyers.map(b => b.id);
        const allSelected = pageIds.length > 0 && pageIds.every(id => selectedIds.includes(id));
        if (allSelected) return;

        setSelectedIds(prev => Array.from(new Set([...prev, ...pageIds])));
    };

    const handleSelectOne = (id: number, checked: boolean) => {
        if (checked) {
            setSelectedIds(prev => [...prev, id]);
        } else {
            setSelectedIds(prev => prev.filter(selectedId => selectedId !== id));
        }
    };

    const openAddDialog = () => {
        setEditingBuyer(undefined);
        setIsFormOpen(true);
    };

    const openEditDialog = (buyer: BuyerData) => {
        setEditingBuyer(buyer);
        setIsFormOpen(true);
    };

    const closeDialog = () => {
        setEditingBuyer(undefined);
        setIsFormOpen(false);
    };

    const buyers = buyerData?.items ?? [];
    const totalPages = buyerData?.total_pages ?? 1;
    const totalCount = buyerData?.item_count ?? 0;

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <PageHeading headingTitle={`Data Pembeli`} actionButton={() => { }} />
            <div className="bg-white dark:bg-gray-950 border p-4 rounded-xl shadow-sm mb-6">
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <Label htmlFor="searchName" className="block mb-2">Nama Pembeli</Label>
                        <Input
                            id="searchName"
                            placeholder="Cari berdasarkan nama..."
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                        />
                    </div>
                    <div className="flex flex-wrap gap-4 col-span-1 md:col-span-1 lg:col-span-3 justify-start md:justify-end">
                        <Button variant="outline" onClick={handleReset}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Reset Filter
                        </Button>
                        {canWrite && (
                            <Button className="bg-green-400 hover:bg-green-500 text-gray-900" onClick={openAddDialog}>
                                <Plus className="mr-2 h-4 w-4" /> Tambah Data Pembeli
                            </Button>
                        )}
                    </div>
                </div>
            </div>

            {/* Bulk Actions Bar */}
            {canWrite && selectedIds.length > 0 && (
                <div className="bg-green-50 animate-in fade-in slide-in-from-top-4 border border-green-200 p-3 rounded-xl shadow-sm mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="text-green-800 font-medium whitespace-nowrap">
                        {selectedIds.length} item terpilih
                    </div>
                    <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                        <Button variant="outline" size="sm" onClick={() => setSelectedIds([])} className="bg-white hover:bg-gray-100 text-gray-700">
                            Batal Pilih
                        </Button>
                        <DeleteConfirmationDialog onConfirm={handleBulkDelete} title={`Hapus ${selectedIds.length} pembeli terpilih?`}>
                            <Button variant="destructive" size="sm" disabled={bulkDeleteMutation.isPending}>
                                {bulkDeleteMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Trash2 className="mr-2 h-4 w-4" />}
                                Hapus Terpilih
                            </Button>
                        </DeleteConfirmationDialog>

                        <DeleteConfirmationDialog onConfirm={handleDeleteAll} title={`PERINGATAN! Anda akan menghapus SEMUA data pembeli (${totalCount} item). Lanjutkan?`}>
                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700" disabled={bulkDeleteMutation.isPending}>
                                <AlertTriangle className="mr-2 h-4 w-4" />
                                Hapus Semua Data Kosongkan
                            </Button>
                        </DeleteConfirmationDialog>
                    </div>
                </div>
            )}

            {isLoading ? (
                <div className="w-full h-96 flex justify-center items-center">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : error ? (
                <div className="text-center p-8 text-red-500 bg-red-50 border rounded-xl shadow-sm">
                    Error: {error instanceof Error ? error.message : 'Gagal mengambil data. Mohon coba lagi.'}
                </div>
            ) : (
                !buyers.length ? (
                    <div className="text-center p-8 text-gray-500 bg-gray-50 border rounded-xl shadow-sm">
                        Data pembeli kosong. Mohon tambahkan data baru.
                    </div>
                ) : (
                    <div>
                        {/* Desktop Table */}
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
                                    <TableRow className="bg-green-200 hover:bg-green-200 *:first:rounded-tl-lg *:last:rounded-tr-lg">
                                        {canWrite && (
                                            <TableHead className="w-12 pl-6 py-4"></TableHead>
                                        )}
                                        <TableHead className={canWrite ? "py-4" : "pl-6 py-4"}>ID Pembeli</TableHead>
                                        <TableHead className="py-4">Nama Pembeli</TableHead>
                                        <TableHead className="py-4">No. Telepon</TableHead>
                                        <TableHead className="max-w-xs py-4">Alamat</TableHead>
                                        <TableHead className="max-w-xs py-4">Catatan</TableHead>
                                        {canWrite && <TableHead className="text-center py-4">Aksi</TableHead>}
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {buyers.map((data) => (
                                        <TableRow key={data.id} data-state={selectedIds.includes(data.id) ? "selected" : undefined}>
                                            {canWrite && (
                                                <TableCell className="pl-6">
                                                    <Checkbox
                                                        checked={selectedIds.includes(data.id)}
                                                        onCheckedChange={(checked: boolean | "indeterminate") => handleSelectOne(data.id, checked === true)}
                                                        aria-label={`Pilih ${data.name}`}
                                                    />
                                                </TableCell>
                                            )}
                                            <TableCell className={canWrite ? "font-medium" : "font-medium pl-6 py-4"}>{`PEMBELI-${data.id}`}</TableCell>
                                            <TableCell className="font-medium">{data.name}</TableCell>
                                            <TableCell>{data.phone_num || '-'}</TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="break-words whitespace-normal">
                                                    {data.address || '-'}
                                                </div>
                                            </TableCell>
                                            <TableCell className="max-w-xs">
                                                <div className="break-words whitespace-normal">
                                                    {data.note || '-'}
                                                </div>
                                            </TableCell>
                                            {canWrite && (
                                                <TableCell className="text-center py-4">
                                                    <div className="flex items-center justify-center gap-2">
                                                        <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}>
                                                            <Pencil className="h-4 w-4" />
                                                        </Button>
                                                        <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title={`Hapus data pembeli "${data.name}"?`}>
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

                        {/* Mobile Cards */}
                        <div className="grid gap-4 md:hidden">
                            {buyers.map((data) => (
                                <Card key={data.id} className={selectedIds.includes(data.id) ? "border-green-500 bg-green-50" : ""}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="flex justify-between items-start gap-4 text-base">
                                            <div className="flex gap-3 items-start">
                                                {canWrite && (
                                                    <div className="pt-1">
                                                        <Checkbox
                                                            checked={selectedIds.includes(data.id)}
                                                            onCheckedChange={(checked: boolean | "indeterminate") => handleSelectOne(data.id, checked === true)}
                                                        />
                                                    </div>
                                                )}
                                                <div>
                                                    <span className="break-words">{data.name}</span>
                                                    <div className="text-sm font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded ml-0 mt-1 inline-block">
                                                        ID: {`BUYER-${data.id}`}
                                                    </div>
                                                </div>
                                            </div>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm pt-2">
                                        <div className="grid grid-cols-2 gap-x-4">
                                            <div className="font-semibold text-gray-500">No. Telepon</div>
                                            <div className="text-right break-words">{data.phone_num || '-'}</div>
                                        </div>

                                        {data.address && (
                                            <div className="pt-2 border-t">
                                                <div className="font-semibold text-gray-500 mb-1">Alamat</div>
                                                <div className="text-gray-700 dark:text-gray-300 break-words whitespace-normal">
                                                    {data.address}
                                                </div>
                                            </div>
                                        )}

                                        {data.note && (
                                            <div className="pt-2 border-t">
                                                <div className="font-semibold text-gray-500 mb-1">Catatan</div>
                                                <div className="text-gray-700 dark:text-gray-300 break-words whitespace-normal">
                                                    {data.note}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                    {canWrite && (
                                        <CardFooter className="flex justify-end gap-2 pt-0 pb-4">
                                            <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}>
                                                <Pencil className="h-4 w-4" />
                                            </Button>
                                            <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title={`Hapus data pembeli "${data.name}"?`}>
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
                <CreateUpdateBuyerFormDialog
                    buyer={editingBuyer}
                    onSave={handleSave}
                    closeDialog={closeDialog}
                />
            )}
        </Dialog>
    );
};