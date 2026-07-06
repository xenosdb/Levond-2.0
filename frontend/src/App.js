import React from 'react';
import '@/App.css';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from '@/contexts/LanguageContext';
import { AuthProvider } from '@/contexts/AuthContext';
import Landing from '@/pages/Landing';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import AppShell from '@/pages/AppShell';
import AppLauncher from '@/components/dashboard/AppLauncher';
import Travel from '@/pages/Travel';
import TravelSignup from '@/pages/TravelSignup';
import AuthCallback from '@/pages/AuthCallback';
import Onboarding from '@/pages/Onboarding';
import { CRM, PosRestaurant, PosRetail, Inventory } from '@/components/dashboard/Modules';
import TravelCRM from '@/pages/TravelCRM';
import { Contacts, Sales, Invoicing, Purchases } from '@/components/dashboard/BusinessModules';
import { Warehouses, Accounting, Projects, Appointments, Maintenance } from '@/components/dashboard/OpsModules';
import Nexus from '@/pages/Nexus';
import TravelAgency from '@/pages/TravelAgency';
import Settings from '@/pages/Settings';
import PublicProposal from '@/pages/PublicProposal';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Landing />} />
            <Route path="/travel" element={<Travel />} />
            <Route path="/travel/signup" element={<TravelSignup />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/onboarding" element={<Onboarding />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/p/:code" element={<PublicProposal />}/>
            <Route path="/app" element={<AppShell />}>
              <Route index element={<AppLauncher />} />
              <Route path="contacts" element={<Contacts />} />
              <Route path="crm" element={<TravelCRM />} />
              <Route path="sales" element={<Sales />} />
              <Route path="invoicing" element={<Invoicing />} />
              <Route path="purchases" element={<Purchases />} />
              <Route path="restaurant" element={<PosRestaurant />} />
              <Route path="retail" element={<PosRetail />} />
              <Route path="inventory" element={<Inventory />} />
              <Route path="warehouses" element={<Warehouses />} />
              <Route path="accounting" element={<Accounting />} />
              <Route path="projects" element={<Projects />} />
              <Route path="appointments" element={<Appointments />} />
              <Route path="maintenance" element={<Maintenance />} />
              <Route path="travel" element={<TravelAgency />} />
              <Route path="nexus" element={<Nexus />} />
              <Route path="settings" element={<Settings />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
