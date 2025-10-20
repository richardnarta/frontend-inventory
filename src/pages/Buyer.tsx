import { useState } from 'react';
import { RotateCcw, Plus, Pencil, Trash2, Loader2, AlertTriangle, CheckCircle2 } from 'lucide-react';

import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';

import { keepPreviousData, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { PageHeading } from '@/components/PageHeading';
import { Pagination } from '@/components/Pagination';
import { DeleteConfirmationDialog } from '@/components/DeleteDialog';
import { CreateUpdateBuyerFormDialog } from '@/components/BuyerFormDialog';

import type { BuyerCreatePayload, BuyerData, BuyerUpdatePayload } from '@/model/buyer';
import { createBuyer, deleteBuyerById, getBuyers, updateBuyer } from '@/service/buyer';


export const BuyerPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBuyer, setEditingBuyer] = useState<BuyerData | undefined>(undefined);
    const [searchName, setSearchName] = useState('');

    const itemsPerPage = 10;
    const queryClient = useQueryClient();

    const { data: buyerData, isLoading, error } = useQuery({
        queryKey: ['buyers', { name: searchName, page: currentPage }],
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
        },
        onError: (error) => { toast.error(error.message); },
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

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <PageHeading headingTitle={`Data Pembeli`} actionButton={() => {}}/>
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
                        <Button className="bg-blue-500 hover:bg-blue-600" onClick={openAddDialog}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Data Pembeli
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
                        <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-blue-200 hover:bg-blue-200">
                                        <TableHead className="pl-6 py-4">ID Pembeli</TableHead>
                                        <TableHead>Nama Pembeli</TableHead>
                                        <TableHead>No. Telepon</TableHead>
                                        <TableHead className="text-center">Status Piutang</TableHead>
                                        <TableHead className="max-w-xs">Alamat</TableHead>
                                        <TableHead className="max-w-xs">Catatan</TableHead>
                                        <TableHead className="text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {buyers.map((data) => (
                                        <TableRow key={data.id}>
                                            <TableCell className='font-medium pl-6'>{`BUYER-${data.id}`}</TableCell>
                                            <TableCell className="font-medium">{data.name}</TableCell>
                                            <TableCell>{data.phone_num || '-'}</TableCell>
                                            <TableCell className="text-center">
                                                {data.is_risked ? (
                                                    <div className="flex items-center justify-center gap-2 text-amber-600">
                                                        <AlertTriangle className="h-5 w-5" />
                                                        <span className="font-medium">Berisiko</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-center gap-2 text-green-600">
                                                        <CheckCircle2 className="h-5 w-5" />
                                                        <span className="font-medium">Aman</span>
                                                    </div>
                                                )}
                                            </TableCell>
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
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        <div className="grid gap-4 md:hidden">
                            {buyers.map((data) => (
                                <Card key={data.id}>
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-center text-base">
                                            <span className="break-words">{data.name}</span>
                                            <span className="text-sm font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded whitespace-nowrap ml-2">
                                                ID: {`BUYER-${data.id}`}
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3 text-sm">
                                        <div className="grid grid-cols-2 gap-x-4">
                                            <div className="font-semibold text-gray-500">No. Telepon</div>
                                            <div className="text-right break-words">{data.phone_num || '-'}</div>
                                        </div>
                                        
                                        <div className="grid grid-cols-2 gap-x-4">
                                            <div className="font-semibold text-gray-500">Status Piutang</div>
                                            <div className="text-right">
                                                {data.is_risked ? (
                                                    <div className="flex items-center justify-end gap-1 text-amber-600">
                                                        <AlertTriangle className="h-4 w-4" />
                                                        <span className="font-medium">Berisiko</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center justify-end gap-1 text-green-600">
                                                        <CheckCircle2 className="h-4 w-4" />
                                                        <span className="font-medium">Aman</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {data.note && (
                                            <div className="pt-2 border-t">
                                                <div className="font-semibold text-gray-500 mb-1">Catatan</div>
                                                <div className="text-gray-700 dark:text-gray-300 break-words whitespace-normal">
                                                    {data.note}
                                                </div>
                                            </div>
                                        )}
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                        <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title={`Hapus data pembeli "${data.name}"?`}>
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
                <CreateUpdateBuyerFormDialog
                    buyer={editingBuyer}
                    onSave={handleSave}
                    closeDialog={closeDialog}
                />
            )}
        </Dialog>
    );
};