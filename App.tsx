
import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  LogIn, 
  LogOut, 
  Activity, 
  FileText, 
  PlusCircle,
  Menu,
  X,
  Sparkles,
  Search
} from 'lucide-react';
import { Movement, MovementStatus, ViewType } from './types';
import Dashboard from './components/Dashboard';
import MovementTable from './components/MovementTable';
import MovementForm from './components/MovementForm';
import { GoogleGenAI } from "@google/genai";

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [movements, setMovements] = useState<Movement[]>(() => {
    const saved = localStorage.getItem('gestor_pro_movements');
    return saved ? JSON.parse(saved) : [];
  });
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingMovement, setEditingMovement] = useState<Movement | undefined>();
  const [aiInsight, setAiInsight] = useState<string>('');
  const [isLoadingInsight, setIsLoadingInsight] = useState(false);

  useEffect(() => {
    localStorage.setItem('gestor_pro_movements', JSON.stringify(movements));
  }, [movements]);

  const handleAddMovement = (movement: Movement) => {
    if (editingMovement) {
      setMovements(prev => prev.map(m => m.id === movement.id ? movement : m));
    } else {
      setMovements(prev => [movement, ...prev]);
    }
    setShowForm(false);
    setEditingMovement(undefined);
  };

  const handleEdit = (movement: Movement) => {
    setEditingMovement(movement);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este registro?')) {
      setMovements(prev => prev.filter(m => m.id !== id));
    }
  };

  const generateAIInsight = async () => {
    setIsLoadingInsight(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
      const prompt = `Analise os seguintes dados de estoque e logística e forneça um resumo executivo de 3 frases em português. 
      Total de registros: ${movements.length}. 
      Status: ${movements.map(m => m.status).join(', ')}.
      Fornecedores: ${[...new Set(movements.map(m => m.fornecedor))].join(', ')}.
      Foque em gargalos de performance e níveis de estoque.`;

      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      setAiInsight(response.text || 'Não foi possível gerar insights no momento.');
    } catch (error) {
      console.error(error);
      setAiInsight('Erro ao conectar com a IA. Verifique sua chave de API.');
    } finally {
      setIsLoadingInsight(false);
    }
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'entries', label: 'Entradas', icon: LogIn },
    { id: 'exits', label: 'Saídas', icon: LogOut },
    { id: 'performance', label: 'Performance', icon: Activity },
    { id: 'billing', label: 'Faturamento', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className={`${isSidebarOpen ? 'w-64' : 'w-20'} bg-slate-900 text-white transition-all duration-300 flex flex-col z-50`}>
        <div className="p-6 flex items-center justify-between border-b border-slate-800">
          {isSidebarOpen && <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">Gestor Pro</h1>}
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-1 hover:bg-slate-800 rounded">
            <Menu size={20} />
          </button>
        </div>
        
        <nav className="flex-1 mt-6 space-y-2 px-3">
          {menuItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id as ViewType)}
              className={`w-full flex items-center p-3 rounded-lg transition-colors ${
                activeView === item.id ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <item.icon size={20} className={isSidebarOpen ? 'mr-3' : 'mx-auto'} />
              {isSidebarOpen && <span>{item.label}</span>}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800">
          <button 
            onClick={() => { setEditingMovement(undefined); setShowForm(true); }}
            className={`flex items-center justify-center w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 transition-colors font-medium ${isSidebarOpen ? 'px-4' : 'px-0'}`}
          >
            <PlusCircle size={20} className={isSidebarOpen ? 'mr-2' : ''} />
            {isSidebarOpen && <span>Novo Registro</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shrink-0">
          <h2 className="text-lg font-semibold text-slate-800 capitalize">
            {menuItems.find(i => i.id === activeView)?.label}
          </h2>
          <div className="flex items-center space-x-4">
            <button 
              onClick={generateAIInsight}
              disabled={isLoadingInsight}
              className="flex items-center px-4 py-2 bg-indigo-50 text-indigo-700 rounded-full hover:bg-indigo-100 transition-all border border-indigo-100 text-sm font-medium"
            >
              <Sparkles size={16} className={`mr-2 ${isLoadingInsight ? 'animate-pulse' : ''}`} />
              {isLoadingInsight ? 'Analisando...' : 'IA Insights'}
            </button>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input 
                type="text" 
                placeholder="Pesquisar..." 
                className="pl-10 pr-4 py-2 bg-slate-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 w-64"
              />
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          {aiInsight && (
            <div className="mb-8 p-4 bg-white border-l-4 border-indigo-500 rounded-r-lg shadow-sm flex items-start gap-4">
              <div className="bg-indigo-100 p-2 rounded-full text-indigo-600 shrink-0">
                <Sparkles size={18} />
              </div>
              <div>
                <h4 className="text-sm font-bold text-indigo-900 mb-1">Resumo Inteligente</h4>
                <p className="text-sm text-slate-600 italic">"{aiInsight}"</p>
              </div>
              <button onClick={() => setAiInsight('')} className="ml-auto text-slate-400 hover:text-slate-600">
                <X size={16} />
              </button>
            </div>
          )}

          {activeView === 'dashboard' && <Dashboard movements={movements} />}
          {activeView !== 'dashboard' && (
            <MovementTable 
              view={activeView} 
              movements={movements} 
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}
        </div>

        {/* Modal Form */}
        {showForm && (
          <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-100 flex items-center justify-between sticky top-0 bg-white z-10">
                <h3 className="text-xl font-bold text-slate-800">
                  {editingMovement ? 'Editar Movimentação' : 'Nova Movimentação'}
                </h3>
                <button onClick={() => setShowForm(false)} className="p-2 hover:bg-slate-100 rounded-full text-slate-400">
                  <X size={24} />
                </button>
              </div>
              <MovementForm 
                initialData={editingMovement} 
                onSubmit={handleAddMovement} 
                onCancel={() => setShowForm(false)} 
              />
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
