import { useState, useEffect } from 'react';

import {
  RotateCcw, 
  Plus, 
  Pencil, 
  Trash2,
  Loader2,
} from 'lucide-react';

import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell, TableFooter } from '@/components/ui/table';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

import { formatCurrency } from '@/lib/utils';
import { keepPreviousData, useQuery, useQueryClient } from '@tanstack/react-query';
import { createAccountReceivable, deleteAccountReceivableById, getAccountReceivables, updateAccountReceivable } from '@/service/account_receivable';

import { mapToDropdownItems } from '@/lib/mapper';

import { PageHeading } from '@/components/PageHeading';
import { Dropdown } from '@/components/Dropdown';
import { getBuyers } from '@/service/buyer';
import { Pagination } from '@/components/Pagination';
import { Dialog } from '@/components/ui/dialog';
import type { AccountReceivableCreatePayload, AccountReceivableData, AccountReceivableUpdatePayload } from '@/model/account_receivable';
import { CreateUpdateAccountReceivableFormDialog } from '@/components/AccountReceivableFormDialog';
import { DeleteConfirmationDialog } from '@/components/DeleteDialog';

import { useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';


export const AccountReceivablePage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingAccountReceivable, setEditingAccountReceivable] = useState<AccountReceivableData | undefined>(undefined);
    const [buyerId, setBuyerId] = useState('');
    const [period] = useState('');

    const itemsPerPage = 10;

    const queryClient = useQueryClient();

    useEffect(() => {
        setCurrentPage(1);
    }, []);

    const { data: accountReceivableData, isLoading, error } = useQuery({
        queryKey: ['account-receivables', { buyer_id: buyerId, period: period, page: currentPage }],
        queryFn: () => getAccountReceivables({ buyer_id: buyerId, period: period }, currentPage, itemsPerPage),
        placeholderData: keepPreviousData,
    });

    const { data: buyerData, isLoading: buyerDataIsLoading, error: buyerDataIserror } = useQuery({
        queryKey: ['buyers', { name: '', page: 1 }],
        queryFn: () => getBuyers({ name: '' }, 1, 9999),
        placeholderData: keepPreviousData,
    });

    const createMutation = useMutation({
        mutationFn: async (variables: AccountReceivableCreatePayload) => {
            const { ...data } = variables;
            return createAccountReceivable(data)
        },
        onSuccess: () => {
            toast.success(`Data piutang baru berhasil dibuat.`);
            queryClient.invalidateQueries({ queryKey: ['account-receivables'] });
        },
        onError: (error) => {
            toast.error(error.message);
        },
    });

    const updateMutation = useMutation({
        mutationFn: async (variables: AccountReceivableUpdatePayload & {id: number}) => {
            const { id, ...data } = variables;
            return updateAccountReceivable(id, data)
        },
        onSuccess: () => {
            toast.success(`Data piutang berhasil diubah.`);
            queryClient.invalidateQueries({ queryKey: ['account-receivables'] });
        },
         onError: (error) => {
            toast.error(error.message);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteAccountReceivableById,
        onSuccess: () => {
            toast.success(`Data piutang berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['account-receivables'] });
        },
         onError: (error) => {
            toast.error(error.message);
        },
    });

    const handleCreate = async (data: AccountReceivableCreatePayload) => {
        createMutation.mutate(data);
    };

    const handleUpdate = async (data: AccountReceivableUpdatePayload) => {
        const payload = {
            ...data,
            id: editingAccountReceivable!.id,
        }
        updateMutation.mutate(payload);
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleReset = () => {
        setBuyerId('');
    };

    const openAddDialog = () => {
        setEditingAccountReceivable(undefined);
        setIsFormOpen(true);
    };

    const openEditDialog = (receivable: AccountReceivableData) => {
        setEditingAccountReceivable(receivable);
        setIsFormOpen(true);
    };

    const closeDialog = () => {
        setEditingAccountReceivable(undefined);
        setIsFormOpen(false);
    };

    const accountReceivables = accountReceivableData?.items ?? [];
    const totalPages = accountReceivableData?.total_pages ?? 1;

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <PageHeading headingTitle={`Menu Piutang`} actionButton={() => {}}/>
            <div className="bg-white dark:bg-gray-950 border p-4 rounded-xl shadow-sm mb-6">
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <Label htmlFor="searchBuyer" className="block mb-2">Nama Pembeli</Label>
                        <Dropdown 
                            items={
                                !buyerDataIsLoading && !buyerDataIserror ? 
                                mapToDropdownItems(buyerData?.items, {valueKey: 'id', labelKey: 'name'}) 
                                : []
                            } 
                            value={buyerId} 
                            onChange={setBuyerId} 
                            placeholder='Pilih pembeli' 
                            searchPlaceholder='Cari pembeli...' 
                            emptyMessage='Pembeli tidak ditemukan'
                            isLoading={buyerDataIsLoading}
                        />
                    </div>
                    {/* <div><Label htmlFor="search2" className="block mb-2">Periode</Label><Input id="search2" placeholder="e.g., Apr-25" /></div> */}
                    <div className="flex flex-wrap gap-4 col-span-1 md:col-span-3 justify-start lg:justify-end">
                        <Button variant="outline" onClick={handleReset}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Reset Filter
                        </Button>
                        <Button className="bg-blue-500 hover:bg-blue-600" onClick={openAddDialog}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah Data Piutang
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
                accountReceivableData?.item_count == 0 ? (
                    <div className="text-center p-8 text-black-500 bg-grey-50 border rounded-xl shadow-sm">
                        Data piutang kosong. Mohon tambahkan data baru.
                    </div>
                ) : (
                    <div>
                        <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-blue-200 hover:bg-blue-200">
                                        <TableHead rowSpan={2} className="align-center pl-6">
                                            Nama Pembeli
                                        </TableHead>
                                        <TableHead rowSpan={2} className="align-center">
                                            Periode
                                        </TableHead>
                                        <TableHead colSpan={4} className="text-center pt-4 pb-2 border-b border-blue-300">
                                            Usia Piutang
                                        </TableHead>
                                        <TableHead rowSpan={2} className="text-right align-center">
                                            Total Piutang
                                        </TableHead>
                                        <TableHead rowSpan={2} className="text-center align-center">
                                            Aksi
                                        </TableHead>
                                    </TableRow>
                                    <TableRow className="bg-blue-200 hover:bg-blue-200">
                                        <TableHead className="text-right pt-2 pb-4">0-30 Hari</TableHead>
                                        <TableHead className="text-right">31-60 Hari</TableHead>
                                        <TableHead className="text-right">61-90 Hari</TableHead>
                                        <TableHead className="text-right">&gt;90 Hari</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {accountReceivables.map((data) => (
                                        <TableRow key={data.id}>
                                            <TableCell className='pl-6'>{data.buyer?.name || '-'}</TableCell>
                                            <TableCell>{data.period || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(data.age_0_30_days)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(data.age_31_60_days)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(data.age_61_90_days)}
                                            </TableCell>
                                            <TableCell className="text-right">
                                                {formatCurrency(data.age_over_90_days)}
                                            </TableCell>
                                            <TableCell className="text-right font-semibold">
                                                {formatCurrency(data.total)}
                                            </TableCell>
                                            <TableCell className="text-center">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title={`Apakah anda yakin ingin menghapus data piutang?`}>
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
                                        <TableCell colSpan={6} className="font-bold text-right py-4">Total Piutang</TableCell>
                                        <TableCell className="text-right font-bold">{formatCurrency(accountReceivables.reduce((sum, r) => sum + r.total, 0))}</TableCell>
                                        <TableCell/>
                                    </TableRow>
                                </TableFooter>
                            </Table>
                        </div>

                        <div className="grid gap-4 md:hidden">
                            {accountReceivables.map((data) => (
                                <Card key={data.id}>
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-center text-base">
                                            <span>{data.buyer?.name || '-'}</span>
                                            <span className="text-sm font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                {data.period || '-'}
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        <div className="font-semibold text-gray-500">0-30 Hari</div>
                                        <div className="text-right">{formatCurrency(data.age_0_30_days)}</div>

                                        <div className="font-semibold text-gray-500">31-60 Hari</div>
                                        <div className="text-right">{formatCurrency(data.age_31_60_days)}</div>

                                        <div className="font-semibold text-gray-500">61-90 Hari</div>
                                        <div className="text-right">{formatCurrency(data.age_61_90_days)}</div>

                                        <div className="font-semibold text-gray-500">&gt;90 Hari</div>
                                        <div className="text-right">{formatCurrency(data.age_over_90_days)}</div>
                                        
                                        <div className="col-span-2 border-t mt-2 pt-2 grid grid-cols-2">
                                            <div className="font-bold">Total Piutang</div>
                                            <div className="text-right font-bold">{formatCurrency(data.total)}</div>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                        <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title={`Apakah anda yakin ingin menghapus data piutang?`}>
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
                <CreateUpdateAccountReceivableFormDialog
                    buyers={mapToDropdownItems(buyerData?.items, {valueKey: 'id', labelKey: 'name'})}
                    receivable={editingAccountReceivable}
                    onSave={handleCreate}
                    onUpdate={handleUpdate}
                    closeDialog={closeDialog}
                />
            )}
        </Dialog>
    );
};