/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useConfig } from '../context/ConfigContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const tabs = ['PDV', 'Cozinha', 'Inventário', 'Cardápio', 'Gestão'];
  const { settings } = useConfig();

  return (
    <header className="bg-gray-900/80 backdrop-blur-md text-white p-4 flex justify-between items-center sticky top-0 z-40 border-b border-white/10">
      <h1 
        className="text-2xl font-bold transition-colors duration-300"
        style={{ color: settings?.cor_destaque || '#f97316' }}
      >
        {settings?.nome_hamburgueria || 'Hamburgueria'}
      </h1>
      <nav>
        <ul className="flex space-x-2 md:space-x-4">
          {tabs.map((tab) => (
            <li key={tab}>
              <button
                onClick={() => setActiveTab(tab)}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 ${
                  activeTab === tab
                    ? 'text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                }`}
                style={activeTab === tab ? { backgroundColor: settings?.cor_destaque || '#f97316' } : {}}
              >
                {tab}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Header;
