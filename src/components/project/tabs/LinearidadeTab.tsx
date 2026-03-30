import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ResultIndicator } from '@/components/project/ResultIndicator';
import { CalculationRationale } from '@/components/project/CalculationRationale';
import { linearRegression, fmtNum, executeFormula, type FormulaDefinition } from '@/lib/calc-engine';
import { Calculator, RotateCcw, Plus, Trash2, FileDown } from 'lucide-react';

// ---- Formula definitions (JSON-driven) ----
const formulaConcentracaoEstoque: FormulaDefinition = {
  id: 'C1',
  nome: 'Concentração Estoque (C1)',
  formula: '(massa * potencia) / volume',
  variaveis: { massa: 'Massa (mg)', potencia: 'Potência (fração)', volume: 'Volume (mL)' },
  unidade: 'mg/mL',
};

const formulaConcentracaoDiluida: FormulaDefinition = {
  id: 'C2',
  nome: 'Concentração Diluída (C2)',
  formula: '(C1 * aliquota) / volume_final',
  variaveis: { C1: 'Conc. Estoque (mg/mL)', aliquota: 'Alíquota (mL)', volume_final: 'Vol. Final (mL)' },
  unidade: 'mg/mL',
  dependencias: ['C1'],
};

const defaultRows = [
  { concentracao: '50', area: '245310' },
  { concentracao: '75', area: '368200' },
  { concentracao: '100', area: '490150' },
  { concentracao: '125', area: '612400' },
  { concentracao: '150', area: '735600' },
];

export function LinearidadeTab() {
  const [rows, setRows] = useState(defaultRows.map(r => ({ ...r })));
  const [stockInputs, setStockInputs] = useState({ massa: '10', potencia: '0.995', volume: '25' });
  const [dilInputs, setDilInputs] = useState({ aliquota: '5', volume_final: '50' });
  const [observacoes, setObservacoes] = useState('');
  const [calculated, setCalculated] = useState(false);

  const addRow = () => {
    setRows(prev => [...prev, { concentracao: '', area: '' }]);
    setCalculated(false);
  };

  const removeRow = (i: number) => {
    if (rows.length <= 3) return;
    setRows(prev => prev.filter((_, idx) => idx !== i));
    setCalculated(false);
  };

  const updateRow = (i: number, field: 'concentracao' | 'area', val: string) => {
    setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
    setCalculated(false);
  };

  // Stock concentration calc
  const c1Result = useMemo(() => {
    const vars = { massa: Number(stockInputs.massa), potencia: Number(stockInputs.potencia), volume: Number(stockInputs.volume) };
    if (Object.values(vars).some(isNaN)) return null;
    return executeFormula(formulaConcentracaoEstoque.formula, vars);
  }, [stockInputs]);

  const c2Result = useMemo(() => {
    if (!c1Result) return null;
    const vars = { C1: c1Result.value, aliquota: Number(dilInputs.aliquota), volume_final: Number(dilInputs.volume_final) };
    if (Object.values(vars).some(isNaN)) return null;
    return executeFormula(formulaConcentracaoDiluida.formula, vars);
  }, [c1Result, dilInputs]);

  const regression = useMemo(() => {
    if (!calculated) return null;
    const x = rows.map(r => Number(r.concentracao)).filter(n => !isNaN(n));
    const y = rows.map(r => Number(r.area)).filter(n => !isNaN(n));
    if (x.length < 3 || y.length < 3 || x.length !== y.length) return null;
    return linearRegression(x, y);
  }, [calculated, rows]);

  const rationaleSteps = useMemo(() => {
    const steps: { label: string; formula: string; substitution?: string; result?: string }[] = [];

    // C1
    if (c1Result) {
      steps.push({
        label: formulaConcentracaoEstoque.nome,
        formula: formulaConcentracaoEstoque.formula,
        substitution: c1Result.substitution,
        result: `${fmtNum(c1Result.value)} mg/mL`,
      });
    }
    // C2
    if (c2Result) {
      steps.push({
        label: formulaConcentracaoDiluida.nome,
        formula: formulaConcentracaoDiluida.formula,
        substitution: c2Result.substitution,
        result: `${fmtNum(c2Result.value)} mg/mL`,
      });
    }

    if (regression) {
      steps.push(
        {
          label: 'Coeficiente angular (b)',
          formula: 'b = Σ(xi - X̄)(yi - Ȳ) / Σ(xi - X̄)²',
          substitution: `b = ${fmtNum(regression.ssXY, 2)} / ${fmtNum(regression.ssX, 2)}`,
          result: fmtNum(regression.slope, 4),
        },
        {
          label: 'Intercepto (a)',
          formula: 'a = Ȳ - b·X̄',
          substitution: `a = ${fmtNum(regression.meanY, 2)} - ${fmtNum(regression.slope, 4)} × ${fmtNum(regression.meanX, 2)}`,
          result: fmtNum(regression.intercept, 4),
        },
        {
          label: 'Coeficiente de correlação (r)',
          formula: 'r = Σ(xi-X̄)(yi-Ȳ) / √[Σ(xi-X̄)² · Σ(yi-Ȳ)²]',
          result: fmtNum(regression.correlationCoef, 6),
        },
        {
          label: 'Coeficiente de determinação (r²)',
          formula: 'r² = r × r',
          result: fmtNum(regression.rSquared, 6),
        },
      );
    }
    return steps;
  }, [c1Result, c2Result, regression]);

  const reset = () => {
    setRows(defaultRows.map(r => ({ ...r })));
    setStockInputs({ massa: '10', potencia: '0.995', volume: '25' });
    setDilInputs({ aliquota: '5', volume_final: '50' });
    setCalculated(false);
    setObservacoes('');
  };

  return (
    <div className="space-y-8">
      {/* 1. CONCENTRATION CALCS */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
          Concentração da Solução
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-card border rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Solução Estoque</h3>
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Massa (mg)</Label>
                <Input type="number" value={stockInputs.massa} onChange={e => { setStockInputs(p => ({ ...p, massa: e.target.value })); setCalculated(false); }} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Potência (fração)</Label>
                <Input type="number" step="0.001" value={stockInputs.potencia} onChange={e => { setStockInputs(p => ({ ...p, potencia: e.target.value })); setCalculated(false); }} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Volume (mL)</Label>
                <Input type="number" value={stockInputs.volume} onChange={e => { setStockInputs(p => ({ ...p, volume: e.target.value })); setCalculated(false); }} className="h-8" />
              </div>
            </div>
            {c1Result && (
              <p className="text-sm font-mono font-bold text-foreground">C1 = {fmtNum(c1Result.value)} mg/mL</p>
            )}
          </div>
          <div className="bg-card border rounded-lg p-4 space-y-3">
            <h3 className="text-sm font-semibold text-foreground">Diluição</h3>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Alíquota (mL)</Label>
                <Input type="number" value={dilInputs.aliquota} onChange={e => { setDilInputs(p => ({ ...p, aliquota: e.target.value })); setCalculated(false); }} className="h-8" />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Vol. Final (mL)</Label>
                <Input type="number" value={dilInputs.volume_final} onChange={e => { setDilInputs(p => ({ ...p, volume_final: e.target.value })); setCalculated(false); }} className="h-8" />
              </div>
            </div>
            {c2Result && (
              <p className="text-sm font-mono font-bold text-foreground">C2 = {fmtNum(c2Result.value)} mg/mL = {fmtNum(c2Result.value * 1000)} µg/mL</p>
            )}
          </div>
        </div>
      </section>

      {/* 2. DATA TABLE */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
          Dados da Curva
        </h2>
        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground w-16">Nível</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Concentração (%)</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Área</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-2">
                    <Input type="number" value={row.concentracao} onChange={e => updateRow(i, 'concentracao', e.target.value)} className="h-8 w-32" />
                  </td>
                  <td className="px-4 py-2">
                    <Input type="number" value={row.area} onChange={e => updateRow(i, 'area', e.target.value)} className="h-8 w-40" />
                  </td>
                  <td className="px-4 py-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRow(i)} disabled={rows.length <= 3}>
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 mt-4">
          <Button onClick={() => setCalculated(true)} className="gap-2">
            <Calculator className="w-4 h-4" /> Calcular
          </Button>
          <Button variant="outline" onClick={addRow} className="gap-2">
            <Plus className="w-4 h-4" /> Adicionar Linha
          </Button>
          <Button variant="outline" onClick={reset} className="gap-2">
            <RotateCcw className="w-4 h-4" /> Resetar
          </Button>
        </div>
      </section>

      {/* 3. RESULTS */}
      {regression && (
        <section>
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
            Resultados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ResultIndicator label="Coef. Correlação (r)" value={fmtNum(regression.correlationCoef, 6)} criteria="≥ 0,990" status={Math.abs(regression.correlationCoef) >= 0.99 ? 'pass' : 'fail'} />
            <ResultIndicator label="Coef. Determinação (r²)" value={fmtNum(regression.rSquared, 6)} criteria="≥ 0,980" status={regression.rSquared >= 0.98 ? 'pass' : 'fail'} />
            <ResultIndicator label="Slope (b)" value={fmtNum(regression.slope, 4)} criteria="—" status="pass" />
            <ResultIndicator label="Intercepto (a)" value={fmtNum(regression.intercept, 4)} criteria="—" status="pass" />
          </div>
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Equação da reta</p>
            <p className="text-lg font-mono font-bold text-foreground">y = {fmtNum(regression.slope, 4)}x + {fmtNum(regression.intercept, 4)}</p>
          </div>
        </section>
      )}

      {/* 4. RATIONALE */}
      {rationaleSteps.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">{regression ? '4' : '3'}</span>
            Racional do Cálculo
          </h2>
          <div className="bg-card border rounded-lg p-6">
            <CalculationRationale title="Linearidade — Regressão Linear" steps={rationaleSteps} />
          </div>
        </section>
      )}

      {/* 5. OBSERVATIONS */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">{regression ? '5' : '4'}</span>
          Observações
        </h2>
        <Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Adicione observações sobre esta análise..." rows={4} />
      </section>

      {/* EXPORT */}
      <div className="flex justify-end">
        <Button variant="outline" className="gap-2">
          <FileDown className="w-4 h-4" /> Exportar
        </Button>
      </div>
    </div>
  );
}
