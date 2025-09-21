import { useState, useEffect } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { RotateCcw, Plus, Pencil, Trash2, Loader2, Calendar as CalendarIcon, ArrowLeft } from 'lucide-react';
import { format } from "date-fns";

import { Table, TableHeader, TableHead, TableRow, TableBody, TableCell } from '@/components/ui/table';
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
import { Dropdown } from '@/components/Dropdown';
import { CreateUpdateMachineActivityFormDialog } from '@/components/MachineActivityFormDialog';

import { getInventories } from '@/service/inventory';
import { createMachineActivity, deleteMachineActivityById, getMachineActivities, updateMachineActivity } from '@/service/machine_activity';
import type { MachineActivityCreatePayload, MachineActivityData, MachineActivityUpdatePayload } from '@/model/machine_activity';
import { mapToDropdownItems } from '@/lib/mapper';
import { cn, formatDate, formatNumber } from '@/lib/utils';

export const MachineActivityPage = () => {
    const [currentPage, setCurrentPage] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingActivity, setEditingActivity] = useState<MachineActivityData | undefined>(undefined);
    
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const machineId = searchParams.get('id');
    const machineName = searchParams.get('name');

    // Filter states
    const [inventoryId, setInventoryId] = useState('');
    const [selectedDate, setSelectedDate] = useState<Date | undefined>();

    const itemsPerPage = 10;
    const queryClient = useQueryClient();

    // Redirect if no machineId is provided
    useEffect(() => {
        if (!machineId) {
            toast.error("ID Mesin tidak ditemukan.");
            navigate('/pabrik');
        }
    }, [machineId, navigate]);
    
    const formattedDate = selectedDate ? format(selectedDate, "yyyy-MM-dd") : undefined;

    const { data: activityData, isLoading, error } = useQuery({
        queryKey: ['machine-activities', { machineId, inventoryId, formattedDate, currentPage }],
        queryFn: () => getMachineActivities({ 
            machine_id: Number(machineId),
            inventory_id: inventoryId || undefined,
            date: formattedDate
        }, currentPage, itemsPerPage),
        enabled: !!machineId,
        placeholderData: keepPreviousData,
    });

    const { data: inventoryData, isLoading: isInventoriesLoading } = useQuery({
        queryKey: ['inventories-for-activities'],
        queryFn: () => getInventories({ type: 'fabric' }, 1, 9999),
    });

    const createMutation = useMutation({
        mutationFn: createMachineActivity,
        onSuccess: () => {
            toast.success(`Aktivitas baru berhasil dicatat.`);
            queryClient.invalidateQueries({ queryKey: ['machine-activities'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const updateMutation = useMutation({
        mutationFn: (variables: MachineActivityUpdatePayload & { id: number }) => {
            const { id, ...data } = variables;
            return updateMachineActivity(id, data);
        },
        onSuccess: () => {
            toast.success(`Aktivitas berhasil diubah.`);
            queryClient.invalidateQueries({ queryKey: ['machine-activities'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const deleteMutation = useMutation({
        mutationFn: deleteMachineActivityById,
        onSuccess: () => {
            toast.success(`Aktivitas berhasil dihapus.`);
            queryClient.invalidateQueries({ queryKey: ['machine-activities'] });
        },
        onError: (error) => { toast.error(error.message); },
    });

    const handleSave = async (data: MachineActivityCreatePayload | MachineActivityUpdatePayload) => {
        if (editingActivity) {
            updateMutation.mutate({ ...data, id: editingActivity.id });
        } else {
            createMutation.mutate(data as MachineActivityCreatePayload);
        }
    };
    
    const handleDelete = (id: number) => deleteMutation.mutate(id);
    const handleReset = () => {
        setInventoryId('');
        setSelectedDate(undefined);
    };

    const openAddDialog = () => {
        setEditingActivity(undefined);
        setIsFormOpen(true);
    };

    const openEditDialog = (activity: MachineActivityData) => {
        setEditingActivity(activity);
        setIsFormOpen(true);
    };

    const closeDialog = () => {
        setEditingActivity(undefined);
        setIsFormOpen(false);
    };

    const activities = activityData?.items ?? [];
    const totalPages = activityData?.total_pages ?? 1;

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <PageHeading headingTitle={`Detail Aktivitas Mesin : ${machineName}`} actionButton={() => {}} />
            
            <div className="mb-6">
                <Link to="/pabrik">
                    <Button variant="outline">
                        <ArrowLeft className="mr-2 h-4 w-4" /> Kembali ke Daftar Mesin
                    </Button>
                </Link>
            </div>

            <div className="bg-white dark:bg-gray-950 border p-4 rounded-xl shadow-sm mb-6">
                <div className="p-3 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div>
                        <Label className="block mb-2">Produksi (Kain)</Label>
                        <Dropdown items={mapToDropdownItems(inventoryData?.items, {valueKey: 'id', labelKey: 'name'})} value={inventoryId} onChange={setInventoryId} placeholder='Pilih kain' isLoading={isInventoriesLoading} />
                    </div>
                    <div>
                         <Label className="block mb-2">Tanggal</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button id="date" variant={"outline"} className={cn("w-full justify-start text-left font-normal", !selectedDate && "text-muted-foreground")}>
                                    <CalendarIcon className="mr-2 h-4 w-4" />
                                    {selectedDate ? format(selectedDate, "dd-MM-yyyy") : <span>Pilih tanggal</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                                <Calendar
                                    mode="single"
                                    selected={selectedDate}
                                    onSelect={setSelectedDate}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="flex flex-wrap gap-4 col-span-1 lg:col-span-2 justify-start md:justify-end">
                        <Button variant="outline" onClick={handleReset}><RotateCcw className="mr-2 h-4 w-4" />Reset Filter</Button>
                        <Button className="bg-blue-500 hover:bg-blue-600" onClick={openAddDialog}><Plus className="mr-2 h-4 w-4" />Tambah Aktivitas</Button>
                    </div>
                </div>
            </div>

            {isLoading ? (
                <div className="w-full h-96 flex justify-center items-center"><Loader2 className="h-8 w-8 animate-spin" /></div>
            ) : error ? (
                <div className="text-center p-8 text-red-500 bg-red-50 border rounded-xl shadow-sm">Error: {error.message}</div>
            ) : !activities.length ? (
                <div className="text-center p-8 text-gray-500 bg-gray-50 border rounded-xl shadow-sm">Tidak ada aktivitas tercatat untuk mesin ini.</div>
            ) : (
                <div>
                    <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden hidden md:block">
                        <Table>
                            <TableHeader><TableRow className="bg-blue-200 hover:bg-blue-200">
                                <TableHead className="pl-6 py-4">Tanggal</TableHead>
                                <TableHead>Produksi</TableHead>
                                <TableHead>Lot</TableHead>
                                <TableHead>Operator</TableHead>
                                <TableHead className="text-right">Benang Putus</TableHead>
                                <TableHead className="text-right">Hasil (Kg)</TableHead>
                                <TableHead>Keterangan</TableHead>
                                <TableHead className="text-center">Aksi</TableHead>
                            </TableRow></TableHeader>
                            <TableBody>
                                {activities.map((data) => (
                                    <TableRow key={data.id}>
                                        <TableCell className='pl-6'>{formatDate(data.date)}</TableCell>
                                        <TableCell>{data.inventory.name}</TableCell> {/* You might want to map this ID to an actual inventory name */}
                                        <TableCell>{data.lot}</TableCell>
                                        <TableCell>{data.operator}</TableCell>
                                        <TableCell className="text-right">{formatNumber(data.damaged_thread)}</TableCell>
                                        <TableCell className="text-right">{formatNumber(data.product_weight)}</TableCell>
                                        <TableCell className="max-w-36 whitespace-normal break-words">{data.note || '-'}</TableCell>
                                        <TableCell className="text-center py-4"><div className="flex items-center justify-center gap-2">
                                            <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}><Pencil className="h-4 w-4" /></Button>
                                            <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title={`Hapus aktivitas ini?`}><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></DeleteConfirmationDialog>
                                        </div></TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <div className="grid gap-4 md:hidden">
                        {activities.map((data) => (
                            <Card key={data.id}>
                                <CardHeader><CardTitle className="flex justify-between items-center text-base">
                                    <span>Lot: {data.lot}</span>
                                    <span className="text-sm font-normal text-gray-500">{formatDate(data.date)}</span>
                                </CardTitle></CardHeader>
                                <CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                                    <div className="font-semibold col-span-2 pb-1 border-b">Produksi: {data.inventory.name}</div>
                                    <div className="font-semibold text-gray-500">Operator</div><div className="text-right">{data.operator}</div>
                                    <div className="font-semibold text-gray-500">Benang Putus</div><div className="text-right">{formatNumber(data.damaged_thread)}</div>
                                    <div className="font-semibold text-gray-500">Hasil (Kg)</div><div className="text-right">{formatNumber(data.product_weight)}</div>
                                    <div className="col-span-2 pt-2 border-t">
                                        <div className="font-semibold text-gray-500">Keterangan:</div>
                                        <div className="text-gray-600 break-words mt-1">{data.note || '-'}</div>
                                    </div>
                                </CardContent>
                                <CardFooter className="flex justify-end gap-2">
                                    <Button variant="outline" size="icon" onClick={() => openEditDialog(data)}><Pencil className="h-4 w-4" /></Button>
                                    <DeleteConfirmationDialog onConfirm={() => handleDelete(data.id)} title={`Hapus aktivitas ini?`}><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></DeleteConfirmationDialog>
                                </CardFooter>
                            </Card>
                        ))}
                    </div>
                    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} className='mt-6'/>
                </div>
            )}
            
            {isFormOpen && machineId && (
                <CreateUpdateMachineActivityFormDialog
                    activity={editingActivity}
                    onSave={handleSave}
                    inventories={mapToDropdownItems(inventoryData?.items, {valueKey: 'id', labelKey: 'name'})}
                    isInventoriesLoading={isInventoriesLoading}
                    closeDialog={closeDialog}
                    machineId={Number(machineId)}
                />
            )}
        </Dialog>
    );
};
