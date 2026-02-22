/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Header from './components/Header';
import PDV from './pages/PDV';
import Kitchen from './pages/Kitchen';
import Inventory from './pages/Inventory';
import Menu from './pages/Menu';
import Management from './pages/Management';
import { StockProvider } from './context/StockContext';
import { ConfigProvider, useConfig } from './context/ConfigContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';
import { useEffect } from 'react';

function AppContent() {
  const [activeTab, setActiveTab] = useState('PDV');
  const { settings } = useConfig();
  const { user, role, refreshSession, loading } = useAuth();

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'SUPABASE_AUTH_SUCCESS') {
        refreshSession();
        console.log('Auth success message received and session refreshed');
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [refreshSession]);

  // Validate active tab on role change
  useEffect(() => {
    if (loading) return;
    
    const allowedTabs: Record<string, string[]> = {
      'admin': ['PDV', 'Cozinha', 'Inventário', 'Cardápio', 'Gestão'],
      'gerente': ['Inventário', 'Cardápio'],
      'cozinha': ['Cozinha'],
      'cliente': ['PDV'],
      'guest': ['PDV']
    };

    const currentRole = user ? (user.funcao || 'cliente') : 'guest';
    const tabs = allowedTabs[currentRole] || allowedTabs['guest'];

    if (!tabs.includes(activeTab)) {
      setActiveTab(tabs[0]);
    }
  }, [user, loading, activeTab]);

  const renderContent = () => {
    if (loading) return <div className="flex items-center justify-center h-screen text-white">Carregando...</div>;

    switch (activeTab) {
      case 'PDV':
        return <PDV />;
      case 'Cozinha':
        return <Kitchen />;
      case 'Inventário':
        return <Inventory />;
      case 'Cardápio':
        return <Menu />;
      case 'Gestão':
        return <Management />;
      default:
        return <PDV />;
    }
  };

  const dynamicStyles = settings ? {
    '--cor-destaque': settings.cor_destaque,
    '--cor-texto': settings.cor_texto,
    backgroundImage: settings.imagem_fundo_url ? `url(${settings.imagem_fundo_url})` : 'none',
    backgroundSize: 'cover',
    backgroundAttachment: 'fixed',
    color: settings.cor_texto,
  } as React.CSSProperties : {};

  return (
    <div 
      className="bg-gray-900 min-h-screen transition-colors duration-300"
      style={dynamicStyles}
    >
      <Header activeTab={activeTab} setActiveTab={setActiveTab} />
      <main className={settings?.imagem_fundo_url ? 'bg-black/40 min-h-[calc(100vh-64px)]' : ''}>
        {renderContent()}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ConfigProvider>
        <StockProvider>
          <Toaster />
          <AppContent />
        </StockProvider>
      </ConfigProvider>
    </AuthProvider>
  );
}
