import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { AppSettings } from '../types';
import toast from 'react-hot-toast';

interface ConfigContextType {
  settings: AppSettings | null;
  fetchSettings: () => Promise<void>;
}

const ConfigContext = createContext<ConfigContextType | undefined>(undefined);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<AppSettings | null>(null);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        if (error.code !== 'PGRST116') {
          throw error;
        }
      }

      if (data) {
        setSettings(data);
      }
    } catch (error: any) {
      console.error('Error fetching global settings:', error);
      // Don't show toast on initial load to avoid cluttering if table doesn't exist yet
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <ConfigContext.Provider value={{ settings, fetchSettings }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = () => {
  const context = useContext(ConfigContext);
  if (context === undefined) {
    throw new Error('useConfig must be used within a ConfigProvider');
  }
  return context;
};
