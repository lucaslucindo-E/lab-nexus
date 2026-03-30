// ============================================================
// AppVal — Engine de Cálculos Dinâmica (JSON-driven)
// ============================================================

export interface FormulaDefinition {
  id: string;
  nome: string;
  formula: string;
  variaveis: Record<string, string>; // key -> human label
  unidade?: string;
  dependencias?: string[];
}

export interface RationaleStep {
  label: string;
  formula: string;
  substitution?: string;
  result?: string;
}

// ---- Formatação ----
export function fmtNum(n: number, decimals = 4): string {
  if (n == null || isNaN(n) || !isFinite(n)) return '—';
  if (Number.isInteger(n) && Math.abs(n) < 1e8) return String(n);
  return n.toFixed(decimals);
}

// ---- Avaliação segura de expressão ----
function safeEval(expr: string): number {
  const sanitized = expr.replace(/[^0-9+\-*/().eE\s]/g, '');
  try {
    return new Function(`"use strict"; return (${sanitized})`)() as number;
  } catch {
    return NaN;
  }
}

// ---- Execução de fórmula individual ----
export function executeFormula(
  formula: string,
  variables: Record<string, number>,
): { value: number; substitution: string } {
  let sub = formula;
  // Sort keys by length desc to avoid partial replacements
  const sorted = Object.entries(variables).sort((a, b) => b[0].length - a[0].length);
  for (const [k, v] of sorted) {
    sub = sub.split(k).join(fmtNum(v));
  }
  return { value: safeEval(sub), substitution: sub };
}

// ---- Racional completo de uma fórmula ----
export function buildRationale(
  def: FormulaDefinition,
  variables: Record<string, number>,
): RationaleStep {
  const { value, substitution } = executeFormula(def.formula, variables);
  return {
    label: def.nome,
    formula: def.formula,
    substitution,
    result: `${fmtNum(value)} ${def.unidade || ''}`.trim(),
  };
}

// ---- Executar cadeia de fórmulas com dependências ----
export function executeChain(
  defs: FormulaDefinition[],
  inputValues: Record<string, number>,
): { results: Record<string, number>; rationale: RationaleStep[] } {
  const resolved: Record<string, number> = { ...inputValues };
  const rationale: RationaleStep[] = [];

  for (const def of defs) {
    const { value, substitution } = executeFormula(def.formula, resolved);
    resolved[def.id] = value;
    rationale.push({
      label: def.nome,
      formula: def.formula,
      substitution,
      result: `${fmtNum(value)} ${def.unidade || ''}`.trim(),
    });
  }

  return { results: resolved, rationale };
}

// ---- Funções estatísticas ----
export const stats = {
  soma: (v: number[]) => v.reduce((a, b) => a + b, 0),
  media: (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0),
  desvio_padrao: (v: number[]) => {
    if (v.length < 2) return 0;
    const m = stats.media(v);
    return Math.sqrt(v.reduce((s, x) => s + (x - m) ** 2, 0) / (v.length - 1));
  },
  rsd: (v: number[]) => {
    const m = stats.media(v);
    return m !== 0 ? (stats.desvio_padrao(v) / m) * 100 : 0;
  },
};

// ---- Regressão linear ----
export interface RegressionResult {
  slope: number;
  intercept: number;
  rSquared: number;
  correlationCoef: number;
  meanX: number;
  meanY: number;
  ssX: number;
  ssY: number;
  ssXY: number;
  predictedY: number[];
  residuals: number[];
}

export function linearRegression(x: number[], y: number[]): RegressionResult {
  const n = x.length;
  const meanX = stats.media(x);
  const meanY = stats.media(y);

  let ssX = 0, ssY = 0, ssXY = 0;
  for (let i = 0; i < n; i++) {
    ssX += (x[i] - meanX) ** 2;
    ssY += (y[i] - meanY) ** 2;
    ssXY += (x[i] - meanX) * (y[i] - meanY);
  }

  const slope = ssXY / ssX;
  const intercept = meanY - slope * meanX;
  const rSquared = ssX * ssY > 0 ? (ssXY ** 2) / (ssX * ssY) : 0;
  const correlationCoef = ssX * ssY > 0 ? ssXY / Math.sqrt(ssX * ssY) : 0;
  const predictedY = x.map(xi => slope * xi + intercept);
  const residuals = y.map((yi, i) => yi - predictedY[i]);

  return { slope, intercept, rSquared, correlationCoef, meanX, meanY, ssX, ssY, ssXY, predictedY, residuals };
}
