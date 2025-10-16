import { useState, useEffect } from 'react';
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

import { getInventories, createInventory, updateInventory, deleteInventoryById } from '../service/inventory';

import {
  RotateCcw, 
  Plus, 
  Pencil, 
  Trash2,
  Loader2
} from 'lucide-react';

import { formatNumber, capitalize } from '../lib/utils';

import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { PageHeading } from '@/components/PageHeading';
import { Pagination } from '@/components/Pagination';

interface InventoryPageProps {
  type: string;
  typeMessage: string;
}


export const InventoryPage = ({ type, typeMessage }: InventoryPageProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<InventoryData | undefined>(undefined);
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');

    const debouncedSearchId = useDebounce(searchId, 500);
    const debouncedSearchName = useDebounce(searchName, 500);
    const itemsPerPage = 10;

    const queryClient = useQueryClient();

    useEffect(() => {
        setCurrentPage(1);
    }, [debouncedSearchName, debouncedSearchId]);

    const { data: productsData, isLoading, error } = useQuery({
        queryKey: ['inventories', { name: debouncedSearchName, id: debouncedSearchId, type: type, page: currentPage }],
        queryFn: () => getInventories({ name: debouncedSearchName, id: debouncedSearchId, type: type }, currentPage, itemsPerPage),
        placeholderData: keepPreviousData,
    });

    const products = productsData?.items ?? [];
    const totalPages = productsData?.total_pages ?? 1;

    const saveMutation = useMutation({
        mutationFn: async (variables: Omit<InventoryData, 'total' | 'type' | 'bale_count'> & {create: boolean}) => {
            const { create, ...data } = variables;
            if (!create) {
                return updateInventory(data.id, data);
            } else {
                return createInventory({ ...data, type : type });
            }
        },
        onSuccess: (_, variables) => {
            if (!variables.create) {
                toast.success(`Data ${typeMessage} berhasil diperbarui.`);
            } else {
                toast.success(`Data ${typeMessage} baru berhasil dibuat.`);
            }
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
        },
        onError: () => {
            toast.error(`Gagal menyimpan data ${typeMessage}.`);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteInventoryById,
        onSuccess: () => {
            toast.success(`Data ${typeMessage} berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['inventories'] });
        },
        onError: () => {
            toast.success(`Data ${typeMessage} gagal dihapus.`);
        },
    });

    const handleReset = () => {
        setSearchId('');
        setSearchName('');
    };

    const handleSave = async (data: Omit<InventoryData, 'total' | 'type'  | 'bale_count'>) => {
        const payload = {
            ...data,
            create: editingProduct ? false : true,
        }
        saveMutation.mutate(payload);
    };

    const handleDelete = (id: string) => {
        deleteMutation.mutate(id);
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
            <PageHeading headingTitle={`Menu ${capitalize(typeMessage)}`} actionButton={() => {}}/>

            <div className="bg-white dark:bg-gray-950 border p-4 rounded-xl shadow-sm mb-6">
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <Label htmlFor="searchId" className="block mb-2">Kode Barang</Label>
                        <Input id="searchId" placeholder={`Cari berdasarkan kode ${typeMessage}...`} value={searchId} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchId(e.target.value)} />
                    </div>
                    <div>
                        <Label htmlFor="searchName" className="block mb-2">Nama Barang</Label>
                        <Input id="searchName" placeholder={`Cari berdasarkan nama ${typeMessage}...`} value={searchName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchName(e.target.value)} />
                    </div>
                    <div className="flex flex-wrap gap-4 col-span-1 md:col-span-2 justify-start md:justify-end">
                        <Button variant="outline" onClick={handleReset}>
                            <RotateCcw className="mr-2 h-4 w-4" /> Reset Filter
                        </Button>
                        <Button className="bg-blue-500 hover:bg-blue-600" onClick={openAddDialog}>
                            <Plus className="mr-2 h-4 w-4" /> Tambah {capitalize(typeMessage)}
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
                        Data {typeMessage} kosong. Mohon tambahkan data baru.
                    </div>
                ) : (
                    <div>
                        <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden hidden md:block">
                            <Table>
                                <TableHeader>
                                    <TableRow className="bg-blue-200 hover:bg-blue-200">
                                        <TableHead className="pl-6 py-4">Kode Barang</TableHead>
                                        <TableHead>Nama Barang</TableHead>
                                        {(type === 'fabric') ? (
                                            <TableHead className="text-right">Jumlah Roll</TableHead>
                                        ):<TableHead className="text-right">Jumlah Bale</TableHead>}
                                        <TableHead className="text-right">Berat (Kg)</TableHead>
                                        <TableHead className="text-center">Aksi</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {products.map((p) => (
                                        <TableRow key={p.id}>
                                            <TableCell className="font-medium pl-6">{p.id}</TableCell>
                                            <TableCell>{p.name}</TableCell>
                                            {(type === 'fabric') ? (
                                                <TableCell className="text-right">{formatNumber(p.roll_count)}</TableCell>
                                            ):<TableCell className="text-right">{formatNumber(p.bale_count)}</TableCell>}        
                                            <TableCell className="text-right">{formatNumber(p.weight_kg)}</TableCell>
                                            <TableCell className="text-center py-4">
                                                <div className="flex items-center justify-center gap-2">
                                                    <Button variant="outline" size="icon" onClick={() => openEditDialog(p)}>
                                                        <Pencil className="h-4 w-4" />
                                                    </Button>
                                                    <DeleteConfirmationDialog onConfirm={() => handleDelete(p.id)} title={`Apakah anda yakin ingin menghapus data ${typeMessage}?`}>
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
                                <Card key={p.id}>
                                    <CardHeader>
                                        <CardTitle className="flex justify-between items-center">
                                            <span>{p.name}</span>
                                            <span className="text-sm font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                                {p.id}
                                            </span>
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                        {type === 'fabric' ? (
                                            <>
                                                <div className="font-semibold text-gray-500">Jumlah Roll</div>
                                                <div className="text-right">{formatNumber(p.roll_count)}</div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="font-semibold text-gray-500">Jumlah Bale</div>
                                                <div className="text-right">{formatNumber(p.bale_count)}</div>
                                            </>
                                        )}
                                        <div className="font-semibold text-gray-500">Berat (Kg)</div>
                                        <div className="text-right">{formatNumber(p.weight_kg)}</div>
                                    </CardContent>
                                    <CardFooter className="flex justify-end gap-2">
                                        <Button variant="outline" size="icon" onClick={() => openEditDialog(p)}>
                                            <Pencil className="h-4 w-4" />
                                        </Button>
                                        <DeleteConfirmationDialog onConfirm={() => handleDelete(p.id)} title={`Apakah anda yakin ingin menghapus data ${typeMessage}?`}>
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
                    typeMessage={typeMessage}
                    product={editingProduct}
                    onSave={handleSave}
                    closeDialog={closeDialog}
                />
            )}
        </Dialog>
    );
};