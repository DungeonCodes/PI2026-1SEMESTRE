import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { AppSettings } from '../types';

const Management: React.FC = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [nome, setNome] = useState('');
  const [corTexto, setCorTexto] = useState('#ffffff');
  const [corDestaque, setCorDestaque] = useState('#f97316');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('id', 1)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          // No settings found, maybe we should create default ones?
          // For now just handle it gracefully
          console.log('No settings found for id 1');
        } else {
          throw error;
        }
      }

      if (data) {
        setSettings(data);
        setNome(data.nome_hamburgueria);
        setCorTexto(data.cor_texto);
        setCorDestaque(data.cor_destaque);
      }
    } catch (error: any) {
      console.error('Error fetching settings:', error);
      toast.error('Erro ao carregar configurações.');
    } finally {
      setLoading(false);
    }
  };

  const handleUploadImage = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `bg-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('produtos')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('produtos')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      console.error('Error uploading background image:', error);
      toast.error('Erro ao enviar imagem de fundo: ' + error.message);
      return null;
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      let imageUrl = settings?.imagem_fundo_url || '';

      if (imageFile) {
        const uploadedUrl = await handleUploadImage(imageFile);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        } else {
          setSaving(false);
          return;
        }
      }

      const { error } = await supabase
        .from('configuracoes')
        .update({
          nome_hamburgueria: nome,
          cor_texto: corTexto,
          cor_destaque: corDestaque,
          imagem_fundo_url: imageUrl,
        })
        .eq('id', 1);

      if (error) throw error;

      toast.success('Configurações salvas com sucesso!');
      fetchSettings();
      setImageFile(null);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Carregando configurações...</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold text-orange-500 mb-6">Gestão do Sistema</h2>
      
      <form onSubmit={handleSave} className="bg-gray-800 p-6 rounded-lg shadow-md space-y-6">
        <div>
          <label className="block text-gray-400 mb-2">Nome da Hamburgueria</label>
          <input 
            type="text"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
            className="w-full bg-gray-700 text-white p-2 rounded-md border border-gray-600 focus:border-orange-500 outline-none"
            placeholder="Ex: Burger King"
            required
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-gray-400 mb-2">Cor do Texto</label>
            <div className="flex items-center space-x-3">
              <input 
                type="color"
                value={corTexto}
                onChange={(e) => setCorTexto(e.target.value)}
                className="h-10 w-20 bg-gray-700 rounded cursor-pointer"
              />
              <span className="text-sm font-mono text-gray-300 uppercase">{corTexto}</span>
            </div>
          </div>

          <div>
            <label className="block text-gray-400 mb-2">Cor de Destaque</label>
            <div className="flex items-center space-x-3">
              <input 
                type="color"
                value={corDestaque}
                onChange={(e) => setCorDestaque(e.target.value)}
                className="h-10 w-20 bg-gray-700 rounded cursor-pointer"
              />
              <span className="text-sm font-mono text-gray-300 uppercase">{corDestaque}</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-gray-400 mb-2">Imagem de Fundo</label>
          <input 
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
            className="w-full text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-orange-600 file:text-white hover:file:bg-orange-700 cursor-pointer"
          />
          {settings?.imagem_fundo_url && !imageFile && (
            <div className="mt-2">
              <p className="text-xs text-gray-500 mb-1">Imagem atual:</p>
              <img 
                src={settings.imagem_fundo_url} 
                alt="Background preview" 
                className="h-20 w-auto rounded border border-gray-600 object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
          )}
        </div>

        <button 
          type="submit" 
          disabled={saving}
          className="w-full bg-orange-600 hover:bg-orange-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded transition-colors"
        >
          {saving ? 'Salvando Configurações...' : 'Salvar Configurações'}
        </button>
      </form>
    </div>
  );
};

export default Management;
