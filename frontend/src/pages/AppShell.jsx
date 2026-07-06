import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '@/components/dashboard/Sidebar';
import NexusCommand from '@/components/dashboard/NexusCommand';
import { useAuth } from '@/contexts/AuthContext';

const AppShell = () => {
  const { user, tenant, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center text-[#5F5F6B]">Cargando…</div>;
  if (!user) return <Navigate to="/login" replace />;
  if (tenant && tenant.onboarding_completed === false) return <Navigate to="/onboarding" replace />;

  return (
    <div className="min-h-screen relative">
      <Sidebar />
      <NexusCommand />
      <main className="lg:ml-64 p-6 md:p-10">
        <Outlet />
      </main>
    </div>
  );
};

export default AppShell;
