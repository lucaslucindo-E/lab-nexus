import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ResultIndicator } from '@/components/project/ResultIndicator';
import { CalculationRationale } from '@/components/project/CalculationRationale';
import { linearRegression, fmtNum, executeFormula, type FormulaDefinition } from '@/lib/calc-engine';
import { Calculator, RotateCcw, Plus, Trash2, FileDown } from 'lucide-react';

const formulaConcEstoque: FormulaDefinition = {
  id: 'C1',
  nome: 'Concentração Estoque (C1)',
  formula: '(massa * potencia) / volume',
  variaveis: { massa: 'Massa (mg)', potencia: 'Potência (fração)', volume: 'Volume (mL)' },
  unidade: 'mg/mL',
};

interface StockInput { massa: string; volume: string; potencia: string }
interface ConcentrationRow { nivel: string; aliquota: string; volBalao: string; areas: string[] }

export function LinearidadeTab() {
  const [stock, setStock] = useState<StockInput>({ massa: '', volume: '', potencia: '' });
  const [numAreas, setNumAreas] = useState(3);
  const [rows, setRows] = useState<ConcentrationRow[]>(
    Array(5).fill(null).map(() => ({ nivel: '', aliquota: '', volBalao: '', areas: ['', '', ''] }))
  );
  const [observacoes, setObservacoes] = useState('');
  const [calculated, setCalculated] = useState(false);

  // Stock concentration
  const c1 = useMemo(() => {
    const m = Number(stock.massa), v = Number(stock.volume), p = Number(stock.potencia);
    if (!m || !v || !p || isNaN(m) || isNaN(v) || isNaN(p)) return null;
    return executeFormula(formulaConcEstoque.formula, { massa: m, potencia: p, volume: v });
  }, [stock]);

  // Per-row concentration
  const rowConcs = useMemo(() => {
    if (!c1) return rows.map(() => null);
    return rows.map(r => {
      const al = Number(r.aliquota), vb = Number(r.volBalao);
      if (!al || !vb || isNaN(al) || isNaN(vb)) return null;
      return (c1.value * al) / vb;
    });
  }, [c1, rows]);

  // Mean areas
  const meanAreas = useMemo(() => {
    return rows.map(r => {
      const nums = r.areas.map(Number).filter(n => !isNaN(n) && n > 0);
      return nums.length > 0 ? nums.reduce((a, b) => a + b, 0) / nums.length : null;
    });
  }, [rows]);

  // Regression
  const regression = useMemo(() => {
    if (!calculated) return null;
    const x: number[] = [];
    const y: number[] = [];
    rowConcs.forEach((c, i) => {
      const ma = meanAreas[i];
      if (c != null && ma != null) { x.push(c); y.push(ma); }
    });
    if (x.length < 3) return null;
    return linearRegression(x, y);
  }, [calculated, rowConcs, meanAreas]);

  const addRow = () => {
    setRows(p => [...p, { nivel: '', aliquota: '', volBalao: '', areas: Array(numAreas).fill('') }]);
    setCalculated(false);
  };

  const removeRow = (i: number) => {
    if (rows.length <= 3) return;
    setRows(p => p.filter((_, idx) => idx !== i));
    setCalculated(false);
  };

  const updateRow = (i: number, field: keyof ConcentrationRow, val: string, areaIdx?: number) => {
    setRows(prev => prev.map((r, idx) => {
      if (idx !== i) return r;
      if (field === 'areas' && areaIdx !== undefined) {
        const areas = [...r.areas];
        areas[areaIdx] = val;
        return { ...r, areas };
      }
      return { ...r, [field]: val };
    }));
    setCalculated(false);
  };

  const rationaleSteps = useMemo(() => {
    const steps: { label: string; formula: string; substitution?: string; result?: string }[] = [];
    if (c1) steps.push({ label: formulaConcEstoque.nome, formula: formulaConcEstoque.formula, substitution: c1.substitution, result: `${fmtNum(c1.value)} mg/mL` });
    if (c1) {
      steps.push({ label: 'Conc. Diluída', formula: '(C1 × Alíquota) / Vol. Balão', substitution: `Calculado para cada nível`, result: `Ver tabela` });
    }
    if (regression) {
      steps.push(
        { label: 'Coeficiente angular (b)', formula: 'b = Σ(xi−X̄)(yi−Ȳ) / Σ(xi−X̄)²', result: fmtNum(regression.slope, 4) },
        { label: 'Intercepto (a)', formula: 'a = Ȳ − b·X̄', result: fmtNum(regression.intercept, 4) },
        { label: 'Coef. correlação (r)', formula: 'r = Σ(xi−X̄)(yi−Ȳ) / √[Σ(xi−X̄)²·Σ(yi−Ȳ)²]', result: fmtNum(regression.correlationCoef, 6) },
        { label: 'Coef. determinação (r²)', formula: 'r² = r × r', result: fmtNum(regression.rSquared, 6) },
      );
    }
    return steps;
  }, [c1, regression]);

  return (
    <div className="space-y-6">
      {/* Stock Solution */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>🧪</span> Soluções Estoque
        </h3>
        <div className="bg-muted/30 rounded-lg p-4">
          <span className="text-xs font-semibold text-foreground">Estoque 1</span>
          <div className="grid grid-cols-3 gap-4 mt-3">
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Massa (mg)</Label>
              <Input type="number" value={stock.massa} onChange={e => { setStock(p => ({ ...p, massa: e.target.value })); setCalculated(false); }} className="h-8 mt-1" />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Volume (mL)</Label>
              <Input type="number" value={stock.volume} onChange={e => { setStock(p => ({ ...p, volume: e.target.value })); setCalculated(false); }} className="h-8 mt-1" />
            </div>
            <div>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Potência (%)</Label>
              <Input type="number" step="0.001" value={stock.potencia} onChange={e => { setStock(p => ({ ...p, potencia: e.target.value })); setCalculated(false); }} className="h-8 mt-1" />
            </div>
          </div>
          <div className="flex gap-8 mt-3">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Conc. (mg/mL)</span>
              <p className="text-sm font-mono font-medium text-primary">{c1 ? fmtNum(c1.value) : '—'}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Conc. (µg/mL)</span>
              <p className="text-sm font-mono font-medium text-primary">{c1 ? fmtNum(c1.value * 1000) : '—'}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Concentration Levels */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>📈</span> Níveis de Concentração
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-1 text-[10px] font-semibold text-muted-foreground uppercase">Nível (%)</th>
                <th className="text-left py-2 px-1 text-[10px] font-semibold text-muted-foreground uppercase">Alíquota (mL)</th>
                <th className="text-left py-2 px-1 text-[10px] font-semibold text-muted-foreground uppercase">Vol. Balão (mL)</th>
                <th className="text-left py-2 px-1 text-[10px] font-semibold text-muted-foreground uppercase">Conc (mg/mL)</th>
                {Array(numAreas).fill(null).map((_, j) => (
                  <th key={j} className="text-left py-2 px-1 text-[10px] font-semibold text-muted-foreground uppercase">Área {j + 1}</th>
                ))}
                <th className="text-right py-2 px-1 text-[10px] font-semibold text-muted-foreground uppercase">Área Média</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-1.5 px-1"><Input value={r.nivel} onChange={e => updateRow(i, 'nivel', e.target.value)} className="h-8 w-16 text-xs" /></td>
                  <td className="py-1.5 px-1"><Input type="number" value={r.aliquota} onChange={e => updateRow(i, 'aliquota', e.target.value)} className="h-8 w-20 text-xs" /></td>
                  <td className="py-1.5 px-1"><Input type="number" value={r.volBalao} onChange={e => updateRow(i, 'volBalao', e.target.value)} className="h-8 w-20 text-xs" /></td>
                  <td className="py-1.5 px-1 font-mono text-xs text-primary font-medium">{rowConcs[i] != null ? fmtNum(rowConcs[i]!) : '—'}</td>
                  {r.areas.map((a, j) => (
                    <td key={j} className="py-1.5 px-1">
                      <Input type="number" value={a} onChange={e => updateRow(i, 'areas', e.target.value, j)} className="h-8 w-24 text-xs" />
                    </td>
                  ))}
                  <td className="py-1.5 px-1 text-right font-mono text-xs font-medium text-foreground">
                    {meanAreas[i] != null ? fmtNum(meanAreas[i]!, 0) : '—'}
                  </td>
                  <td className="py-1.5 px-1">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRow(i)} disabled={rows.length <= 3}>
                      <Trash2 className="w-3 h-3 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button variant="ghost" size="sm" onClick={addRow} className="mt-2 gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Adicionar Linha
        </Button>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setCalculated(true)} className="gap-2"><Calculator className="w-4 h-4" /> Calcular</Button>
        <Button variant="outline" onClick={() => { setStock({ massa: '', volume: '', potencia: '' }); setRows(Array(5).fill(null).map(() => ({ nivel: '', aliquota: '', volBalao: '', areas: ['', '', ''] }))); setCalculated(false); setObservacoes(''); }} className="gap-2"><RotateCcw className="w-4 h-4" /> Resetar</Button>
      </div>

      {regression && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ResultIndicator label="Coef. Correlação (r)" value={fmtNum(regression.correlationCoef, 6)} criteria="≥ 0,990" status={Math.abs(regression.correlationCoef) >= 0.99 ? 'pass' : 'fail'} />
            <ResultIndicator label="Coef. Determinação (r²)" value={fmtNum(regression.rSquared, 6)} criteria="≥ 0,980" status={regression.rSquared >= 0.98 ? 'pass' : 'fail'} />
            <ResultIndicator label="Slope (b)" value={fmtNum(regression.slope, 4)} criteria="—" status="pass" />
            <ResultIndicator label="Intercepto (a)" value={fmtNum(regression.intercept, 4)} criteria="—" status="pass" />
          </div>
          <div className="p-4 bg-muted rounded-xl">
            <p className="text-xs text-muted-foreground mb-1">Equação da reta</p>
            <p className="text-lg font-mono font-bold text-foreground">y = {fmtNum(regression.slope, 4)}x + {fmtNum(regression.intercept, 4)}</p>
          </div>
        </>
      )}

      {rationaleSteps.length > 0 && (
        <div className="bg-card border rounded-xl p-6">
          <CalculationRationale title="Racional: Linearidade" steps={rationaleSteps} />
        </div>
      )}

      <Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Observações..." rows={3} />

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2"><FileDown className="w-4 h-4" /> Exportar</Button>
      </div>
    </div>
  );
}
