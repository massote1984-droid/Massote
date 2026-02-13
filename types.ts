
export enum MovementStatus {
  ESTOQUE = 'Estoque',
  REJEITADO = 'Rejeitado',
  EMBARCADO = 'Embarcado',
  DEVOLVIDO = 'Devolvido'
}

export interface Movement {
  id: string;
  // Entrada
  mes: string;
  chaveAcesso: string;
  nf: string;
  tonelada: number;
  valor: number;
  descricao: string;
  dataNF: string;
  dataDescarga: string;
  status: MovementStatus;
  fornecedor: string;
  placa: string;
  container: string;
  destino: string;

  // Saída
  dataFaturamentoVLI?: string;
  cteVLI?: string;

  // Performance
  horaChegada?: string;
  horaEntrada?: string;
  horaSaida?: string;

  // Faturamento
  dataEmissao?: string;
  cteIntertex?: string;
  dataEmissaoIntertex?: string;
  cteTransportador?: string;
}

export type ViewType = 'dashboard' | 'entries' | 'exits' | 'performance' | 'billing';
