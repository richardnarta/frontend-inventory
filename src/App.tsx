import React, { 
    // useState, useEffect 
} from "react";
import { Toaster } from "@/components/ui/sonner"

import { InventoryPage } from './pages/Inventory';

import {
//   Plus,
  CreditCard, 
//   Save,
  Scissors, 
//   X, 
  Droplets, 
  Tag, 
  Factory, 
  ShoppingCart,
  Spool,
  Layers,
  HandCoins,
  Package
} from 'lucide-react';

// --- SHADCN/UI COMPONENTS --- //
import { 
    // Button, 
    buttonVariants 
} from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { BuyerPage } from './pages/Buyer';
import { SalesTransactionPage } from './pages/Sales';
import { ProgressPage } from './pages/Progress';
import { SupplierPage } from "./pages/Supplier";
import { PurchaseTransactionPage } from "./pages/Purchase";
import { DyeingPage } from "./pages/Dyeing";
import { FactoryPage } from "./pages/Factory";
import { MachineActivityPage } from "./pages/Machine";

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
            { name: 'Data Pembeli', icon: <HandCoins className="h-5 w-5" />, path: '/pembeli' },
            { name: 'Data Supplier', icon: <Package className="h-5 w-5" />, path: '/supplier' }
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
                    <Route path='/rajut' element={<ProgressPage name="Menu Rajut" />} />
                    <Route path='/celup' element={<DyeingPage />} />
                    <Route path='/pembelian' element={<PurchaseTransactionPage/>} />
                    <Route path='/penjualan' element={<SalesTransactionPage />} />
                    <Route path='/piutang' element={<AccountReceivablePage />} />
                    <Route path='/pabrik' element={<FactoryPage />} />
                    <Route path='/pembeli' element={<BuyerPage />} />
                    <Route path='/supplier' element={<SupplierPage />} />
                    <Route path='/pabrik/mesin' element={<MachineActivityPage />} />
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