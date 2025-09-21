import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus, Pencil, Trash2, Loader2, Scissors, ArrowLeft } from 'lucide-react';
import { keepPreviousData, useQuery, useQueryClient, useMutation } from '@tanstack/react-query';
import { toast } from 'sonner';

import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { PageHeading } from '@/components/PageHeading';
import { Pagination } from '@/components/Pagination';
import { DeleteConfirmationDialog } from '@/components/DeleteDialog';

import { getInventories } from '@/service/inventory';
import { getKnitFormulas, createKnitFormula, updateKnitFormula, deleteKnitFormulaById } from '@/service/knit_formula';
import type { KnitFormulaData, KnitFormulaCreatePayload, KnitFormulaUpdatePayload } from '@/model/knit_formula';
import { mapToDropdownItems } from '@/lib/mapper';
import { formatNumber } from '@/lib/utils';
import { CreateUpdateKnitFormulaFormDialog } from '@/components/KnitFormulaFormDialog';

export const KnitFormulaPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingFormula, setEditingFormula] = useState<KnitFormulaData | undefined>(undefined);

    const navigate = useNavigate();

    const itemsPerPage = 10;
    const queryClient = useQueryClient();

    const { data: formulaData, isLoading, error } = useQuery({
        queryKey: ['knit-formulas', { page: currentPage }],
        queryFn: () => getKnitFormulas(currentPage, itemsPerPage),
        placeholderData: keepPreviousData,
    });

    const { data: fabricData, isLoading: isFabricsLoading } = useQuery({
        queryKey: ['inventories-fabric-all'],
        queryFn: () => getInventories({ type: 'fabric' }, 1, 9999),
    });

    const { data: threadData, isLoading: isThreadsLoading } = useQuery({
        queryKey: ['inventories-thread-all'],
        queryFn: () => getInventories({ type: 'thread' }, 1, 9999),
    });

    const createMutation = useMutation({
        mutationFn: createKnitFormula,
        onSuccess: () => {
            toast.success(`Formula baru berhasil dibuat.`);
            queryClient.invalidateQueries({ queryKey: ['knit-formulas'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const updateMutation = useMutation({
        mutationFn: (variables: { id: number, data: KnitFormulaUpdatePayload }) => 
            updateKnitFormula(variables.id, variables.data),
        onSuccess: () => {
            toast.success(`Formula berhasil diubah.`);
            queryClient.invalidateQueries({ queryKey: ['knit-formulas'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteKnitFormulaById,
        onSuccess: () => {
            toast.success(`Formula berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['knit-formulas'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const handleSave = async (data: KnitFormulaCreatePayload | KnitFormulaUpdatePayload) => {
        if (editingFormula) {
            updateMutation.mutate({ id: editingFormula.id, data: data as KnitFormulaUpdatePayload });
        } else {
            createMutation.mutate(data as KnitFormulaCreatePayload);
        }
    };

    const handleDelete = (id: number) => deleteMutation.mutate(id);

    const handleKnitAction = (formula: KnitFormulaData) => {
        navigate(`/rajut?create=${formula.id}`);
    };

    const openAddDialog = () => {
        setEditingFormula(undefined);
        setIsFormOpen(true);
    };

    const openEditDialog = (formula: KnitFormulaData) => {
        setEditingFormula(formula);
        setIsFormOpen(true);
    };

    const closeDialog = () => {
        setEditingFormula(undefined);
        setIsFormOpen(false);
    };

    const formulas = formulaData?.items ?? [];
    const totalPages = formulaData?.total_pages ?? 1;

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <PageHeading 
                headingTitle="Daftar Formula Rajut" 
                actionButtonTitle="Tambah Formula Rajut"
                actionButtonIcon={<Plus className="h-4 w-4" />}
                actionButton={openAddDialog}
            />

            <div className="mb-6">
                <Link to="/rajut">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Menu Rajut
                    </Button>
                </Link>
            </div>
            
            {isLoading ? (
                <div className="w-full h-96 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : error ? (
                <div className="text-center p-8 text-red-500 bg-red-50 border rounded-xl shadow-sm">Error: {error.message}</div>
            ) : !formulas.length ? (
                <div className="text-center p-8 text-gray-500 bg-gray-50 border rounded-xl shadow-sm">
                    Belum ada formula yang dibuat.
                </div>
            ) : (
                <div>
                    <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden hidden md:block">
                        <Table>
                            <TableHeader><TableRow className="bg-blue-200 hover:bg-blue-200">
                                <TableHead className="pl-6 py-4">Kode Kain</TableHead>
                                <TableHead className="">Nama Kain</TableHead>
                                <TableHead>Formula Rajut</TableHead>
                                <TableHead className="text-right">Hasil Produksi (Kg)</TableHead>
                                <TableHead className="text-center">Aksi</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {formulas.map((data) => (
                                    <TableRow key={data.id}>
                                        <TableCell className='pl-6 font-mono'>{data.product.id}</TableCell>
                                        <TableCell>{data.product.name}</TableCell>
                                        <TableCell className='py-4'>
                                            <ul className="space-y-1">
                                                {data.formula.map((item, index) => (
                                                    <li key={index} className="text-s">
                                                        <span className="font-mono text-xs text-gray-500">({item.inventory_id})</span> {item.inventory_name} : <span className="font-semibold">{formatNumber(item.amount_kg)} Kg</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        </TableCell>
                                        <TableCell className="text-right">{formatNumber(data.production_weight)}</TableCell>
                                        <TableCell className="text-center"><div className="flex items-center justify-center gap-2">
                                            <Button variant="outline" size="icon" className="text-blue-600" onClick={() => handleKnitAction(data)}>
                                                <Scissors className="h-4 w-4" />
                                            </Button>
                                            <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}><Pencil className="h-4 w-4" /></Button>
                                            <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title={`Hapus formula untuk "${data.product.name}"?`}><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></DeleteConfirmationDialog>
                                        </div></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="grid gap-4 md:hidden">
                        {formulas.map((data) => (
                            <Card key={data.id}>
                                <CardHeader>
                                    <CardTitle className="flex justify-between items-center">
                                        <span>{data.product.name}</span>
                                        <span className="text-sm font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                            {data.product.id}
                                        </span>
                                    </CardTitle>
                                    <div className="text-sm font-normal text-gray-500">{`Hasil Produksi : ${formatNumber(data.production_weight)}`} Kg</div>
                                </CardHeader>
                                <CardContent>
                                    <p className="font-semibold text-sm mb-2">Formula Rajut:</p>
                                    <ul className="space-y-1 pl-4 list-disc">
                                        {data.formula.map((item, index) => (
                                            <li key={index} className="text-sm text-gray-600 dark:text-gray-400">
                                                <span className="font-mono text-xs">({item.inventory_id})</span> {item.inventory_name} : <span className="font-semibold">{formatNumber(item.amount_kg)} Kg</span>
                                            </li>
                                        ))}
                                    </ul>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    <Button variant="outline" size="icon" className="text-blue-600" onClick={() => handleKnitAction(data)}>
                                        <Scissors className="h-4 w-4" />
                                    </Button>
                                    <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}><Pencil className="h-4 w-4" /></Button>
                                    <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title={`Hapus formula untuk "${data.product.name}"?`}><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></DeleteConfirmationDialog>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>

                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className='mt-6'/>
                </div>
            )}
            
            {isFormOpen && (
                <CreateUpdateKnitFormulaFormDialog
                    formula={editingFormula}
                    onSave={handleSave}
                    fabrics={mapToDropdownItems(fabricData?.items, {valueKey: 'id', labelKey: 'name'})}
                    threads={mapToDropdownItems(threadData?.items, {valueKey: 'id', labelKey: 'name'})}
                    isFabricsLoading={isFabricsLoading}
                    isThreadsLoading={isThreadsLoading}
                    closeDialog={closeDialog}
                />
            )}
        </Dialog>
    );
};

