import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import AppSidebar from "@/components/AppSidebar";
import TopNavbar from "@/components/TopNavbar";
import BottomNav from "@/components/BottomNav";
import { getAuthStatus } from "@/services/api";

const AppLayout = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [checkingAuth, setCheckingAuth] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAuthStatus()
      .then((status) => {
        if (!status?.loggedIn) {
          navigate("/login");
        } else {
          setCheckingAuth(false);
        }
      })
      .catch((err) => {
        console.error("Auth System Error:", err.message);
        navigate("/login");
      });
  }, [navigate]);

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="w-16 h-16 rounded-3xl bg-primary/10 flex items-center justify-center shadow-2xl shadow-primary/5">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
        <p className="mt-6 text-[10px] font-black text-primary uppercase tracking-[0.4em] animate-pulse">Synchronizing Identity Pulse...</p>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen w-full bg-background selection:bg-primary/20 selection:text-primary">
      <AppSidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
        <TopNavbar onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto scrollbar-none bg-background/50 relative">
          <div className="min-h-full w-full pb-32">
            <Outlet />
          </div>
        </main>
        <BottomNav />
      </div>
    </div>
  );
};

export default AppLayout;
