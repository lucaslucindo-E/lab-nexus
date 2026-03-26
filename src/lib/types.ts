export type ProjectStatus = 'not_started' | 'active' | 'correction' | 'review' | 'done';

export interface Project {
  id: string;
  pr: string;
  produto: string;
  analitos: string[];
  colunaHPLC: string;
  doseNominal: string;
  pesoMedio: string;
  responsavelFMT: string;
  responsavelDA: string;
  autores: string[];
  status: ProjectStatus;
  dataInicio: string;
  dataFinalizacao: string;
  createdAt: string;
  updatedAt: string;
}

export interface LinearidadeData {
  concentracoes: number[];
  areas: number[][];
  observacoes: string;
}

export interface LinearidadeResult {
  slope: number;
  intercept: number;
  rSquared: number;
  correlationCoef: number;
  passed: boolean;
}
