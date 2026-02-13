
import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, Legend, StackedBar 
} from 'recharts';
import { Movement, MovementStatus } from '../types';
import { Package, TrendingUp, Truck, AlertTriangle, MapPin, Box } from 'lucide-react';

interface DashboardProps {
  movements: Movement[];
}

const Dashboard: React.FC<DashboardProps> = ({ movements }) => {
  const stats = useMemo(() => {
    const inStock = movements.filter(m => m.status === MovementStatus.ESTOQUE).length;
    const rejected = movements.filter(m => m.status === MovementStatus.REJEITADO).length;
    const shipped = movements.filter(m => m.status === MovementStatus.EMBARCADO).length;
    const totalTonnes = movements.reduce((acc, m) => acc + (Number(m.tonelada) || 0), 0);
    const totalValue = movements.reduce((acc, m) => acc + (Number(m.valor) || 0), 0);

    return { inStock, rejected, shipped, totalTonnes, totalValue };
  }, [movements]);

  const destinationData = useMemo(() => {
    const counts: Record<string, number> = {};
    movements.forEach(m => {
      if (m.status === MovementStatus.ESTOQUE || m.status === MovementStatus.REJEITADO) {
        counts[m.destino || 'Não Informado'] = (counts[m.destino || 'Não Informado'] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [movements]);

  const productData = useMemo(() => {
    const counts: Record<string, number> = {};
    movements.forEach(m => {
      if (m.status === MovementStatus.ESTOQUE || m.status === MovementStatus.REJEITADO) {
        counts[m.descricao || 'Sem Descrição'] = (counts[m.descricao || 'Sem Descrição'] || 0) + 1;
      }
    });
    return Object.entries(counts).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 5);
  }, [movements]);

  const statusByDestinationData = useMemo(() => {
    const dataMap: Record<string, any> = {};
    movements.forEach(m => {
      const dest = m.destino || 'Não Informado';
      if (!dataMap[dest]) {
        dataMap[dest] = { name: dest, Estoque: 0, Rejeitado: 0, Embarcado: 0, Devolvido: 0 };
      }
      dataMap[dest][m.status]++;
    });
    return Object.values(dataMap).sort((a: any, b: any) => 
      (b.Estoque + b.Rejeitado + b.Embarcado + b.Devolvido) - (a.Estoque + a.Rejeitado + a.Embarcado + a.Devolvido)
    ).slice(0, 6);
  }, [movements]);

  const statusData = [
    { name: 'Em Estoque', value: stats.inStock, color: '#10b981' },
    { name: 'Rejeitado', value: stats.rejected, color: '#f43f5e' },
    { name: 'Embarcado', value: stats.shipped, color: '#6366f1' },
  ];

  const COLORS = ['#6366f1', '#10b981', '#f43f5e', '#f59e0b', '#8b5cf6'];

  const StatCard = ({ title, value, icon: Icon, color, subtitle }: any) => (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Em Estoque" 
          value={stats.inStock} 
          icon={Package} 
          color="bg-emerald-500" 
          subtitle="Unidades disponíveis"
        />
        <StatCard 
          title="Peso Total" 
          value={`${stats.totalTonnes.toLocaleString()} t`} 
          icon={Truck} 
          color="bg-amber-500" 
          subtitle="Volume total movimentado"
        />
        <StatCard 
          title="Valor Faturado" 
          value={`R$ ${stats.totalValue.toLocaleString()}`} 
          icon={TrendingUp} 
          color="bg-indigo-500" 
          subtitle="Total acumulado"
        />
        <StatCard 
          title="Rejeitados" 
          value={stats.rejected} 
          icon={AlertTriangle} 
          color="bg-rose-500" 
          subtitle="Atenção necessária"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Estoque por Destino */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <MapPin size={20} className="text-indigo-500" />
            <h4 className="text-lg font-bold text-slate-800">Estoque por Destino</h4>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={destinationData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#6366f1" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Estoque por Produto */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-6">
            <Box size={20} className="text-emerald-500" />
            <h4 className="text-lg font-bold text-slate-800">Estoque por Produto</h4>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={productData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" width={100} tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip cursor={{ fill: '#f8fafc' }} />
                <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Status por Destino (Stacked Bar) */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2">
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp size={20} className="text-amber-500" />
            <h4 className="text-lg font-bold text-slate-800">Status por Destino</h4>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={statusByDestinationData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} />
                <Tooltip />
                <Legend iconType="circle" />
                <Bar dataKey="Estoque" stackId="a" fill="#10b981" />
                <Bar dataKey="Rejeitado" stackId="a" fill="#f43f5e" />
                <Bar dataKey="Embarcado" stackId="a" fill="#6366f1" />
                <Bar dataKey="Devolvido" stackId="a" fill="#94a3b8" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Distribuição de Status Original */}
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 lg:col-span-2 flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1">
            <h4 className="text-lg font-bold text-slate-800 mb-2">Visão Geral de Status</h4>
            <p className="text-sm text-slate-500 mb-4">Distribuição percentual de todas as movimentações registradas.</p>
            <div className="space-y-3">
              {statusData.map((s, i) => (
                <div key={i} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                    <span className="text-slate-600">{s.name}</span>
                  </div>
                  <span className="font-bold text-slate-800">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="h-64 w-full md:w-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={8}
                  dataKey="value"
                >
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
