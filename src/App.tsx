/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import Header from './components/Header';
import PDV from './pages/PDV';
import Kitchen from './pages/Kitchen';
import Inventory from './pages/Inventory';
import { StockProvider } from './context/StockContext';
import { Toaster } from 'react-hot-toast';

export default function App() {
  const [activeTab, setActiveTab] = useState('PDV');

  const renderContent = () => {
    switch (activeTab) {
      case 'PDV':
        return <PDV />;
      case 'Cozinha':
        return <Kitchen />;
      case 'Inventário':
        return <Inventory />;
      default:
        return <PDV />;
    }
  };

  return (
    <StockProvider>
      <Toaster />
      <div className="bg-gray-900 text-white min-h-screen">
        <Header activeTab={activeTab} setActiveTab={setActiveTab} />
        <main>{renderContent()}</main>
      </div>
    </StockProvider>
  );
}
