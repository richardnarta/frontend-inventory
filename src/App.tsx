import { useState, useEffect, useRef } from "react";
import { Toaster } from "@/components/ui/sonner";
import {
  CreditCard,
  Scissors,
  Droplets,
  Tag,
  Cog,
  ShoppingCart,
  ShoppingBasket,
  Spool,
  Layers,
  HandCoins,
  Package,
  UserRoundPen,
  LogOut,
  Loader2,
} from "lucide-react";
import {
  Button,
  buttonVariants,
} from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarProvider,
  useSidebar,
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";
import {
  BrowserRouter,
  Routes,
  Route,
  NavLink,
  Navigate,
  useNavigate,
} from "react-router-dom";
import { toast } from "sonner";

import { InventoryPage } from "@/pages/Inventory";
import { AccountReceivablePage } from "@/pages/AccountReceivable";
import { BuyerPage } from "@/pages/Buyer";
import { SalesTransactionPage } from "@/pages/Sales";
import { SupplierPage } from "@/pages/Supplier";
import { PurchaseTransactionPage } from "@/pages/Purchase";
import { DyeingProcessPage } from "@/pages/Dyeing";
import { MachinePage } from "@/pages/Machine";
import { KnitFormulaPage } from "@/pages/KnitFormula";
import { KnitProcessPage } from "@/pages/KnitProcess";
import { OperatorPage } from "@/pages/Operator";
import { LoginPage } from "@/pages/Login";
import { getProfile, logout } from "@/service/auth";

// -------------------------------
// Sidebar menu configuration
// -------------------------------
const navGroup = [
  {
    name: "Stok Barang",
    items: [
      { name: "Stok Benang", icon: <Spool className="h-5 w-5" />, path: "/benang" },
      { name: "Stok Kain", icon: <Layers className="h-5 w-5" />, path: "/kain" },
    ],
  },
  {
    name: "Produksi Pabrik",
    items: [
      { name: "Menu Rajut", icon: <Scissors className="h-5 w-5" />, path: "/rajut" },
      { name: "Menu Celup", icon: <Droplets className="h-5 w-5" />, path: "/celup" },
    ],
  },
  {
    name: "Transaksi",
    items: [
      { name: "Menu Pembelian Benang", icon: <ShoppingCart className="h-5 w-5" />, path: "/pembelian-benang" },
      { name: "Menu Pembelian Kain", icon: <ShoppingBasket className="h-5 w-5" />, path: "/pembelian-kain" },
      { name: "Menu Penjualan", icon: <Tag className="h-5 w-5" />, path: "/penjualan" },
      { name: "Menu Piutang", icon: <CreditCard className="h-5 w-5" />, path: "/piutang" },
    ],
  },
  {
    name: "Manajemen Pabrik",
    items: [
      { name: "Data Mesin", icon: <Cog className="h-5 w-5" />, path: "/mesin" },
      { name: "Data Operator", icon: <UserRoundPen className="h-5 w-5" />, path: "/operator" },
      { name: "Data Pembeli", icon: <HandCoins className="h-5 w-5" />, path: "/pembeli" },
      { name: "Data Supplier", icon: <Package className="h-5 w-5" />, path: "/supplier" },
    ],
  },
];

// -------------------------------
// Protected Layout (for authenticated users)
// -------------------------------
function AppLayout({ onLogout }: { onLogout: () => void }) {
  const navigate = useNavigate();
  const { open, isMobile, setOpenMobile } = useSidebar();

  const handleNavLinkClick = () => {
    if (isMobile) setOpenMobile(false);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logout berhasil!");
      onLogout();
      navigate("/login", { replace: true });
    } catch {
      toast.error("Gagal untuk logout.");
    }
  };

  return (
    <div className="bg-gray-50/50 dark:bg-gray-900/50 min-h-screen font-sans flex w-full">
      <Sidebar collapsible="icon">
        <SidebarContent className="flex flex-col justify-between">
          <div>
            <SidebarHeader className="px-4 pt-4 pb-2 text-left">
              <h1
                className={cn(
                  "font-bold text-blue-500 dark:text-blue-300",
                  !open && !isMobile ? "text-xl" : "text-2xl"
                )}
              >
                {!open && !isMobile ? "IA" : "InventoryApp"}
              </h1>
            </SidebarHeader>

            {navGroup.map((group) => (
              <SidebarGroup className="py-0" key={group.name}>
                <SidebarGroupLabel>{group.name}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {group.items.map((link) => (
                      <SidebarMenuItem key={link.path}>
                        <NavLink
                          to={link.path}
                          onClick={handleNavLinkClick}
                          className={({ isActive }) =>
                            cn(
                              buttonVariants({
                                variant: isActive ? "secondary" : "ghost",
                                size: open ? "default" : "icon",
                              }),
                              "w-full gap-2",
                              open ? "justify-start" : "justify-center",
                              isActive &&
                                "bg-blue-200 text-dark hover:bg-blue-300 dark:bg-blue-800 dark:text-blue-50 dark:hover:bg-blue-900"
                            )
                          }
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
          </div>

          <SidebarFooter>
            <Button
              variant="ghost"
              className={cn(
                "w-full gap-2",
                open ? "justify-start" : "justify-center"
              )}
              size={open ? "default" : "icon"}
              onClick={handleLogout}
            >
              <LogOut className="h-5 w-5" />
              {open && <span>Logout</span>}
            </Button>
          </SidebarFooter>
        </SidebarContent>
      </Sidebar>

      <main className="p-6 w-full overflow-auto">
        <Routes>
          <Route path="/benang" element={<InventoryPage key="thread-page" type="thread" typeMessage="benang" />} />
          <Route path="/kain" element={<InventoryPage key="fabric-page" type="fabric" typeMessage="kain" />} />
          <Route path="/rajut" element={<KnitProcessPage />} />
          <Route path="/rajut/formula" element={<KnitFormulaPage />} />
          <Route path="/celup" element={<DyeingProcessPage />} />
          <Route path="/pembelian-benang" element={<PurchaseTransactionPage key="thread-purchase-page" type="thread" typeMessage="benang" />} />
          <Route path="/pembelian-kain" element={<PurchaseTransactionPage key="fabric-purchase-page" type="fabric" typeMessage="kain" />} />
          <Route path="/penjualan" element={<SalesTransactionPage />} />
          <Route path="/piutang" element={<AccountReceivablePage />} />
          <Route path="/mesin" element={<MachinePage />} />
          <Route path="/operator" element={<OperatorPage />} />
          <Route path="/pembeli" element={<BuyerPage />} />
          <Route path="/supplier" element={<SupplierPage />} />
          {/* PERUBAHAN 1: Rute default untuk pengguna yang sudah login */}
          <Route path="/" element={<Navigate to="/benang" replace />} />
          <Route path="/login" element={<Navigate to="/benang" replace />} />
        </Routes>
      </main>

      <Toaster richColors />
    </div>
  );
}

// -------------------------------
// Root App Component
// -------------------------------
function AppContent() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);
  const navigate = useNavigate();

  const authCheckRef = useRef(false);

  useEffect(() => {
    // 3. Hanya jalankan jika ref bernilai false
    if (authCheckRef.current) {
      return;
    }
    // 4. Set ref menjadi true untuk mencegah eksekusi berikutnya
    authCheckRef.current = true;

    const checkAuth = async () => {
      try {
        await getProfile();
        setIsAuthenticated(true);
      } catch {
        setIsAuthenticated(false);
        if (window.location.pathname !== '/login') {
          navigate("/login", { replace: true });
        }
      } finally {
        setIsCheckingAuth(false);
      }
    };
    checkAuth();
  }, [navigate]);
  
  const handleLoginSuccess = () => {
    setIsAuthenticated(true);
    // PERUBAHAN 2: Navigasi ke halaman default setelah login berhasil
    navigate('/benang', { replace: true });
  };


  if (isCheckingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-10 w-10 animate-spin text-blue-500" />
      </div>
    );
  }

  // Gunakan <Routes> untuk mengelola tampilan login vs layout utama
  return (
    <Routes>
      {!isAuthenticated ? (
        <Route path="/login" element={<LoginPage onLoginSuccess={handleLoginSuccess} />} />
      ) : (
        <Route path="/*" element={
          <SidebarProvider>
            <AppLayout onLogout={() => setIsAuthenticated(false)} />
          </SidebarProvider>
        } />
      )}
      {/* Pengalihan default */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/benang" : "/login"} replace />} />
    </Routes>
  );
}

// -------------------------------
// BrowserRouter wrapper
// -------------------------------
export default function App() {
  return (
    <BrowserRouter>
      <AppContent />
      <Toaster richColors />
    </BrowserRouter>
  );
}