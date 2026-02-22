/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useConfig } from '../context/ConfigContext';
import { useAuth } from '../context/AuthContext';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

const Header: React.FC<HeaderProps> = ({ activeTab, setActiveTab }) => {
  const { settings } = useConfig();
  const { user, role, signInWithGoogle, signOut } = useAuth();

  const getTabsForRole = () => {
    if (!user || role === 'cliente') return ['PDV'];
    if (role === 'admin') return ['PDV', 'Cozinha', 'Inventário', 'Cardápio', 'Gestão'];
    if (role === 'gerente') return ['Inventário', 'Cardápio'];
    if (role === 'cozinha') return ['Cozinha'];
    return ['PDV'];
  };

  const tabs = getTabsForRole();

  return (
    <header className="bg-gray-900/80 backdrop-blur-md text-white p-4 flex flex-col md:flex-row justify-between items-center sticky top-0 z-40 border-b border-white/10 gap-4">
      <div className="flex items-center gap-4">
        <h1 
          className="text-2xl font-bold transition-colors duration-300"
          style={{ color: settings?.cor_destaque || '#f97316' }}
        >
          {settings?.nome_hamburgueria || 'Hamburgueria'}
        </h1>
        
        <nav className="hidden md:block">
          <ul className="flex space-x-2">
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
      </div>

      <div className="flex items-center gap-4">
        <nav className="md:hidden">
          <ul className="flex space-x-1">
            {tabs.map((tab) => (
              <li key={tab}>
                <button
                  onClick={() => setActiveTab(tab)}
                  className={`px-2 py-1 rounded-md text-xs font-medium transition-all duration-200 ${
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

        <div className="flex items-center gap-3 border-l border-white/10 pl-4">
          {user ? (
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium text-white">{user.email}</span>
                <button 
                  onClick={signOut}
                  className="text-xs text-gray-400 hover:text-white underline transition-colors"
                >
                  Sair
                </button>
              </div>
              {user.user_metadata.avatar_url && (
                <img 
                  src={user.user_metadata.avatar_url} 
                  alt="Avatar" 
                  className="w-8 h-8 rounded-full border border-white/10 hidden sm:block"
                />
              )}
            </div>
          ) : (
            <button
              onClick={signInWithGoogle}
              className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold transition-all duration-200 hover:scale-[1.05] active:scale-[0.95] text-white"
              style={{ backgroundColor: settings?.cor_destaque || '#f97316' }}
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Login com Google
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
