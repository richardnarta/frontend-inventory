// pages/OperatorPage.tsx
import { useState } from 'react';
import { RotateCcw, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';

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
import { CreateUpdateOperatorFormDialog } from '@/components/OperatorFormDialog';

import type { OperatorCreatePayload, OperatorData, OperatorUpdatePayload } from '@/model/operator';
import { createOperator, deleteOperatorById, getOperators, updateOperator } from '@/service/operator';

export const OperatorPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingOperator, setEditingOperator] = useState<OperatorData | undefined>(undefined);
    const [searchName, setSearchName] = useState('');

    const itemsPerPage = 10;
    const queryClient = useQueryClient();

    const { data: operatorData, isLoading, error } = useQuery({
        queryKey: ['operators', { name: searchName, page: currentPage }],
        queryFn: () => getOperators({ name: searchName }, currentPage, itemsPerPage),
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: createOperator,
        onSuccess: () => {
            toast.success(`Data operator baru berhasil dibuat.`);
            queryClient.invalidateQueries({ queryKey: ['operators'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const updateMutation = useMutation({
        mutationFn: (variables: OperatorUpdatePayload & { id: number }) => {
            const { id, ...data } = variables;
            return updateOperator(id, data);
        },
        onSuccess: () => {
            toast.success(`Data operator berhasil diubah.`);
            queryClient.invalidateQueries({ queryKey: ['operators'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteOperatorById,
        onSuccess: () => {
            toast.success(`Data operator berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['operators'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const handleSave = async (data: OperatorCreatePayload | OperatorUpdatePayload) => {
        if (editingOperator) {
            updateMutation.mutate({ ...data, id: editingOperator.id });
        } else {
            createMutation.mutate(data as OperatorCreatePayload);
        }
    };
    
    const handleDelete = (id: number) => deleteMutation.mutate(id);
    const handleReset = () => setSearchName('');

    const openAddDialog = () => {
        setEditingOperator(undefined);
        setIsFormOpen(true);
    };

    const openEditDialog = (operator: OperatorData) => {
        setEditingOperator(operator);
        setIsFormOpen(true);
    };

    const closeDialog = () => {
        setEditingOperator(undefined);
        setIsFormOpen(false);
    };

    const operators = operatorData?.items ?? [];
    const totalPages = operatorData?.total_pages ?? 1;

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <PageHeading headingTitle={`Data Operator`} actionButton={() => {}}/>
            <div className="bg-white dark:bg-gray-950 border p-4 rounded-xl shadow-sm mb-6">
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <Label htmlFor="searchName" className="block mb-2">Nama Operator</Label>
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
                            <Plus className="mr-2 h-4 w-4" /> Tambah Data Operator
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
                !operators.length ? (
                    <div className="text-center p-8 text-gray-500 bg-gray-50 border rounded-xl shadow-sm">
                        Data operator kosong. Mohon tambahkan data baru.
                    </div>
                ) : (
                    <div>
                        {/* Desktop Table */}
                        <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-blue-200 hover:bg-blue-200">
                                        <TableHead className="pl-6 py-4">ID Operator</TableHead>
                                        <TableHead>Nama Operator</TableHead>
                                        <TableHead>No. Telepon</TableHead>
                                        <TableHead className="text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {operators.map((data) => (
                                        <TableRow key={data.id}>
                                            <TableCell className='font-medium pl-6'>{`OPERATOR-${data.id}`}</TableCell>
                                            <TableCell className="font-medium">{data.name}</TableCell>
                                            <TableCell>{data.phone_num || '-'}</TableCell>
                                            <TableCell className="text-center py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title={`Hapus data operator "${data.name}"?`}>
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

                        {/* Mobile Cards */}
                        <div className="grid gap-4 md:hidden">
                            {operators.map((data) => (
                                <Card key={data.id}>
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-center text-base">
                                            <span className="break-words">{data.name}</span>
                                            <span className="text-sm font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded whitespace-nowrap ml-2">
                                                ID: {`OPERATOR-${data.id}`}
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div className="font-semibold text-gray-500">No. Telepon</div>
                                        <div className="text-right break-words">{data.phone_num || '-'}</div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                        <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title={`Hapus data operator "${data.name}"?`}>
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
                <CreateUpdateOperatorFormDialog
                    operator={editingOperator}
                    onSave={handleSave}
                    closeDialog={closeDialog}
                />
            )}
        </Dialog>
    );
};