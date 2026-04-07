import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { CalculationRationale } from '@/components/project/CalculationRationale';
import { ResultIndicator } from '@/components/project/ResultIndicator';
import { fmtNum, stats, executeFormula, type FormulaDefinition } from '@/lib/calc-engine';
import { Calculator, RotateCcw, Plus, Trash2, FileDown } from 'lucide-react';

const formulaConc: FormulaDefinition = {
  id: 'conc_estoque',
  nome: 'Concentração Estoque',
  formula: '(massa * potencia) / volume',
  variaveis: { massa: 'Massa (mg)', potencia: 'Potência (fração)', volume: 'Volume (mL)' },
  unidade: 'mg/mL',
};

interface StockSolution { massa: string; volume: string; potencia: string }
interface RecoveryRow { nivel: string; aliquota: string; volBalao: string; valEst: string[] }

export function ExatidaoEstoqueTab() {
  const [stocks, setStocks] = useState<StockSolution[]>([
    { massa: '', volume: '', potencia: '' },
    { massa: '', volume: '', potencia: '' },
    { massa: '', volume: '', potencia: '' },
  ]);

  const [recoveryRows, setRecoveryRows] = useState<RecoveryRow[]>([
    { nivel: '', aliquota: '', volBalao: '', valEst: ['', '', ''] },
    { nivel: '', aliquota: '', volBalao: '', valEst: ['', '', ''] },
    { nivel: '', aliquota: '', volBalao: '', valEst: ['', '', ''] },
  ]);

  const [calculated, setCalculated] = useState(false);

  // Calculate stock concentrations
  const stockConcs = useMemo(() => {
    return stocks.map(s => {
      const m = Number(s.massa), v = Number(s.volume), p = Number(s.potencia);
      if (!m || !v || !p || isNaN(m) || isNaN(v) || isNaN(p)) return null;
      return executeFormula(formulaConc.formula, { massa: m, potencia: p, volume: v });
    });
  }, [stocks]);

  const addStock = () => { setStocks(p => [...p, { massa: '', volume: '', potencia: '' }]); setCalculated(false); };
  const removeStock = (i: number) => {
    if (stocks.length <= 1) return;
    setStocks(p => p.filter((_, idx) => idx !== i));
    setRecoveryRows(prev => prev.map(r => ({ ...r, valEst: r.valEst.filter((_, idx) => idx !== i) })));
    setCalculated(false);
  };

  const addRecoveryRow = () => {
    setRecoveryRows(p => [...p, { nivel: '', aliquota: '', volBalao: '', valEst: stocks.map(() => '') }]);
    setCalculated(false);
  };

  const result = useMemo(() => {
    if (!calculated) return null;
    const recoveries: number[] = [];
    recoveryRows.forEach(row => {
      row.valEst.forEach(v => {
        const val = Number(v);
        if (!isNaN(val) && val > 0) recoveries.push(val);
      });
    });
    if (recoveries.length === 0) return null;
    return { media: stats.media(recoveries), dp: stats.desvio_padrao(recoveries), rsd: stats.rsd(recoveries) };
  }, [calculated, recoveryRows]);

  const rationaleSteps = useMemo(() => {
    const steps: { label: string; formula: string; substitution?: string; result?: string }[] = [];
    stockConcs.forEach((c, i) => {
      if (c) steps.push({ label: `Conc. Estoque ${i + 1}`, formula: formulaConc.formula, substitution: c.substitution, result: `${fmtNum(c.value)} mg/mL` });
    });
    return steps;
  }, [stockConcs]);

  return (
    <div className="space-y-6">
      {/* Soluções Estoque */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>⚗️</span> Soluções Estoque
        </h3>
        <div className="space-y-4">
          {stocks.map((s, i) => (
            <div key={i} className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-semibold text-foreground">Estoque {i + 1}</span>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeStock(i)} disabled={stocks.length <= 1}>
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </div>
              <div className="grid grid-cols-4 gap-3">
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Massa (mg)</Label>
                  <Input type="number" value={s.massa} onChange={e => { const next = [...stocks]; next[i] = { ...s, massa: e.target.value }; setStocks(next); setCalculated(false); }} className="h-8 mt-1" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Volume (mL)</Label>
                  <Input type="number" value={s.volume} onChange={e => { const next = [...stocks]; next[i] = { ...s, volume: e.target.value }; setStocks(next); setCalculated(false); }} className="h-8 mt-1" />
                </div>
                <div>
                  <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">Potência (%)</Label>
                  <Input type="number" step="0.001" value={s.potencia} onChange={e => { const next = [...stocks]; next[i] = { ...s, potencia: e.target.value }; setStocks(next); setCalculated(false); }} className="h-8 mt-1" />
                </div>
                <div className="flex flex-col justify-end">
                  <span className="text-[10px] uppercase tracking-wider text-muted-foreground">Conc. (mg/mL)</span>
                  <span className="text-sm font-mono font-medium mt-1 text-primary">{stockConcs[i] ? fmtNum(stockConcs[i]!.value) : '—'}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button variant="ghost" size="sm" onClick={addStock} className="mt-3 gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Adicionar Estoque
        </Button>
      </div>

      {/* Níveis de Recuperação */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>📊</span> Níveis de Concentração
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase">Nível (%)</th>
                <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase">Alíquota (mL)</th>
                <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase">Vol. Balão (mL)</th>
                {stocks.map((_, i) => (
                  <th key={i} className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase">Val. Est. {i + 1}</th>
                ))}
                <th className="text-right py-2 text-xs font-semibold text-muted-foreground uppercase">Recup. Média (%)</th>
              </tr>
            </thead>
            <tbody>
              {recoveryRows.map((r, i) => {
                const vals = r.valEst.map(Number).filter(v => !isNaN(v) && v > 0);
                const media = vals.length > 0 && calculated ? stats.media(vals) : null;
                return (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-2 pr-2"><Input value={r.nivel} onChange={e => { const next = [...recoveryRows]; next[i] = { ...r, nivel: e.target.value }; setRecoveryRows(next); setCalculated(false); }} className="h-8 w-20" /></td>
                    <td className="py-2 pr-2"><Input type="number" value={r.aliquota} onChange={e => { const next = [...recoveryRows]; next[i] = { ...r, aliquota: e.target.value }; setRecoveryRows(next); setCalculated(false); }} className="h-8 w-24" /></td>
                    <td className="py-2 pr-2"><Input type="number" value={r.volBalao} onChange={e => { const next = [...recoveryRows]; next[i] = { ...r, volBalao: e.target.value }; setRecoveryRows(next); setCalculated(false); }} className="h-8 w-24" /></td>
                    {r.valEst.map((v, j) => (
                      <td key={j} className="py-2 pr-2">
                        <Input type="number" value={v} onChange={e => { const next = [...recoveryRows]; const ve = [...r.valEst]; ve[j] = e.target.value; next[i] = { ...r, valEst: ve }; setRecoveryRows(next); setCalculated(false); }} className="h-8 w-24" />
                      </td>
                    ))}
                    <td className="py-2 text-right font-mono font-medium">
                      {media != null ? <span className={media >= 98 && media <= 102 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'}>{fmtNum(media, 2)}</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Button variant="ghost" size="sm" onClick={addRecoveryRow} className="mt-2 gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Adicionar Linha
        </Button>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setCalculated(true)} className="gap-2"><Calculator className="w-4 h-4" /> Calcular</Button>
        <Button variant="outline" onClick={() => { setStocks([{ massa: '', volume: '', potencia: '' }]); setRecoveryRows([{ nivel: '', aliquota: '', volBalao: '', valEst: [''] }]); setCalculated(false); }} className="gap-2"><RotateCcw className="w-4 h-4" /> Resetar</Button>
      </div>

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <ResultIndicator label="Recuperação Média" value={`${fmtNum(result.media)} %`} criteria="98,0 – 102,0 %" status={result.media >= 98 && result.media <= 102 ? 'pass' : 'fail'} />
          <ResultIndicator label="Desvio Padrão" value={fmtNum(result.dp)} criteria="—" status="pass" />
          <ResultIndicator label="%RSD" value={`${fmtNum(result.rsd)} %`} criteria="≤ 2,0 %" status={result.rsd <= 2 ? 'pass' : 'fail'} />
        </div>
      )}

      {rationaleSteps.length > 0 && (
        <div className="bg-card border rounded-xl p-6">
          <CalculationRationale title="Racional: Exatidão — Estoque" steps={rationaleSteps} />
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2"><FileDown className="w-4 h-4" /> Exportar</Button>
      </div>
    </div>
  );
}
