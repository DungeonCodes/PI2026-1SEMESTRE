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
import { Toaster } from 'react-hot-toast';

function AppContent() {
  const [activeTab, setActiveTab] = useState('PDV');
  const { settings } = useConfig();

  const renderContent = () => {
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
    <ConfigProvider>
      <StockProvider>
        <Toaster />
        <AppContent />
      </StockProvider>
    </ConfigProvider>
  );
}
