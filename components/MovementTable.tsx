
import React, { useState, useMemo } from 'react';
import { Movement, MovementStatus, ViewType } from '../types';
import { Edit2, Trash2, Calendar, Clock, Filter, ChevronDown, Hash } from 'lucide-react';

interface MovementTableProps {
  view: ViewType;
  movements: Movement[];
  onEdit: (m: Movement) => void;
  onDelete: (id: string) => void;
}

const MovementTable: React.FC<MovementTableProps> = ({ view, movements, onEdit, onDelete }) => {
  // Filtros
  const [dateStart, setDateStart] = useState<string>('');
  const [dateEnd, setDateEnd] = useState<string>('');
  const [filterDateType, setFilterDateType] = useState<'dataNF' | 'dataDescarga'>('dataNF');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filteredData = useMemo(() => {
    let result = [...movements];

    // Filtro básico de visão (Entradas/Saídas)
    if (view === 'entries') {
      result = result.filter(m => [MovementStatus.ESTOQUE, MovementStatus.REJEITADO].includes(m.status));
    } else if (view === 'exits') {
      result = result.filter(m => [MovementStatus.EMBARCADO, MovementStatus.DEVOLVIDO].includes(m.status));
    }

    // Filtro de Status manual
    if (statusFilter !== 'all') {
      result = result.filter(m => m.status === statusFilter);
    }

    // Filtro de Data
    if (dateStart) {
      result = result.filter(m => {
        const val = filterDateType === 'dataNF' ? m.dataNF : m.dataDescarga;
        return val && val >= dateStart;
      });
    }
    if (dateEnd) {
      result = result.filter(m => {
        const val = filterDateType === 'dataNF' ? m.dataNF : m.dataDescarga;
        return val && val <= dateEnd;
      });
    }

    return result;
  }, [view, movements, dateStart, dateEnd, filterDateType, statusFilter]);

  if (movements.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-12 text-center border-2 border-dashed border-slate-200">
        <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
          <Calendar className="text-slate-300" size={32} />
        </div>
        <h3 className="text-lg font-semibold text-slate-800 mb-1">Nenhum registro encontrado</h3>
        <p className="text-slate-500">Comece adicionando uma nova movimentação.</p>
      </div>
    );
  }

  const clearFilters = () => {
    setDateStart('');
    setDateEnd('');
    setStatusFilter('all');
  };

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 flex flex-wrap items-end gap-4">
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Tipo de Data</label>
          <select 
            value={filterDateType} 
            onChange={(e) => setFilterDateType(e.target.value as any)}
            className="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="dataNF">Data N.F</option>
            <option value="dataDescarga">Data Descarga</option>
          </select>
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Início</label>
          <input 
            type="date" 
            value={dateStart} 
            onChange={(e) => setDateStart(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Fim</label>
          <input 
            type="date" 
            value={dateEnd} 
            onChange={(e) => setDateEnd(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 outline-none focus:ring-1 focus:ring-indigo-500"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-slate-500 uppercase">Status</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs border border-slate-200 rounded-lg p-2 bg-slate-50 outline-none focus:ring-1 focus:ring-indigo-500"
          >
            <option value="all">Todos os Status</option>
            {Object.values(MovementStatus).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
        <button 
          onClick={clearFilters}
          className="text-xs font-medium text-indigo-600 hover:text-indigo-800 p-2 h-9"
        >
          Limpar Filtros
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">NF / Produto</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fornecedor / Destino</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Hash size={12} />
                    <span>Qtd</span>
                  </div>
                </th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Logística (Vol/Kg)</th>
                {view === 'performance' && (
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Performance</th>
                )}
                {view === 'billing' && (
                  <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Faturamento</th>
                )}
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {filteredData.map((m) => {
                const isUnitary = [MovementStatus.ESTOQUE, MovementStatus.REJEITADO].includes(m.status);
                const qtd = isUnitary ? 1 : 0;

                return (
                  <tr key={m.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="text-sm font-bold text-slate-800">{m.nf}</div>
                      <div className="text-xs text-slate-500 truncate max-w-[150px]">{m.descricao}</div>
                      <div className="text-[10px] text-slate-400 mt-1 font-mono uppercase truncate max-w-[120px]">{m.chaveAcesso}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-slate-700">{m.fornecedor}</div>
                      <div className="text-xs text-slate-500">{m.destino}</div>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">{m.placa}</span>
                        <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded text-slate-600 font-medium">{m.container}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-sm font-bold ${qtd > 0 ? 'text-indigo-600' : 'text-slate-300'}`}>
                        {qtd}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-semibold text-slate-800">{m.tonelada} t</div>
                      <div className="text-xs text-emerald-600 font-medium">R$ {m.valor.toLocaleString()}</div>
                    </td>
                    {view === 'performance' && (
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="flex items-center text-[10px] text-slate-500">
                            <Clock size={12} className="mr-1" /> Chg: {m.horaChegada || '--:--'}
                          </div>
                          <div className="flex items-center text-[10px] text-slate-500">
                            <Clock size={12} className="mr-1" /> Ent: {m.horaEntrada || '--:--'}
                          </div>
                          <div className="flex items-center text-[10px] text-slate-500">
                            <Clock size={12} className="mr-1" /> Saí: {m.horaSaida || '--:--'}
                          </div>
                        </div>
                      </td>
                    )}
                    {view === 'billing' && (
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <div className="text-[10px] text-slate-600 truncate max-w-[100px]">Intx: {m.cteIntertex || '-'}</div>
                          <div className="text-[10px] text-slate-600 truncate max-w-[100px]">Trsp: {m.cteTransportador || '-'}</div>
                          <div className="text-[10px] text-slate-400">Emissão: {m.dataEmissao || '-'}</div>
                        </div>
                      </td>
                    )}
                    <td className="px-6 py-4 text-center">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold tracking-tight uppercase ${
                        m.status === MovementStatus.ESTOQUE ? 'bg-emerald-100 text-emerald-700' :
                        m.status === MovementStatus.REJEITADO ? 'bg-rose-100 text-rose-700' :
                        m.status === MovementStatus.EMBARCADO ? 'bg-indigo-100 text-indigo-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => onEdit(m)}
                          className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                          title="Editar"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button 
                          onClick={() => onDelete(m.id)}
                          className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Excluir"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredData.length === 0 && (
          <div className="p-8 text-center text-slate-500 text-sm italic">
            Nenhum resultado para os filtros aplicados.
          </div>
        )}
      </div>
    </div>
  );
};

export default MovementTable;
