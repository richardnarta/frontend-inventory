import React from "react";
import { Toaster } from "@/components/ui/sonner"
import {
    CreditCard, 
    Scissors, 
    Droplets, 
    Tag, 
    Factory, 
    ShoppingCart,
    Spool,
    Layers,
    HandCoins,
    Package
} from 'lucide-react';
import { 
    buttonVariants 
} from '@/components/ui/button';
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
import { BrowserRouter, Routes, Route, NavLink, Navigate } from 'react-router-dom';
import { InventoryPage } from './pages/Inventory';
import { AccountReceivablePage } from './pages/AccountReceivable';
import { BuyerPage } from './pages/Buyer';
import { SalesTransactionPage } from './pages/Sales';
import { SupplierPage } from "./pages/Supplier";
import { PurchaseTransactionPage } from "./pages/Purchase";
import { DyeingPage } from "./pages/Dyeing";
import { FactoryPage } from "./pages/Factory";
import { MachineActivityPage } from "./pages/Machine";
import { KnitFormulaPage } from "./pages/KnitFormula";
import { KnitProcessPage } from "./pages/KnitProcess";

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
                    <Route path='/rajut' element={<KnitProcessPage />} />
                    <Route path='/rajut/formula' element={<KnitFormulaPage />} />
                    <Route path='/celup' element={<DyeingPage />} />
                    <Route path='/pembelian' element={<PurchaseTransactionPage/>} />
                    <Route path='/penjualan' element={<SalesTransactionPage />} />
                    <Route path='/piutang' element={<AccountReceivablePage />} />
                    <Route path='/pabrik' element={<FactoryPage />} />
                    <Route path='/pabrik/mesin' element={<MachineActivityPage />} />
                    <Route path='/pembeli' element={<BuyerPage />} />
                    <Route path='/supplier' element={<SupplierPage />} />
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