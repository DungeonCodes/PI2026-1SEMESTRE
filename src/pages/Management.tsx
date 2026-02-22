import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';
import { AppSettings } from '../types';
import { useConfig } from '../context/ConfigContext';
import { useStock } from '../context/StockContext';
import { useAuth } from '../context/AuthContext';

const Management: React.FC = () => {
  const { fetchSettings: refreshGlobalSettings } = useConfig();
  const { orders, ingredients, movements } = useStock();
  const { role: currentUserRole } = useAuth();
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'config' | 'team'>('dashboard');
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [profiles, setProfiles] = useState<any[]>([]);
  const [nome, setNome] = useState('');
  const [corTexto, setCorTexto] = useState('#ffffff');
  const [corDestaque, setCorDestaque] = useState('#f97316');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
    if (currentUserRole === 'admin') {
      fetchProfiles();
    }
  }, [currentUserRole]);

  const fetchProfiles = async () => {
    try {
      const { data, error } = await supabase
        .from('perfis')
        .select('*')
        .order('email');
      
      if (error) throw error;
      setProfiles(data || []);
    } catch (error: any) {
      console.error('Error fetching profiles:', error);
      toast.error('Erro ao carregar perfis de usuários.');
    }
  };

  const handleUpdateRole = async (userId: string, newRole: string) => {
    try {
      const { error } = await supabase
        .from('perfis')
        .update({ funcao: newRole })
        .eq('id', userId);
      
      if (error) throw error;
      
      toast.success('Cargo atualizado com sucesso!');
      fetchProfiles();
    } catch (error: any) {
      console.error('Error updating role:', error);
      toast.error('Erro ao atualizar cargo: ' + error.message);
    }
  };

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('configuracoes')
        .select('*')
        .eq('id', 1)
        .single();

      if (error && error.code !== 'PGRST116') throw error;

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
      refreshGlobalSettings();
      setImageFile(null);
    } catch (error: any) {
      console.error('Error saving settings:', error);
      toast.error('Erro ao salvar configurações: ' + error.message);
    } finally {
      setSaving(false);
    }
  };

  // Dashboard calculations
  const totalRevenue = orders.reduce((acc, order) => acc + order.total, 0);
  const totalOrders = orders.length;
  const stockAlerts = ingredients.filter(ing => ing.quantidade_atual <= ing.quantidade_minima).length;

  if (loading) {
    return <div className="p-4 text-center">Carregando...</div>;
  }

  return (
    <div className="p-4 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <h2 
          className="text-3xl font-bold transition-colors duration-300"
          style={{ color: settings?.cor_destaque || '#f97316' }}
        >
          Gestão do Sistema
        </h2>
        
        <div className="flex bg-gray-800/50 p-1 rounded-lg border border-white/5">
          <button
            onClick={() => setActiveSubTab('dashboard')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeSubTab === 'dashboard' 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
            style={activeSubTab === 'dashboard' ? { backgroundColor: settings?.cor_destaque || '#f97316' } : {}}
          >
            Dashboard / Relatórios
          </button>
          <button
            onClick={() => setActiveSubTab('config')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
              activeSubTab === 'config' 
                ? 'bg-orange-600 text-white shadow-lg' 
                : 'text-gray-400 hover:text-white'
            }`}
            style={activeSubTab === 'config' ? { backgroundColor: settings?.cor_destaque || '#f97316' } : {}}
          >
            Configurações
          </button>
          {currentUserRole === 'admin' && (
            <button
              onClick={() => setActiveSubTab('team')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                activeSubTab === 'team' 
                  ? 'bg-orange-600 text-white shadow-lg' 
                  : 'text-gray-400 hover:text-white'
              }`}
              style={activeSubTab === 'team' ? { backgroundColor: settings?.cor_destaque || '#f97316' } : {}}
            >
              Equipe
            </button>
          )}
        </div>
      </div>

      {activeSubTab === 'dashboard' && (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/5">
              <p className="text-gray-400 text-sm font-medium mb-1">Faturamento Total</p>
              <h3 className="text-3xl font-bold" style={{ color: settings?.cor_destaque || '#f97316' }}>
                R$ {totalRevenue.toFixed(2)}
              </h3>
            </div>
            <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/5">
              <p className="text-gray-400 text-sm font-medium mb-1">Total de Pedidos</p>
              <h3 className="text-3xl font-bold">{totalOrders}</h3>
            </div>
            <div className={`p-6 rounded-2xl shadow-lg border transition-all ${
              stockAlerts > 0 ? 'bg-red-900/40 border-red-500/30' : 'bg-gray-800/80 border-white/5'
            }`}>
              <p className="text-gray-400 text-sm font-medium mb-1">Alertas de Estoque</p>
              <h3 className={`text-3xl font-bold ${stockAlerts > 0 ? 'text-red-500' : 'text-green-500'}`}>
                {stockAlerts} {stockAlerts === 1 ? 'item' : 'itens'}
              </h3>
            </div>
          </div>

          {/* Tables */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Latest Orders */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/5">
              <h4 className="text-xl font-bold mb-6 flex items-center">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
                Últimos Pedidos
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                      <th className="pb-3 font-semibold">ID</th>
                      <th className="pb-3 font-semibold">Cliente</th>
                      <th className="pb-3 font-semibold">Valor</th>
                      <th className="pb-3 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {orders.slice(0, 5).map(order => (
                      <tr key={order.id} className="text-sm">
                        <td className="py-4 font-mono text-gray-400">#{order.id}</td>
                        <td className="py-4 font-medium">{order.cliente_nome}</td>
                        <td className="py-4 font-bold">R$ {order.total.toFixed(2)}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            order.status === 'Pendente' ? 'bg-yellow-500/20 text-yellow-500' :
                            order.status === 'Pronto' ? 'bg-green-500/20 text-green-500' :
                            'bg-blue-500/20 text-blue-500'
                          }`}>
                            {order.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stock History */}
            <div className="bg-gray-800/80 backdrop-blur-sm p-6 rounded-2xl shadow-lg border border-white/5">
              <h4 className="text-xl font-bold mb-6 flex items-center">
                <span className="w-2 h-2 rounded-full bg-purple-500 mr-2"></span>
                Histórico de Estoque
              </h4>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                      <th className="pb-3 font-semibold">Data</th>
                      <th className="pb-3 font-semibold">Item</th>
                      <th className="pb-3 font-semibold">Tipo</th>
                      <th className="pb-3 font-semibold text-right">Qtd</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {movements.slice(0, 10).map(m => (
                      <tr key={m.id} className="text-sm">
                        <td className="py-4 text-gray-400 text-xs">
                          {new Date(m.criado_em).toLocaleDateString()} {new Date(m.criado_em).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                        <td className="py-4 font-medium">{m.ingrediente_nome}</td>
                        <td className="py-4">
                          <span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${
                            m.tipo === 'entrada' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'
                          }`}>
                            {m.tipo}
                          </span>
                        </td>
                        <td className={`py-4 font-bold text-right ${m.tipo === 'entrada' ? 'text-emerald-400' : 'text-red-400'}`}>
                          {m.tipo === 'entrada' ? '+' : '-'}{m.quantidade}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeSubTab === 'config' && (
        <div className="max-w-2xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
          <form onSubmit={handleSave} className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/5 space-y-8">
            <div>
              <label className="block text-gray-400 text-sm font-medium mb-3">Nome da Hamburgueria</label>
              <input 
                type="text"
                value={nome}
                onChange={(e) => setNome(e.target.value)}
                className="w-full bg-gray-700/50 text-white p-3 rounded-xl border border-white/10 outline-none focus:border-orange-500 transition-all"
                placeholder="Ex: Burger King"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <label className="block text-gray-400 text-sm font-medium mb-3">Cor do Texto</label>
                <div className="flex items-center space-x-4">
                  <input 
                    type="color"
                    value={corTexto}
                    onChange={(e) => setCorTexto(e.target.value)}
                    className="h-12 w-24 bg-gray-700 rounded-xl cursor-pointer border-none p-1 shadow-inner"
                  />
                  <span className="text-sm font-mono text-gray-300 uppercase tracking-wider">{corTexto}</span>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 text-sm font-medium mb-3">Cor de Destaque</label>
                <div className="flex items-center space-x-4">
                  <input 
                    type="color"
                    value={corDestaque}
                    onChange={(e) => setCorDestaque(e.target.value)}
                    className="h-12 w-24 bg-gray-700 rounded-xl cursor-pointer border-none p-1 shadow-inner"
                  />
                  <span className="text-sm font-mono text-gray-300 uppercase tracking-wider">{corDestaque}</span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-gray-400 text-sm font-medium mb-3">Imagem de Fundo</label>
              <div className="relative group">
                <input 
                  type="file"
                  accept="image/*"
                  onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                  className="w-full text-gray-400 file:mr-4 file:py-2.5 file:px-5 file:rounded-xl file:border-0 file:text-sm file:font-bold file:bg-gray-700 file:text-white hover:file:bg-gray-600 cursor-pointer transition-all"
                />
              </div>
              {settings?.imagem_fundo_url && !imageFile && (
                <div className="mt-6">
                  <p className="text-xs text-gray-500 font-medium mb-3 uppercase tracking-widest">Imagem atual:</p>
                  <img 
                    src={settings.imagem_fundo_url} 
                    alt="Background preview" 
                    className="h-32 w-full rounded-xl border border-white/10 object-cover shadow-2xl"
                    referrerPolicy="no-referrer"
                  />
                </div>
              )}
            </div>

            <button 
              type="submit" 
              disabled={saving}
              className="w-full text-white font-extrabold py-4 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg disabled:bg-gray-700 disabled:text-gray-500"
              style={{ backgroundColor: settings?.cor_destaque || '#f97316' }}
            >
              {saving ? 'Salvando Configurações...' : 'Salvar Configurações'}
            </button>
          </form>
        </div>
      )}

      {activeSubTab === 'team' && currentUserRole === 'admin' && (
        <div className="max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">
          {/* Invite Section */}
          <div className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/5">
            <h4 className="text-xl font-bold mb-4 flex items-center">
              <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
              Adicionar Novo Membro da Equipe
            </h4>
            <p className="text-gray-400 text-sm leading-relaxed mb-6">
              Como utilizamos o login seguro do Google, não é necessário criar senhas. 
              Envie o link do sistema para o seu funcionário. Assim que ele fizer o primeiro login, 
              o email dele aparecerá na tabela abaixo para você definir o cargo (Cozinha, Gerente, etc).
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <input 
                type="text" 
                readOnly 
                value={window.location.origin}
                className="flex-1 bg-gray-900/50 text-gray-400 p-3 rounded-xl border border-white/10 outline-none font-mono text-sm"
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.origin);
                  toast.success('Link copiado! Envie para o funcionário.');
                }}
                className="px-6 py-3 rounded-xl text-white font-bold transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] shadow-lg flex items-center justify-center gap-2"
                style={{ backgroundColor: settings?.cor_destaque || '#f97316' }}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                </svg>
                Copiar Link de Convite
              </button>
            </div>
          </div>

          {/* Profiles Table */}
          <div className="bg-gray-800/80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-white/5">
            <h4 className="text-xl font-bold mb-6 flex items-center">
              <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
              Gestão de Equipe e Acessos
            </h4>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-gray-500 text-xs uppercase tracking-wider border-b border-white/5">
                    <th className="pb-3 font-semibold">Usuário (Email)</th>
                    <th className="pb-3 font-semibold">Cargo Atual</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {profiles.map(profile => (
                    <tr key={profile.id} className="text-sm">
                      <td className="py-4 font-medium text-gray-200">{profile.email}</td>
                      <td className="py-4">
                        <select
                          value={profile.funcao}
                          onChange={(e) => handleUpdateRole(profile.id, e.target.value)}
                          className="bg-gray-700 text-white text-xs font-bold py-2 px-4 rounded-xl border border-white/10 outline-none focus:border-orange-500 transition-all cursor-pointer hover:bg-gray-600"
                        >
                          <option value="cliente">Cliente</option>
                          <option value="cozinha">Cozinha</option>
                          <option value="gerente">Gerente</option>
                          <option value="admin">Admin</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Management;
