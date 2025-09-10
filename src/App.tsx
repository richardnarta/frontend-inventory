import React, { useState, useEffect, useMemo } from 'react';

// --- ICONS FROM LUCIDE-REACT --- //
import {
  Search, RotateCcw, Plus, Pencil, Trash2, ChevronLeft, ChevronRight, Menu, LayoutDashboard, Package, FileText, CreditCard, Save, Loader2, Scissors, X, Droplets, Tag
} from 'lucide-react';

// --- SHADCN/UI COMPONENTS --- //
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from '@/components/ui/table';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


// --- API CONFIGURATION --- //
const API_BASE_URL = 'https://all-pillows-learn-yearly.a276.dcdg.xyz';

// --- HELPER FUNCTIONS & TYPES --- //
const formatCurrency = (amount: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
type NavLink = { name: string; icon: React.ReactNode; };
type DashboardSheetProps = { links: NavLink[]; activeLink: string; onNavigate: (name: string) => void; };

// --- CUSTOM HOOKS --- //
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);
  return debouncedValue;
}


// --- PAGE-SPECIFIC DATA & TYPES (Based on OpenAPI Spec) --- //
type BenangProduct = { id: string; name: string; roll_count: number; weight_kg: number; bale_count: number; price_per_kg: number; total: number; };
type Buyer = { id: number; name: string; phone_num: string | null; };
type SalesTransaction = { id: number; transaction_date: string; buyer: Buyer | null; inventory: BenangProduct | null; roll_count: number; weight_kg: number; price_per_kg: number; total: number; };
type AccountReceivable = { id: number; buyer: Buyer | null; period: string; age_0_30_days: number; age_31_60_days: number; age_61_90_days: number; age_over_90_days: number; total: number; };
type CelupProcess = { id: number; supplier: string; fabricName: string; purchaseDate: string; initialWeight: number; status: 'Belum Celup' | 'Sudah Celup'; settingCost?: number; finishedWeight?: number; price?: number; };
type KainInventoryItem = { id: string; name: string; stock_kg: number; }; // For Menu Jual
type SoldFabric = { id: number; item: KainInventoryItem; quantitySoldKg: number; salePrice: number; saleDate: string; };


// --- MOCK DATA --- //
let mockBuyers: Buyer[] = Array.from({ length: 6 }, (_, i) => ({ id: i + 1, name: ['andi', 'titus', 'didin', 'riki', 'endang', 'samuel'][i], phone_num: `081234567${80 + i}` }));
let mockKainTransactions: SalesTransaction[] = Array.from({ length: 15 }, (_, i) => ({ id: i + 1, transaction_date: new Date().toISOString(), buyer: mockBuyers[i % mockBuyers.length], inventory: { id: `benang_${i}`, name: ['Kain Baby Terri', 'Kain DKPE', 'SK Kelambu'][i % 3], roll_count: 0, weight_kg: 0, bale_count: 0, price_per_kg: 0, total: 0 }, roll_count: (i % 5) + 1, weight_kg: 22 + i * 5, price_per_kg: 35000 + i * 1000, total: (35000 + i * 1000) * ((i % 5) + 1) }));
let mockPiutangRecords: AccountReceivable[] = Array.from({ length: 12 }, (_, i) => {
    const age_0_30_days = i % 4 === 0 ? 115000 + i * 5000 : 0;
    const age_31_60_days = i % 4 === 1 ? 220000 + i * 5000 : 0;
    const age_61_90_days = i % 4 === 2 ? 150000 + i * 10000 : 0;
    const age_over_90_days = i % 4 === 3 ? 125000 + i * 2000 : 0;
    const total = age_0_30_days + age_31_60_days + age_61_90_days + age_over_90_days;
    return { id: i + 1, buyer: mockBuyers[i % mockBuyers.length], period: 'Apr-25', age_0_30_days, age_31_60_days, age_61_90_days, age_over_90_days, total };
});
let mockCelupProcesses: CelupProcess[] = Array.from({ length: 8 }, (_, i) => ({ id: i + 1, supplier: `Supplier ${String.fromCharCode(65 + i)}`, fabricName: 'Kain Mentah Grey', purchaseDate: `2025-09-0${i + 1}`, initialWeight: 100 + i * 10, status: i % 2 === 0 ? 'Belum Celup' : 'Sudah Celup', settingCost: 50000 + i * 1000, finishedWeight: i % 2 !== 0 ? 95 + i * 10 : undefined, price: i % 2 !== 0 ? (95 + i * 10) * 25000 : undefined }));
let mockKainInventory: KainInventoryItem[] = [
    { id: 'kain-01', name: 'Kain Baby Terri Super', stock_kg: 250 },
    { id: 'kain-02', name: 'Kain DKPE Premium', stock_kg: 180 },
    { id: 'kain-03', name: 'SK Kelambu Halus', stock_kg: 320 },
];
let mockSoldFabrics: SoldFabric[] = Array.from({ length: 5 }, (_, i) => ({ id: i + 1, item: mockKainInventory[i % mockKainInventory.length], quantitySoldKg: 20 + i * 5, salePrice: 1250000 + (i * 100000), saleDate: `2025-09-0${i + 1}` }));


// --- API SERVICE FUNCTIONS --- //

// Benang API (Real)
type BenangApiResponse = { items: BenangProduct[]; total_pages: number; };
const getBenangProducts = async (filters: { name?: string, id?: string }, page: number = 1, limit: number = 10): Promise<BenangApiResponse> => {
    const url = new URL(`${API_BASE_URL}/v1/inventory`);
    url.searchParams.append('page', String(page));
    url.searchParams.append('limit', String(limit));
    if (filters.name) url.searchParams.append('name', filters.name);
    if (filters.id) url.searchParams.append('id', filters.id);
    const response = await fetch(url.toString());
    if (!response.ok) throw new Error('Failed to fetch products');
    const data = await response.json();
    return { items: data.items, total_pages: data.total_pages };
};
const createBenangProduct = async (productData: Omit<BenangProduct, 'total'>) => {
    const response = await fetch(`${API_BASE_URL}/v1/inventory`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) });
    if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail || 'Failed to create product'); }
    return response.json();
};
const updateBenangProduct = async (id: string, productData: Omit<BenangProduct, 'id' | 'total'>) => {
    const response = await fetch(`${API_BASE_URL}/v1/inventory/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(productData) });
    if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail || 'Failed to update product'); }
    return response.json();
};
const deleteBenangProduct = async (id: string) => {
    const response = await fetch(`${API_BASE_URL}/v1/inventory/${id}`, { method: 'DELETE' });
    if (!response.ok) { const errorData = await response.json(); throw new Error(errorData.detail || 'Failed to delete product'); }
    return { message: 'Product deleted successfully' };
};

// Mock APIs for other pages
const getKainTransactions = async (): Promise<SalesTransaction[]> => new Promise(res => setTimeout(() => res(mockKainTransactions), 500));
const getPiutangRecords = async (): Promise<AccountReceivable[]> => new Promise(res => setTimeout(() => res(mockPiutangRecords), 500));
const getCelupProcesses = async (): Promise<CelupProcess[]> => new Promise(res => setTimeout(() => res(mockCelupProcesses), 500));
const getKainInventory = async (): Promise<KainInventoryItem[]> => new Promise(res => setTimeout(() => res(mockKainInventory), 500));
const getSoldFabrics = async (): Promise<SoldFabric[]> => new Promise(res => setTimeout(() => res(mockSoldFabrics), 500));


// --- NAVIGATION CONFIGURATION --- //
const navLinks: NavLink[] = [
    { name: 'Menu benang', icon: <Package className="h-5 w-5" /> },
    { name: 'Menu kain', icon: <FileText className="h-5 w-5" /> },
    { name: 'Menu piutang', icon: <CreditCard className="h-5 w-5" /> },
    { name: 'Menu Rajut Kain', icon: <Scissors className="h-5 w-5" /> },
    { name: 'Menu Celup', icon: <Droplets className="h-5 w-5" /> },
    { name: 'Menu Jual', icon: <Tag className="h-5 w-5" /> },
];

// --- REUSABLE COMPONENTS --- //

const DashboardSheet = ({ links, activeLink, onNavigate }: DashboardSheetProps) => (
    <Sheet><SheetTrigger asChild><Button variant="outline" size="icon" className="lg:hidden"><Menu className="h-5 w-5" /><span className="sr-only">Open Menu</span></Button></SheetTrigger>
        <SheetContent side="left" className="w-72 sm:w-80"><SheetHeader><SheetTitle className="text-2xl font-bold text-blue-600 flex items-center gap-2"><LayoutDashboard />InventoryApp</SheetTitle></SheetHeader>
            <nav className="flex flex-col space-y-2 py-8">{links.map((link) => (<Button key={link.name} variant={activeLink === link.name ? "secondary" : "ghost"} className="w-full justify-start text-md h-12 gap-3 px-4" onClick={() => onNavigate(link.name)}>{link.icon}<span>{link.name}</span></Button>))}</nav>
        </SheetContent>
    </Sheet>
);

const BenangFormDialog = ({ product, onSave, closeDialog }: { product?: BenangProduct, onSave: (data: any) => Promise<void>, closeDialog: () => void }) => {
    const [formData, setFormData] = useState({ id: product?.id || '', name: product?.name || '', roll_count: product?.roll_count || '', weight_kg: product?.weight_kg || '', bale_count: product?.bale_count || '', price_per_kg: product?.price_per_kg || '' });
    const [isSaving, setIsSaving] = useState(false);
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { const { id, value } = e.target; setFormData(prev => ({ ...prev, [id]: value })); };
    const handleSubmit = async () => {
        setIsSaving(true);
        try {
            const dataToSave = { ...formData, roll_count: Number(formData.roll_count) || 0, weight_kg: Number(formData.weight_kg) || 0, bale_count: Number(formData.bale_count) || 0, price_per_kg: Number(formData.price_per_kg) || 0 };
            await onSave(dataToSave);
            closeDialog();
        } catch (error) { console.error("Save failed:", error); } finally { setIsSaving(false); }
    };
    return (
        <DialogContent><DialogHeader><DialogTitle>{product ? 'Edit Barang' : 'Tambah Barang Baru'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="id" className="text-right">Kode barang</Label><Input id="id" value={formData.id} onChange={handleChange} className="col-span-3" disabled={!!product} /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="name" className="text-right">Nama barang</Label><Input id="name" value={formData.name} onChange={handleChange} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="roll_count" className="text-right">Jumlah Roll</Label><Input id="roll_count" type="number" value={formData.roll_count} onChange={handleChange} className="col-span-3" placeholder="e.g., 10" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="weight_kg" className="text-right">Berat (KG)</Label><Input id="weight_kg" type="number" step="any" value={formData.weight_kg} onChange={handleChange} className="col-span-3" placeholder="e.g., 22.5" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="bale_count" className="text-right">Jumlah Bale</Label><Input id="bale_count" type="number" value={formData.bale_count} onChange={handleChange} className="col-span-3" placeholder="e.g., 5" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="price_per_kg" className="text-right">Harga per Kg</Label><Input id="price_per_kg" type="number" step="any" value={formData.price_per_kg} onChange={handleChange} className="col-span-3" placeholder="e.g., 15000.75" /></div>
            </div>
            <DialogFooter><Button type="button" variant="secondary" onClick={closeDialog}>Back</Button><Button onClick={handleSubmit} disabled={isSaving}>{isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save</Button></DialogFooter>
        </DialogContent>
    );
};

// --- BenangPage Implementation --- //
const BenangPage = () => {
    const [products, setProducts] = useState<BenangProduct[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<BenangProduct | undefined>(undefined);
    const [searchId, setSearchId] = useState('');
    const [searchName, setSearchName] = useState('');
    const debouncedSearchId = useDebounce(searchId, 500);
    const debouncedSearchName = useDebounce(searchName, 500);
    const itemsPerPage = 10;

    const fetchProducts = async (filters: { name?: string; id?: string }, page: number) => {
        setIsLoading(true);
        setError(null);
        try {
            const { items, total_pages } = await getBenangProducts(filters, page, itemsPerPage);
            setProducts(items);
            setTotalPages(total_pages);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        setCurrentPage(1);
        fetchProducts({ name: debouncedSearchName, id: debouncedSearchId }, 1);
    }, [debouncedSearchName, debouncedSearchId]);

    useEffect(() => {
        fetchProducts({ name: debouncedSearchName, id: debouncedSearchId }, currentPage);
    }, [currentPage]);

    const handleReset = () => {
        setSearchId('');
        setSearchName('');
    };

    const handleSave = async (data: Omit<BenangProduct, 'total'>) => {
        if (editingProduct) {
            await updateBenangProduct(editingProduct.id, data);
        } else {
            await createBenangProduct(data);
        }
        await fetchProducts({ name: debouncedSearchName, id: debouncedSearchId }, currentPage);
    };

    const handleDelete = async (id: string) => {
        try {
            await deleteBenangProduct(id);
            await fetchProducts({ name: debouncedSearchName, id: debouncedSearchId }, currentPage);
        } catch (error) {
            console.error("Delete failed:", error);
        }
    };

    const openAddDialog = () => { setEditingProduct(undefined); setIsFormOpen(true); };
    const openEditDialog = (product: BenangProduct) => { setEditingProduct(product); setIsFormOpen(true); };
    const closeDialog = () => { setIsFormOpen(false); setEditingProduct(undefined); };

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <div className="bg-white dark:bg-gray-950 border p-4 rounded-xl shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div><Label htmlFor="searchId" className="block mb-2">Kode Barang</Label><Input id="searchId" placeholder="Search by code..." value={searchId} onChange={e => setSearchId(e.target.value)} /></div>
                    <div><Label htmlFor="searchName" className="block mb-2">Nama Barang</Label><Input id="searchName" placeholder="Search by name..." value={searchName} onChange={e => setSearchName(e.target.value)} /></div>
                    <div className="flex flex-wrap gap-2 col-span-1 md:col-span-2 justify-start md:justify-end">
                        <Button variant="outline" onClick={handleReset}><RotateCcw className="mr-2 h-4 w-4" /> Reset</Button>
                        <Button className="bg-green-600 hover:bg-green-700" onClick={openAddDialog}><Plus className="mr-2 h-4 w-4" /> Add Data</Button>
                    </div>
                </div>
            </div>
            {isLoading ? <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div> : error ? <div className="text-center p-8 text-red-500 bg-red-50 border rounded-xl shadow-sm">Error: {error}</div> :
            (<div>
                <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden hidden sm:block">
                    <Table>
                        <TableHeader><TableRow><TableHead>Kode Barang</TableHead><TableHead>Nama Barang</TableHead><TableHead className="text-right">Jumlah Roll</TableHead><TableHead className="text-right">Berat (Kg)</TableHead><TableHead className="text-right">Harga per Kg</TableHead><TableHead className="text-right">Nilai Total</TableHead><TableHead className="text-center">Actions</TableHead></TableRow></TableHeader>
                        <TableBody>{products.map((p) => (<TableRow key={p.id}><TableCell className="font-medium">{p.id}</TableCell><TableCell>{p.name}</TableCell><TableCell className="text-right">{p.roll_count}</TableCell><TableCell className="text-right">{p.weight_kg.toFixed(2)}</TableCell><TableCell className="text-right">{formatCurrency(p.price_per_kg)}</TableCell><TableCell className="text-right font-semibold">{formatCurrency(p.total)}</TableCell><TableCell className="text-center"><div className="flex items-center justify-center gap-2"><Button variant="outline" size="icon" onClick={() => openEditDialog(p)}><Pencil className="h-4 w-4" /></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(p.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></div></TableCell></TableRow>))}</TableBody>
                    </Table>
                </div>
                <div className="grid gap-4 sm:hidden">{products.map((p) => (<Card key={p.id}><CardHeader><CardTitle className="flex justify-between items-start"><span>{p.name}</span><span className="text-sm font-mono text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{p.id}</span></CardTitle></CardHeader><CardContent className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm"><div className="font-semibold text-gray-500">Jumlah Roll</div><div className="text-right">{p.roll_count}</div><div className="font-semibold text-gray-500">Berat (Kg)</div><div className="text-right">{p.weight_kg.toFixed(2)}</div><div className="font-semibold text-gray-500">Harga per Kg</div><div className="text-right">{formatCurrency(p.price_per_kg)}</div><div className="font-semibold text-gray-500">Nilai Total</div><div className="text-right font-bold">{formatCurrency(p.total)}</div></CardContent><CardFooter className="flex justify-end gap-2"><Button variant="outline" size="icon" onClick={() => openEditDialog(p)}><Pencil className="h-4 w-4" /></Button><AlertDialog><AlertDialogTrigger asChild><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></AlertDialogTrigger><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Are you sure?</AlertDialogTitle><AlertDialogDescription>This action cannot be undone.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={() => handleDelete(p.id)}>Delete</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></CardFooter></Card>))}</div>
                <div className="flex justify-center items-center mt-6 gap-4"><Button variant="outline" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="mr-2 h-4 w-4" /> Prev</Button><span className="text-sm text-gray-600 dark:text-gray-400">Page {currentPage} of {totalPages || 1}</span><Button variant="outline" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage >= totalPages}>Next <ChevronRight className="ml-2 h-4 w-4" /></Button></div>
            </div>
            )}
            {isFormOpen && <BenangFormDialog product={editingProduct} onSave={handleSave} closeDialog={closeDialog} />}
        </Dialog>
    );
};

// --- KainPage Implementation --- //
const KainPage = () => {
    const [transactions, setTransactions] = useState<SalesTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => { getKainTransactions().then(data => { setTransactions(data); setIsLoading(false); }); }, []);
    
    if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div>
            <div className="bg-white dark:bg-gray-950 border p-4 rounded-xl shadow-sm mb-6">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div><Label htmlFor="search1" className="block mb-2">Nama Pelanggan</Label><Input id="search1" placeholder="Search..." /></div>
                    <div><Label htmlFor="search2" className="block mb-2">Nama Barang</Label><Input id="search2" placeholder="Search..." /></div>
                    <div className="flex flex-wrap gap-2 col-span-1 md:col-span-2 justify-start md:justify-end">
                        <Button variant="outline"><RotateCcw className="mr-2 h-4 w-4" /> Reset</Button>
                        <Button className="bg-green-600 hover:bg-green-700"><Plus className="mr-2 h-4 w-4" /> Add Data</Button>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader><TableRow><TableHead>Nama Pelanggan</TableHead><TableHead>No Telepon</TableHead><TableHead>Nama Barang</TableHead><TableHead className="text-right">Jumlah Roll</TableHead><TableHead className="text-right">Banyaknya (Kg)</TableHead><TableHead className="text-right">Harga Satuan</TableHead><TableHead className="text-right">Jumlah</TableHead><TableHead className="text-center">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>{transactions.map((t) => (
                        <TableRow key={t.id}>
                            <TableCell>{t.buyer?.name || '-'}</TableCell>
                            <TableCell>{t.buyer?.phone_num || '-'}</TableCell>
                            <TableCell>{t.inventory?.name || '-'}</TableCell>
                            <TableCell className="text-right">{t.roll_count}</TableCell>
                            <TableCell className="text-right">{t.weight_kg.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(t.price_per_kg)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(t.total)}</TableCell>
                            <TableCell className="text-center"><div className="flex items-center justify-center gap-2"><Button variant="outline" size="icon"><Pencil className="h-4 w-4" /></Button><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table>
            </div>
        </div>
    );
};

// --- PiutangPage Implementation --- //
const PiutangPage = () => {
    const [receivables, setReceivables] = useState<AccountReceivable[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    useEffect(() => { getPiutangRecords().then(data => { setReceivables(data); setIsLoading(false); }); }, []);

    if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    const totalPiutang = receivables.reduce((sum, r) => sum + r.total, 0);

    return (
        <div>
            <div className="bg-white dark:bg-gray-950 border p-4 rounded-xl shadow-sm mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 items-end">
                    <div><Label htmlFor="search1" className="block mb-2">Nama Pelanggan</Label><Input id="search1" placeholder="Search..." /></div>
                    <div><Label htmlFor="search2" className="block mb-2">Periode</Label><Input id="search2" placeholder="e.g., Apr-25" /></div>
                    <div className="flex flex-wrap gap-2 col-span-1 md:col-span-2 justify-start md:justify-end">
                        <Button variant="outline"><RotateCcw className="mr-2 h-4 w-4" /> Reset</Button>
                        <Button className="bg-green-600 hover:bg-green-700"><Plus className="mr-2 h-4 w-4" /> Add Data</Button>
                    </div>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow><TableHead rowSpan={2} className="align-bottom">Nama Pelanggan</TableHead><TableHead colSpan={4} className="text-center">Usia Piutang</TableHead><TableHead rowSpan={2} className="text-right align-bottom">Total Piutang</TableHead><TableHead rowSpan={2} className="text-center align-bottom">Actions</TableHead></TableRow>
                        <TableRow><TableHead className="text-right">0-30 Hari</TableHead><TableHead className="text-right">31-60 Hari</TableHead><TableHead className="text-right">61-90 Hari</TableHead><TableHead className="text-right">&gt;90 Hari</TableHead></TableRow>
                    </TableHeader>
                    <TableBody>{receivables.map((r) => (
                        <TableRow key={r.id}>
                            <TableCell>{r.buyer?.name || '-'}</TableCell>
                            <TableCell className="text-right">{formatCurrency(r.age_0_30_days)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(r.age_31_60_days)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(r.age_61_90_days)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(r.age_over_90_days)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatCurrency(r.total)}</TableCell>
                            <TableCell className="text-center"><div className="flex items-center justify-center gap-2"><Button variant="outline" size="icon"><Pencil className="h-4 w-4" /></Button><Button variant="destructive" size="icon"><Trash2 className="h-4 w-4" /></Button></div></TableCell>
                        </TableRow>
                    ))}</TableBody>
                    <TableFooter><TableRow><TableCell colSpan={6} className="font-bold text-right">Total Keseluruhan</TableCell><TableCell className="text-right font-bold">{formatCurrency(totalPiutang)}</TableCell><TableCell></TableCell></TableRow></TableFooter>
                </Table>
            </div>
        </div>
    );
};

// --- RajutKainPage Implementation --- //
const RajutKainPage = () => {
    const [yarns, setYarns] = useState<BenangProduct[]>([]);
    const [recipeYarns, setRecipeYarns] = useState<{ id: number, yarnId: string | null, quantity: number }[]>([{id: 1, yarnId: null, quantity: 0}]);
    
    useEffect(() => { getBenangProducts({ name: '', id: '' }, 1, 100).then(res => setYarns(res.items)); }, []);

    const addYarnToRecipe = () => {
        setRecipeYarns(prev => [...prev, {id: Date.now(), yarnId: null, quantity: 0}]);
    };

    const removeYarnFromRecipe = (id: number) => {
        setRecipeYarns(prev => prev.filter(yarn => yarn.id !== id));
    };

    const handleRecipeChange = (id: number, field: 'yarnId' | 'quantity', value: string | number | null) => {
        setRecipeYarns(prev => prev.map(yarn => yarn.id === id ? {...yarn, [field]: value} : yarn));
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Bahan Resep (Benang)</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {recipeYarns.map((item, index) => (
                        <div key={item.id} className="flex items-end gap-4">
                            <div className="flex-1 space-y-2">
                                <Label htmlFor={`yarn-select-${index}`}>Pilih Benang</Label>
                                <Select onValueChange={(value) => handleRecipeChange(item.id, 'yarnId', value)}>
                                    <SelectTrigger id={`yarn-select-${index}`}><SelectValue placeholder="Pilih resep benang..." /></SelectTrigger>
                                    <SelectContent>{yarns.map(y => <SelectItem key={y.id} value={y.id}>{y.name} ({y.id})</SelectItem>)}</SelectContent>
                                </Select>
                            </div>
                             <div className="w-48 space-y-2">
                                <Label htmlFor={`yarn-quantity-${index}`}>Jumlah (Kg)</Label>
                                <Input id={`yarn-quantity-${index}`} type="number" placeholder="e.g., 50" onChange={e => handleRecipeChange(item.id, 'quantity', Number(e.target.value))}/>
                            </div>
                            <Button variant="ghost" size="icon" onClick={() => removeYarnFromRecipe(item.id)} disabled={recipeYarns.length <= 1}>
                                <X className="h-4 w-4"/>
                            </Button>
                        </div>
                    ))}
                     <Button variant="outline" onClick={addYarnToRecipe}><Plus className="mr-2 h-4 w-4"/> Tambah Benang</Button>
                </CardContent>
            </Card>

             <Card>
                <CardHeader><CardTitle>Hasil Jadi (Kain)</CardTitle></CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="fabric-select">Pilih Kain Hasil</Label>
                        <Select>
                            <SelectTrigger id="fabric-select"><SelectValue placeholder="Pilih kain yang dihasilkan..." /></SelectTrigger>
                            <SelectContent>
                               {/* This would be populated from your fabric inventory */}
                               <SelectItem value="kain-a">Kain Baby Terri</SelectItem>
                               <SelectItem value="kain-b">Kain DKPE</SelectItem>
                               <SelectItem value="kain-c">SK Kelambu</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="fabric-quantity">Jumlah Produksi (Kg)</Label>
                        <Input id="fabric-quantity" type="number" placeholder="e.g., 100"/>
                    </div>
                </CardContent>
            </Card>
            <div className="flex justify-end">
                <Button size="lg"><Save className="mr-2 h-4 w-4" /> Simpan Resep & Produksi</Button>
            </div>
        </div>
    );
};

// --- CelupPage Implementation --- //
const CelupPage = () => {
    const [processes, setProcesses] = useState<CelupProcess[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProcess, setEditingProcess] = useState<CelupProcess | undefined>(undefined);
    
    useEffect(() => { getCelupProcesses().then(data => { setProcesses(data); setIsLoading(false); }); }, []);

    const openAddDialog = () => { setEditingProcess(undefined); setIsFormOpen(true); };
    const openEditDialog = (process: CelupProcess) => { setEditingProcess(process); setIsFormOpen(true); };
    const closeDialog = () => { setIsFormOpen(false); setEditingProcess(undefined); };
    const handleSave = (data: any) => { console.log("Saving celup process:", data); };

    if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
            <div className="bg-white dark:bg-gray-950 border p-4 rounded-xl shadow-sm mb-6">
                <div className="flex justify-end">
                     <Button className="bg-green-600 hover:bg-green-700" onClick={openAddDialog}><Plus className="mr-2 h-4 w-4" /> Beli Kain Mentah</Button>
                </div>
            </div>
            <div className="bg-white dark:bg-gray-950 border rounded-xl shadow-sm overflow-hidden">
                <Table>
                    <TableHeader><TableRow><TableHead>Supplier</TableHead><TableHead>Nama Kain</TableHead><TableHead>Tgl Beli</TableHead><TableHead>Status</TableHead><TableHead className="text-right">Berat Awal (Kg)</TableHead><TableHead className="text-right">Biaya Setting</TableHead><TableHead className="text-right">Berat Jadi (Kg)</TableHead><TableHead className="text-right">Harga Jual</TableHead><TableHead className="text-center">Actions</TableHead></TableRow></TableHeader>
                    <TableBody>{processes.map((p) => (
                        <TableRow key={p.id}>
                            <TableCell>{p.supplier}</TableCell>
                            <TableCell>{p.fabricName}</TableCell>
                            <TableCell>{p.purchaseDate}</TableCell>
                            <TableCell><span className={`px-2 py-1 rounded-full text-xs font-medium ${p.status === 'Sudah Celup' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>{p.status}</span></TableCell>
                            <TableCell className="text-right">{p.initialWeight.toFixed(2)}</TableCell>
                            <TableCell className="text-right">{p.settingCost ? formatCurrency(p.settingCost) : '-'}</TableCell>
                            <TableCell className="text-right">{p.finishedWeight?.toFixed(2) || '-'}</TableCell>
                            <TableCell className="text-right font-semibold">{p.price ? formatCurrency(p.price) : '-'}</TableCell>
                            <TableCell className="text-center"><Button variant="outline" size="sm" onClick={() => openEditDialog(p)}>{p.status === 'Belum Celup' ? 'Update Status' : 'Edit'}</Button></TableCell>
                        </TableRow>
                    ))}</TableBody>
                </Table>
            </div>
             {isFormOpen && <CelupFormDialog process={editingProcess} onSave={handleSave} closeDialog={closeDialog} />}
        </Dialog>
    );
};

// --- CelupFormDialog Implementation --- //
const CelupFormDialog = ({ process, onSave, closeDialog }: { process?: CelupProcess, onSave: (data: any) => void, closeDialog: () => void }) => {
    const [formData, setFormData] = useState({
        supplier: process?.supplier || '',
        fabricName: process?.fabricName || '',
        purchaseDate: process?.purchaseDate || '',
        initialWeight: process?.initialWeight || '',
        status: process?.status || 'Belum Celup',
        finishedWeight: process?.finishedWeight || '',
        settingCost: process?.settingCost || '',
    });
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => { const { id, value } = e.target; setFormData(prev => ({ ...prev, [id]: value })); };

    return (
        <DialogContent><DialogHeader><DialogTitle>{process ? 'Update Proses Celup' : 'Beli Kain Mentah'}</DialogTitle></DialogHeader>
            <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="supplier" className="text-right">Supplier</Label><Input id="supplier" value={formData.supplier} onChange={handleChange} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="fabricName" className="text-right">Nama Kain</Label><Input id="fabricName" value={formData.fabricName} onChange={handleChange} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="purchaseDate" className="text-right">Tgl Beli</Label><Input id="purchaseDate" type="date" value={formData.purchaseDate} onChange={handleChange} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="initialWeight" className="text-right">Berat Awal (Kg)</Label><Input id="initialWeight" type="number" value={formData.initialWeight} onChange={handleChange} className="col-span-3" /></div>
                <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="settingCost" className="text-right">Biaya Setting</Label><Input id="settingCost" type="number" step="any" value={formData.settingCost} onChange={handleChange} className="col-span-3" placeholder="e.g., 50000" /></div>
                {process && (
                    <>
                        <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="status" className="text-right">Status</Label>
                            <Select value={formData.status} onValueChange={(value) => setFormData(prev => ({...prev, status: value as any}))}>
                                <SelectTrigger className="col-span-3"><SelectValue /></SelectTrigger>
                                <SelectContent><SelectItem value="Belum Celup">Belum Celup</SelectItem><SelectItem value="Sudah Celup">Sudah Celup</SelectItem></SelectContent>
                            </Select>
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4"><Label htmlFor="finishedWeight" className="text-right">Berat Jadi (Kg)</Label><Input id="finishedWeight" type="number" value={formData.finishedWeight} onChange={handleChange} className="col-span-3" disabled={formData.status === 'Belum Celup'} /></div>
                    </>
                )}
            </div>
            <DialogFooter><Button type="button" variant="secondary" onClick={closeDialog}>Back</Button><Button onClick={() => { onSave({}); closeDialog(); }}><Save className="mr-2 h-4 w-4" /> Save</Button></DialogFooter>
        </DialogContent>
    );
};

// --- JualPage Implementation --- //
const JualPage = () => {
    const [fabricInventory, setFabricInventory] = useState<KainInventoryItem[]>([]);
    const [salesHistory, setSalesHistory] = useState<SoldFabric[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            getKainInventory(),
            getSoldFabrics()
        ]).then(([inventoryItems, soldItems]) => {
            setFabricInventory(inventoryItems);
            setSalesHistory(soldItems);
            setIsLoading(false);
        });
    }, []);

    if (isLoading) return <div className="flex justify-center items-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Jual Kain Dari Gudang</CardTitle>
                    <CardDescription>Pilih kain yang akan dijual dan masukkan harga jualnya.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="item-select">Pilih Kain</Label>
                        <Select>
                            <SelectTrigger id="item-select"><SelectValue placeholder="Pilih kain..." /></SelectTrigger>
                            <SelectContent>{fabricInventory.map(item => <SelectItem key={item.id} value={item.id}>{item.name} (Stok: {item.stock_kg} Kg)</SelectItem>)}</SelectContent>
                        </Select>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="quantity-sold">Jumlah Dijual (Kg)</Label>
                        <Input id="quantity-sold" type="number" placeholder="e.g., 25.5"/>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="sale-price">Harga Jual Total</Label>
                        <Input id="sale-price" type="number" placeholder="e.g., 250000"/>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button><Tag className="mr-2 h-4 w-4" /> Tandai Sebagai Terjual</Button>
                </CardFooter>
            </Card>
            
            <Card>
                 <CardHeader>
                    <CardTitle>Riwayat Penjualan Kain</CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader><TableRow><TableHead>Tanggal Jual</TableHead><TableHead>Nama Kain</TableHead><TableHead className="text-right">Jumlah (Kg)</TableHead><TableHead className="text-right">Harga Jual</TableHead></TableRow></TableHeader>
                        <TableBody>
                            {salesHistory.map(sold => (
                                <TableRow key={sold.id}>
                                    <TableCell>{sold.saleDate}</TableCell>
                                    <TableCell>{sold.item.name}</TableCell>
                                    <TableCell className="text-right">{sold.quantitySoldKg.toFixed(2)} Kg</TableCell>
                                    <TableCell className="text-right font-semibold">{formatCurrency(sold.salePrice)}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    )
};


export default function App() {
  const [activeNav, setActiveNav] = React.useState<string>(navLinks[0].name);
  const handleNavigation = (name: string) => setActiveNav(name);

  const renderActivePage = () => {
      switch (activeNav) {
          case 'Menu kain': return <KainPage />;
          case 'Menu piutang': return <PiutangPage />;
          case 'Menu Rajut Kain': return <RajutKainPage />;
          case 'Menu Celup': return <CelupPage />;
          case 'Menu Jual': return <JualPage />;
          case 'Menu benang': default: return <BenangPage />;
      }
  }
  
  return (
    <div className="bg-gray-50/50 dark:bg-gray-900/so min-h-screen font-sans">
       <style>{`/* Hide spinners from number inputs */ input[type=number]::-webkit-inner-spin-button, input[type=number]::-webkit-outer-spin-button { -webkit-appearance: none; margin: 0; } input[type=number] { -moz-appearance: textfield; }`}</style>
      <div className="flex">
        <aside className="w-64 border-r bg-white dark:bg-gray-950 p-6 hidden lg:flex flex-col h-screen sticky top-0">
          <h1 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-8 flex items-center gap-2"><LayoutDashboard />InventoryApp</h1>
          <nav className="flex flex-col space-y-1">{navLinks.map((link) => (<Button key={link.name} variant={activeNav === link.name ? "secondary" : "ghost"} className="justify-start" onClick={() => handleNavigation(link.name)}>{link.name}</Button>))}</nav>
        </aside>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <header className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <DashboardSheet links={navLinks} activeLink={activeNav} onNavigate={handleNavigation} />
              <h2 className="text-3xl font-bold tracking-tight hidden sm:block">{activeNav}</h2>
            </div>
          </header>
          {renderActivePage()}
        </main>
      </div>
    </div>
  );
}

