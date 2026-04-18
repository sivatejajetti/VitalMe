import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import AppLayout from "@/layouts/AppLayout";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import Analytics from "@/pages/Analytics";
import Goals from "@/pages/Goals";
import Achievements from "@/pages/Achievements";
import History from "@/pages/History";
import Score from "@/pages/Score";
import Workout from "@/pages/Workout";
import Tasks from "@/pages/Tasks";
import Chat from "@/pages/Chat";
import Profile from "@/pages/Profile";
import SettingsPage from "@/pages/SettingsPage";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import TermsOfService from "@/pages/TermsOfService";
import NotFound from "@/pages/NotFound";

import { ThemeProvider } from "@/components/theme-provider";

import { useEffect } from "react";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    const observer = new MutationObserver(() => {
      console.log("Document element classes changed:", document.documentElement.className);
    });
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    console.log("Initial document classes:", document.documentElement.className);
    return () => observer.disconnect();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <TooltipProvider>
        <Sonner />
        <BrowserRouter>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/privacy" element={<PrivacyPolicy />} />
          <Route path="/tos" element={<TermsOfService />} />
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/tasks" element={<Tasks />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/goals" element={<Goals />} />
            <Route path="/achievements" element={<Achievements />} />
            <Route path="/history" element={<History />} />
            <Route path="/workout" element={<Workout />} />
            <Route path="/score" element={<Score />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
  );
};

export default App;
