
import React, { useState } from 'react';
import { Movement, MovementStatus } from '../types';

interface MovementFormProps {
  initialData?: Movement;
  onSubmit: (m: Movement) => void;
  onCancel: () => void;
}

const MovementForm: React.FC<MovementFormProps> = ({ initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Movement>(initialData || {
    id: Math.random().toString(36).substr(2, 9),
    mes: new Date().toLocaleString('pt-BR', { month: 'long' }),
    chaveAcesso: '',
    nf: '',
    tonelada: 0,
    valor: 0,
    descricao: '',
    dataNF: new Date().toISOString().split('T')[0],
    dataDescarga: '',
    status: MovementStatus.ESTOQUE,
    fornecedor: '',
    placa: '',
    container: '',
    destino: '',
    dataFaturamentoVLI: '',
    cteVLI: '',
    horaChegada: '',
    horaEntrada: '',
    horaSaida: '',
    dataEmissao: '',
    cteIntertex: '',
    dataEmissaoIntertex: '',
    cteTransportador: ''
  });

  const [activeTab, setActiveTab] = useState<'entrada' | 'saida' | 'performance' | 'faturamento'>('entrada');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const Input = ({ label, name, type = "text", placeholder = "", required = false }: any) => (
    <div className="space-y-1.5">
      <label className="text-xs font-bold text-slate-600 uppercase tracking-tight">{label}</label>
      <input
        type={type}
        name={name}
        value={(formData as any)[name] || ''}
        onChange={handleChange}
        placeholder={placeholder}
        required={required}
        className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all outline-none"
      />
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="p-8">
      <div className="flex border-b border-slate-100 mb-8 overflow-x-auto pb-1 gap-2">
        {['entrada', 'saida', 'performance', 'faturamento'].map((tab) => (
          <button
            key={tab}
            type="button"
            onClick={() => setActiveTab(tab as any)}
            className={`px-6 py-2 rounded-t-lg font-bold text-xs uppercase tracking-wider transition-all border-b-2 ${
              activeTab === tab 
                ? 'border-indigo-600 text-indigo-600 bg-indigo-50' 
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="min-h-[350px]">
        {activeTab === 'entrada' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-in slide-in-from-left-4 duration-300">
            <Input label="Mês" name="mes" required />
            <Input label="NF" name="nf" required />
            <Input label="Chave de Acesso" name="chaveAcesso" />
            <Input label="Tonelada" name="tonelada" type="number" required />
            <Input label="Valor (R$)" name="valor" type="number" required />
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-600 uppercase tracking-tight">Status</label>
              <select 
                name="status" 
                value={formData.status} 
                onChange={handleChange}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 transition-all"
              >
                {Object.values(MovementStatus).map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Input label="Descrição Produto" name="descricao" />
            <Input label="Fornecedor" name="fornecedor" required />
            <Input label="Data NF" name="dataNF" type="date" />
            <Input label="Data Descarga" name="dataDescarga" type="date" />
            <Input label="Placa Veículo" name="placa" />
            <Input label="Container" name="container" />
            <div className="md:col-span-2">
              <Input label="Destino" name="destino" />
            </div>
          </div>
        )}

        {activeTab === 'saida' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-left-4 duration-300">
            <Input label="Data Faturamento VLI" name="dataFaturamentoVLI" type="date" />
            <Input label="CTE VLI" name="cteVLI" />
          </div>
        )}

        {activeTab === 'performance' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in slide-in-from-left-4 duration-300">
            <Input label="Hora Chegada" name="horaChegada" type="time" />
            <Input label="Hora Entrada" name="horaEntrada" type="time" />
            <Input label="Hora Saída" name="horaSaida" type="time" />
          </div>
        )}

        {activeTab === 'faturamento' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in slide-in-from-left-4 duration-300">
            <Input label="Data Emissão" name="dataEmissao" type="date" />
            <Input label="CTE Intertex" name="cteIntertex" />
            <Input label="Data Emissão Intertex" name="dataEmissaoIntertex" type="date" />
            <Input label="CTE Transportador" name="cteTransportador" />
          </div>
        )}
      </div>

      <div className="flex items-center justify-end space-x-4 mt-12 pt-6 border-t border-slate-100">
        <button
          type="button"
          onClick={onCancel}
          className="px-6 py-2.5 rounded-xl text-slate-600 hover:bg-slate-100 font-bold text-xs uppercase transition-all"
        >
          Cancelar
        </button>
        <button
          type="submit"
          className="px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-xs uppercase shadow-lg shadow-indigo-200 transition-all"
        >
          Salvar Movimentação
        </button>
      </div>
    </form>
  );
};

export default MovementForm;
