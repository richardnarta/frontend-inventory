import { Toaster } from "@/components/ui/sonner"

import { InventoryPage } from './pages/Inventory';

import {
//   Plus, 
//   Pencil,
  CreditCard, 
//   Save, 
//   Loader2, 
  Scissors, 
//   X, 
  Droplets, 
  Tag, 
  Factory, 
  ShoppingCart,
  Spool,
  Layers,
} from 'lucide-react';

// --- SHADCN/UI COMPONENTS --- //
import { 
    // Button, 
    buttonVariants 
} from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
// import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
// import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
    Sidebar, 
    SidebarContent, 
    SidebarGroup, 
    SidebarGroupContent, 
    SidebarGroupLabel, 
    SidebarHeader, 
    SidebarMenu, 
    SidebarMenuItem, 
    SidebarProvider,
    useSidebar 
} from '@/components/ui/sidebar';
import { cn } from './lib/utils';
import { AccountReceivablePage } from './pages/AccountReceivable';

// // --- API CONFIGURATION --- //
// const API_BASE_URL = 'https://all-pillows-learn-yearly.a276.dcdg.xyz';

// const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { 
//   style: 'currency', currency: 'IDR', minimumFractionDigits: 0 
// }).format(amount);

// // --- HELPER FUNCTIONS & TYPES --- //
// const getDayName = (dateString: string) => {
//     const date = new Date(dateString);
//     return new Intl.DateTimeFormat('id-ID', { weekday: 'long' }).format(date);
// };

// // --- PAGE-SPECIFIC DATA & TYPES (Based on OpenAPI Spec) --- //
// type Buyer = { id: number; name: string; phone_num: string | null; };
// type AccountReceivable = { id: number; buyer: Buyer | null; period: string; age_0_30_days: number; age_31_60_days: number; age_61_90_days: number; age_over_90_days: number; total: number; };
// type CelupProcess = { id: number; supplier: string; fabricName: string; purchaseDate: string; initialWeight: number; status: 'Belum Celup' | 'Sudah Celup'; settingCost?: number; finishedWeight?: number; price?: number; };
// type KainInventoryItem = { id: string; name: string; stock_kg: number; };
// type ProductionRecord = { id: number; date: string; production: string; lot: string; operator: string; brokenYarn: number; weightKg: number; notes: string; };


// // --- MOCK DATA --- //
// let mockCelupProcesses: CelupProcess[] = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, supplier: `Supplier ${String.fromCharCode(65 + i)}`, fabricName: 'Kain Mentah Grey', purchaseDate: `2025-09-0${i + 1}`, initialWeight: 100 + i * 10, status: i % 2 === 0 ? 'Belum Celup' : 'Sudah Celup', settingCost: 50000 + i * 1000, finishedWeight: i % 2 !== 0 ? 95 + i * 10 : undefined, price: i % 2 !== 0 ? (95 + i * 10) * 25000 : undefined }));
// let mockKainInventory: KainInventoryItem[] = [ { id: 'kain-01', name: 'Kain Baby Terri Super', stock_kg: 250 }, { id: 'kain-02', name: 'Kain DKPE Premium', stock_kg: 180 }, { id: 'kain-03', name: 'SK Kelambu Halus', stock_kg: 320 }, ];

// // Mock APIs for other pages
// const getCelupProcesses = async (): Promise<CelupProcess[]> => new Promise(res => setTimeout(() => res(mockCelupProcesses), 500));
// const getKainInventory = async (): Promise<KainInventoryItem[]> => new Promise(res => setTimeout(() => res(mockKainInventory), 500));
// const getProductionData = async (): Promise<typeof mockProductionData> => new Promise(res => setTimeout(() => res(mockProductionData), 500));

// type BenangProduct = { id: string; name: string; roll_count: number; weight_kg: number; bale_count: number; price_per_kg: number; total: number; };
// const getBenangProducts = async (filters: { name?: string, id?: string }, page: number = 1, limit: number = 10): Promise<BenangApiResponse> => {
//     const url = new URL(`${API_BASE_URL}/v1/inventory`);
//     url.searchParams.append('page', String(page));
//     url.searchParams.append('limit', String(limit));
//     if (filters.name) url.searchParams.append('name', filters.name);
//     if (filters.id) url.searchParams.append('id', filters.id);
//     const response = await fetch(url.toString());
//     if (!response.ok) throw new Error('Failed to fetch products');
//     const data = await response.json();
//     return { items: data.items, total_pages: data.total_pages };
// };
// const RajutKainPage = () => {
//     const [yarns, setYarns] = useState<BenangProduct[]>([]);
//     const [recipeYarns, setRecipeYarns] = useState<{ id: number, yarnId: string | null, quantity: number }[]>([{id: 1, yarnId: null, quantity: 0}]);
    
//     useEffect(() => { getBenangProducts({ name: '', id: '' }, 1, 100).then(res => setYarns(res.items)); }, []);

//     const addYarnToRecipe = () => {
//         setRecipeYarns(prev => [...prev, {id: Date.now(), yarnId: null, quantity: 0}]);
//     };

//     const removeYarnFromRecipe = (id: number) => {
//         setRecipeYarns(prev => prev.filter(yarn => yarn.id !== id));
//     };

//     const handleRecipeChange = (id: number, field: 'yarnId' | 'quantity', value: string | number | null) => {
//         setRecipeYarns(prev => prev.map(yarn => yarn.id === id ? {...yarn, [field]: value} : yarn));
//     };

//     return (
//         <div className="space-y-6">
//             <Card>
//                 <CardHeader>
//                     <CardTitle>Bahan Resep (Benang)</CardTitle>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                     {recipeYarns.map((item, index) => (
//                         <div key={item.id} className="flex items-end gap-4">
//                             <div className="flex-1 space-y-2">
//                                 <Label htmlFor={`yarn-select-${index}`}>Pilih Benang</Label>
//                                 <Select onValueChange={(value) => handleRecipeChange(item.id, 'yarnId', value)}>
//                                     <SelectTrigger id={`yarn-select-${index}`}><SelectValue placeholder="Pilih resep benang..." /></SelectTrigger>
//                                     <SelectContent>{yarns.map(y => <SelectItem key={y.id} value={y.id}>{y.name} ({y.id})</SelectItem>)}</SelectContent>
//                                 </Select>
//                             </div>
//                              <div className="w-48 space-y-2">
//                                 <Label htmlFor={`yarn-quantity-${index}`}>Jumlah (Kg)</Label>
//                                 <Input id={`yarn-quantity-${index}`} type="number" placeholder="e.g., 50" onChange={e => handleRecipeChange(item.id, 'quantity', Number(e.target.value))}/>
//                             </div>
//                             <Button variant="ghost" size="icon" onClick={() => removeYarnFromRecipe(item.id)} disabled={recipeYarns.length <= 1}>
//                                 <X className="h-4 w-4"/>
//                             </Button>
//                         </div>
//                     ))}
//                      <Button variant="outline" onClick={addYarnToRecipe}><Plus className="mr-2 h-4 w-4"/> Tambah Benang</Button>
//                 </CardContent>
//             </Card>

//              <Card>
//                 <CardHeader><CardTitle>Hasil Jadi (Kain)</CardTitle></CardHeader>
//                 <CardContent className="grid md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                         <Label htmlFor="fabric-select">Pilih Kain Hasil</Label>
//                         <Select>
//                             <SelectTrigger id="fabric-select"><SelectValue placeholder="Pilih kain yang dihasilkan..." /></SelectTrigger>
//                             <SelectContent>
//                                {/* This would be populated from your fabric inventory */}
//                                <SelectItem value="kain-a">Kain Baby Terri</SelectItem>
//                                <SelectItem value="kain-b">Kain DKPE</SelectItem>
//                                <SelectItem value="kain-c">SK Kelambu</SelectItem>
//                             </SelectContent>
//                         </Select>
//                     </div>
//                     <div className="space-y-2">
//                         <Label htmlFor="fabric-quantity">Jumlah Produksi (Kg)</Label>
//                         <Input id="fabric-quantity" type="number" placeholder="e.g., 100"/>
//                     </div>
//                 </CardContent>
//             </Card>
//             <div className="flex justify-end">
//                 <Button size="lg"><Save className="mr-2 h-4 w-4" /> Simpan Resep & Produksi</Button>
//             </div>
//         </div>
//     );
// };

// // --- CelupPage Implementation --- //
// const CelupPage = () => {
//     const [processes, setProcesses] = useState<CelupProcess[]>([]);
//     const [isLoading, setIsLoading] = useState(true);
//     const [isFormOpen, setIsFormOpen] = useState(false);
//     const [editingProcess, setEditingProcess] = useState<CelupProcess | undefined>(undefined);
    
//     useEffect(() => { getCelupProcesses().then(data => { setProcesses(data); setIsLoading(false); }); }, []);

//     const openAddDialog = () => { setEditingProcess(undefined); setIsFormOpen(true); };
//     const openEditDialog = (process: CelupProcess) => { setEditingProcess(process); setIsFormOpen(true); };
//     const closeDialog = () => { setIsFormOpen(false); setEditingProcess(undefined); };
//     const handleSave = (data: any) => { console.log("Saving celup process:", data); };

//     if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

//     return (
//         <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
//             <div className="bg-white dark:bg-gray-950 border p-4 rounded-xl shadow-sm mb-6">
//                 <div className="flex justify-end">
//                      <Button className="bg-green-600 hover:bg-green-700" onClick={openAddDialog}><Plus className="mr-2 h-4 w-4" /> Beli Kain Mentah</Button>
//                 </div>
//             </div>
//             <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden">
//                 <Table>
//                     <TableHeader><TableRow><TableHead>Supplier</TableHead><TableHead>Nama Kain</TableHead><TableHead>Tgl Beli</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Berat Awal (Kg)</TableHead><TableHead className="text-right">Biaya Setting</TableHead><TableHead className="text-right">Berat Jadi (Kg)</TableHead><TableHead className="text-right">Harga Jual</TableHead><TableHead className="text-center">Actions</TableHead></TableRow></TableHeader>
//                     <TableBody>{processes.map((p) => (
//                         <TableRow key={p.id}>
//                             <TableCell>{p.supplier}</TableCell>
//                             <TableCell>{p.fabricName}</TableCell>
//                             <TableCell>{p.purchaseDate}</TableCell>
//                             <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'Sudah Celup' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.status}</span></TableCell>
//                             <TableCell className="text-right">{p.initialWeight.toFixed(2)}</TableCell>
//                             <TableCell className="text-right">{p.settingCost ? formatCurrency(p.settingCost) : '-'}</TableCell>
//                             <TableCell className="text-right">{p.finishedWeight?.toFixed(2) || '-'}</TableCell>
//                             <TableCell className="text-right font-semibold">{p.price ? formatCurrency(p.price) : '-'}</TableCell>
//                             <TableCell className="text-center"><Button variant="outline" size="sm" onClick={() => openEditDialog(p)}>{p.status === 'Belum Celup' ? 'Update Status' : 'Edit'}</Button></TableCell>
//                         </TableRow>
//                     ))}</TableBody>
//                 </Table>
//             </div>
//              {isFormOpen && <CelupFormDialog process={editingProcess} onSave={handleSave} closeDialog={closeDialog} />}
//         </Dialog>
//     );
// };

// // --- CelupFormDialog Implementation --- //
// const CelupFormDialog = ({ process, onSave, closeDialog }: { process?: CelupProcess, onSave: (data: any) => void, closeDialog: () => void }) => {
//     const [formData, setFormData] = useState({
//         supplier: process?.supplier || '',
//         fabricName: process?.fabricName || '',
//         purchaseDate: process?.purchaseDate || '',
//         initialWeight: process?.initialWeight || '',
//         status: process?.status || 'Belum Celup',
//         finishedWeight: process?.finishedWeight || '',
//         settingCost: process?.settingCost || '',
//     });
//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { const { id, value } = e.target; setFormData(prev => ({ ...prev, [id]: value })); };

//     return (
//         <DialogContent><DialogHeader><DialogTitle>{process ? 'Update Proses Celup' : 'Beli Kain Mentah'}</DialogTitle></DialogHeader>
//             <div className="grid gap-4 py-4">
//                 <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="supplier" className="text-right">Supplier</Label><Input id="supplier" value={formData.supplier} onChange={handleChange} className="col-span-3" /></div>
//                 <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="fabricName" className="text-right">Nama Kain</Label><Input id="fabricName" value={formData.fabricName} onChange={handleChange} className="col-span-3" /></div>
//                 <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="purchaseDate" className="text-right">Tgl Beli</Label><Input id="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} className="col-span-3" /></div>
//                 <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="initialWeight" className="text-right">Berat Awal (Kg)</Label><Input id="initialWeight" type="number" value={formData.initialWeight} onChange={handleChange} className="col-span-3" /></div>
//                 <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="settingCost" className="text-right">Biaya Setting</Label><Input id="settingCost" type="number" step="any" value={formData.settingCost} onChange={handleChange} className="col-span-3" placeholder="e.g., 50000" /></div>
//                 {process && (
//                     <>
//                         <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="status" className="text-right">Status</Label>
//                             <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({...prev, status: value as any}))}>
//                                 <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
//                                 <SelectContent><SelectItem value="Belum Celup">Belum Celup</SelectItem><SelectItem value="Sudah Celup">Sudah Celup</SelectItem></SelectContent>
//                             </Select>
//                         </div>
//                         <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="finishedWeight" className="text-right">Berat Jadi (Kg)</Label><Input id="finishedWeight" type="number" value={formData.finishedWeight} onChange={handleChange} className="col-span-3" disabled={formData.status === 'Belum Celup'} /></div>
//                     </>
//                 )}
//             </div>
//             <DialogFooter><Button type="button" variant="secondary" onClick={closeDialog}>Back</Button><Button onClick={() => { onSave({}); closeDialog(); }}><Save className="mr-2 h-4 w-4" /> Save</Button></DialogFooter>
//         </DialogContent>
//     );
// };


// // --- DataPabrikFormDialog Implementation --- //
// const DataPabrikFormDialog = ({ record, onSave, closeDialog }: { record?: ProductionRecord, onSave: (data: any) => void, closeDialog: () => void }) => {
//     const [formData, setFormData] = useState({
//         date: record?.date || new Date().toISOString().split('T')[0],
//         production: record?.production || '',
//         lot: record?.lot || '',
//         operator: record?.operator || '',
//         brokenYarn: record?.brokenYarn || '',
//         weightKg: record?.weightKg || '',
//         notes: record?.notes || '',
//     });
//     const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { const { id, value } = e.target; setFormData(prev => ({ ...prev, [id]: value })); };

//     return (
//         <DialogContent className="sm:max-w-[600px]"><DialogHeader><DialogTitle>{record ? 'Edit Catatan Produksi' : 'Tambah Catatan Produksi'}</DialogTitle></DialogHeader>
//             <div className="grid gap-4 py-4">
//                 <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="date" className="text-right">Tanggal</Label><Input id="date" type="date" value={formData.date} onChange={handleChange} className="col-span-3" /></div>
//                 <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="production" className="text-right">Produksi</Label><Input id="production" value={formData.production} onChange={handleChange} className="col-span-3" /></div>
//                 <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="lot" className="text-right">Lot</Label><Input id="lot" value={formData.lot} onChange={handleChange} className="col-span-3" /></div>
//                 <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="operator" className="text-right">Operator</Label><Input id="operator" value={formData.operator} onChange={handleChange} className="col-span-3" /></div>
//                 <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="brokenYarn" className="text-right">Benang Putus</Label><Input id="brokenYarn" type="number" value={formData.brokenYarn} onChange={handleChange} className="col-span-3" /></div>
//                 <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="weightKg" className="text-right">KG</Label><Input id="weightKg" type="number" step="any" value={formData.weightKg} onChange={handleChange} className="col-span-3" /></div>
//                 <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="notes" className="text-right">Keterangan</Label><Input id="notes" value={formData.notes} onChange={handleChange} className="col-span-3" /></div>
//             </div>
//             <DialogFooter><Button type="button" variant="secondary" onClick={closeDialog}>Batal</Button><Button onClick={() => { onSave({}); closeDialog(); }}><Save className="mr-2 h-4 w-4" /> Simpan</Button></DialogFooter>
//         </DialogContent>
//     );
// };

// // --- DataPabrikPage Implementation --- //
// const DataPabrikPage = () => {
//     const [productionData, setProductionData] = useState<{ [key: string]: ProductionRecord[] }>({});
//     const [isLoading, setIsLoading] = useState(true);
//     const [activeMachine, setActiveMachine] = useState('1');
//     const [isFormOpen, setIsFormOpen] = useState(false);
//     const [editingRecord, setEditingRecord] = useState<ProductionRecord | undefined>(undefined);
//     const [isAddMachineOpen, setIsAddMachineOpen] = useState(false);
//     const [newMachineName, setNewMachineName] = useState('');


//     useEffect(() => {
//         getProductionData().then(data => {
//             setProductionData(data);
//             if (Object.keys(data).length > 0) {
//               setActiveMachine(Object.keys(data)[0]);
//             }
//             setIsLoading(false);
//         });
//     }, []);
    
//     const handleAddMachine = () => {
//         if (newMachineName.trim() && !productionData[newMachineName.trim()]) {
//             const newMachineKey = newMachineName.trim();
//             setProductionData(prevData => ({
//                 ...prevData,
//                 [newMachineKey]: []
//             }));
//             setActiveMachine(newMachineKey);
//             setNewMachineName('');
//             setIsAddMachineOpen(false);
//         }
//     };

//     const openAddDialog = () => { setEditingRecord(undefined); setIsFormOpen(true); };
//     const openEditDialog = (record: ProductionRecord) => { setEditingRecord(record); setIsFormOpen(true); };
//     const closeDialog = () => { setIsFormOpen(false); setEditingRecord(undefined); };
//     const handleSave = (data: any) => { console.log(`Saving for machine ${activeMachine}:`, data); };

//     if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

//     const machineIds = Object.keys(productionData);
//     const currentMachineData = productionData[activeMachine] || [];

//     return (
//         <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
//             <div className="flex justify-between items-center mb-4">
//                  <div className="flex items-center gap-2">
//                      <Select value={activeMachine} onValueChange={setActiveMachine}>
//                         <SelectTrigger className="w-48"><SelectValue placeholder="Pilih Mesin..." /></SelectTrigger>
//                         <SelectContent>
//                             {machineIds.map(id => (
//                                 <SelectItem key={id} value={id}>Machine No {id}</SelectItem>
//                             ))}
//                         </SelectContent>
//                     </Select>
//                     <AlertDialog open={isAddMachineOpen} onOpenChange={setIsAddMachineOpen}>
//                         <AlertDialogTrigger asChild>
//                            <Button variant="outline" size="icon"><Plus className="h-4 w-4"/></Button>
//                         </AlertDialogTrigger>
//                         <AlertDialogContent>
//                             <AlertDialogHeader>
//                                 <AlertDialogTitle>Tambah Mesin Baru</AlertDialogTitle>
//                                 <AlertDialogDescription>
//                                     Masukkan nomor atau nama unik untuk mesin baru.
//                                 </AlertDialogDescription>
//                             </AlertDialogHeader>
//                             <div className="py-4">
//                                <Label htmlFor="new-machine-name">Nomor/Nama Mesin</Label>
//                                <Input 
//                                    id="new-machine-name" 
//                                    value={newMachineName}
//                                    onChange={(e) => setNewMachineName(e.target.value)}
//                                    placeholder="e.g., 4"
//                                />
//                             </div>
//                             <AlertDialogFooter>
//                                 <AlertDialogCancel onClick={() => setNewMachineName('')}>Batal</AlertDialogCancel>
//                                 <AlertDialogAction onClick={handleAddMachine}>Tambah</AlertDialogAction>
//                             </AlertDialogFooter>
//                         </AlertDialogContent>
//                     </AlertDialog>
//                 </div>
//                 <Button onClick={openAddDialog}><Plus className="mr-2 h-4 w-4" /> Tambah Data</Button>
//             </div>
            
//             <Card>
//                 <CardContent className="p-0">
//                     <Table>
//                         <TableHeader>
//                             <TableRow>
//                                 <TableHead className="w-[50px]">No</TableHead>
//                                 <TableHead>Hari & Tanggal</TableHead>
//                                 <TableHead>Produksi</TableHead>
//                                 <TableHead>Lot</TableHead>
//                                 <TableHead>Operator</TableHead>
//                                 <TableHead className="text-right">Benang Putus</TableHead>
//                                 <TableHead className="text-right">KG</TableHead>
//                                 <TableHead>Keterangan</TableHead>
//                                 <TableHead className="text-center">Actions</TableHead>
//                             </TableRow>
//                         </TableHeader>
//                         <TableBody>
//                             {currentMachineData.length > 0 ? currentMachineData.map((record, index) => (
//                                 <TableRow key={record.id}>
//                                     <TableCell>{index + 1}</TableCell>
//                                     <TableCell>{getDayName(record.date)}, {record.date}</TableCell>
//                                     <TableCell>{record.production}</TableCell>
//                                     <TableCell>{record.lot}</TableCell>
//                                     <TableCell>{record.operator}</TableCell>
//                                     <TableCell className="text-right">{record.brokenYarn}</TableCell>
//                                     <TableCell className="text-right">{record.weightKg.toFixed(2)}</TableCell>
//                                     <TableCell>{record.notes}</TableCell>
//                                     <TableCell className="text-center">
//                                         <Button variant="outline" size="icon" onClick={() => openEditDialog(record)}><Pencil className="h-4 w-4" /></Button>
//                                     </TableCell>
//                                 </TableRow>
//                             )) : (
//                                 <TableRow><TableCell colSpan={9} className="text-center h-24">Belum ada data produksi untuk mesin ini.</TableCell></TableRow>
//                             )}
//                         </TableBody>
//                     </Table>
//                 </CardContent>
//             </Card>
//             {isFormOpen && <DataPabrikFormDialog record={editingRecord} onSave={handleSave} closeDialog={closeDialog} />}
//         </Dialog>
//     );
// };

import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { BuyerPage } from './pages/Buyer';
import { SalesTransactionPage } from './pages/Sales';
import { ProgressPage } from './pages/Progress';

type NavGroup = { name: string; items: NavLinks[] }
type NavLinks = { name: string; icon: React.ReactNode; path: string; };

const navGroup: NavGroup[] = [
    {
        name: 'Stok Barang',
        items: [
            { name: 'Stok Benang', icon: <Spool className="h-5 w-5" />, path: '/benang' },
            { name: 'Stok Kain', icon: <Layers className="h-5 w-5" />, path: '/kain' },
        ]
    },
    {
        name: 'Produksi Pabrik',
        items: [
            { name: 'Menu Rajut', icon: <Scissors className="h-5 w-5" />, path: '/rajut' },
            { name: 'Menu Celup', icon: <Droplets className="h-5 w-5" />, path: '/celup' },
        ]
    },
    {
        name: 'Transaksi',
        items: [
            { name: 'Menu Pembelian', icon: <ShoppingCart className="h-5 w-5" />, path: '/pembelian' },
            { name: 'Menu Penjualan', icon: <Tag className="h-5 w-5" />, path: '/penjualan' },
            { name: 'Menu Piutang', icon: <CreditCard className="h-5 w-5" />, path: '/piutang' },
        ]
    },
    {
        name: 'Manajemen Pabrik',
        items: [
            { name: 'Data Pabrik', icon: <Factory className="h-5 w-5" />, path: '/pabrik' },
            { name: 'Data Pembeli', icon: <Factory className="h-5 w-5" />, path: '/pembeli' },
            { name: 'Data Supplier', icon: <Factory className="h-5 w-5" />, path: '/supplier' }
        ]
    }
]

function AppLayout() {
    const { open, isMobile, setOpenMobile } = useSidebar();

    const handleNavLinkClick = () => {
        if (isMobile) {
            setOpenMobile(false);
        }
    };
  
    return (
        <div className="bg-gray-50/50 dark:bg-gray-900/50 min-h-screen font-sans flex w-full">
            <Sidebar collapsible="icon">
                <SidebarContent>
                    <SidebarHeader className='px-4 pt-4 pb-2 text-left'>
                        <h1 className={cn(
                            "font-bold text-blue-500 dark:text-blue-300",
                            !open && !isMobile ? "text-xl" : "text-2xl"
                        )}>
                            {!open && !isMobile ? 'IA' : 'InventoryApp'}
                        </h1>
                    </SidebarHeader>
                    {navGroup.map((group) => (
                        <SidebarGroup className='py-0' key={group.name}>
                            <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
                            <SidebarGroupContent>
                                <SidebarMenu>
                                    {group.items.map((link) => (
                                        <SidebarMenuItem key={link.path}>
                                            <NavLink
                                                to={link.path}
                                                onClick={handleNavLinkClick}
                                                className={({ isActive }) => cn(
                                                    buttonVariants({
                                                        variant: isActive ? "secondary" : "ghost",
                                                        size: open ? "default" : "icon"
                                                    }),
                                                    "w-full gap-2",
                                                    open ? "justify-start" : "justify-center",
                                                    isActive && "bg-blue-200 text-dark hover:bg-blue-300 dark:bg-blue-800 dark:text-blue-50 dark:hover:bg-blue-900"
                                                )}
                                            >
                                                {link.icon}
                                                {open && <span>{link.name}</span>}
                                            </NavLink>
                                        </SidebarMenuItem>
                                    ))}
                                </SidebarMenu>
                            </SidebarGroupContent>
                        </SidebarGroup>
                    ))}
                    
                </SidebarContent>
            </Sidebar>
            <main className="p-6 w-full">
                <Routes>
                    <Route path='/benang' element={<InventoryPage key="thread-page" type='thread' typeMessage='benang' />} />
                    <Route path='/kain' element={<InventoryPage key="fabric-page" type='fabric' typeMessage='kain' />} />
                    <Route path='/rajut' element={<ProgressPage name='Menu Rajut'/>} />
                    <Route path='/celup' element={<ProgressPage name='Menu Celup'/>} />
                    <Route path='/pembelian' element={<ProgressPage name='Menu Pembelian'/>} />
                    <Route path='/penjualan' element={<SalesTransactionPage />} />
                    <Route path='/piutang' element={<AccountReceivablePage />} />
                    <Route path='/pabrik' element={<ProgressPage name='Data Pabrik'/>} />
                    <Route path='/pembeli' element={<BuyerPage />} />
                    <Route path='/supplier' element={<ProgressPage name='Data Supplier'/>} />
                    <Route path="/" element={<Navigate to="/benang" />} />
                </Routes>
            </main>
            <Toaster richColors />
        </div>
    );
}

export default function App() {
  return (
    <BrowserRouter>
        <SidebarProvider>
            <AppLayout />
        </SidebarProvider>
    </BrowserRouter>
  );
}