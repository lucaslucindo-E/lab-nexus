import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ResultIndicator } from '@/components/project/ResultIndicator';
import { CalculationRationale } from '@/components/project/CalculationRationale';
import { fmtNum, stats, executeFormula, type FormulaDefinition } from '@/lib/calc-engine';
import { Calculator, RotateCcw, Plus, Trash2, FileDown } from 'lucide-react';

const formulaConc: FormulaDefinition = {
  id: 'conc_final',
  nome: 'Concentração Final',
  formula: '((massa * potencia) / volBalao) * (aliquota / volFinal)',
  variaveis: { massa: 'Massa', potencia: 'Potência', volBalao: 'Vol. Balão', aliquota: 'Alíquota', volFinal: 'Vol. Final' },
  unidade: 'mg/mL',
};

const formulaRecup: FormulaDefinition = {
  id: 'recuperacao',
  nome: 'Recuperação (%)',
  formula: '(valorEncontrado / concFinal) * 100',
  variaveis: { valorEncontrado: 'Valor Encontrado', concFinal: 'Conc. Final' },
  unidade: '%',
};

interface Row {
  nivel: string;
  massa: string;
  volBalao: string;
  potencia: string;
  aliquota: string;
  volFinal: string;
  valorEncontrado: string;
}

const defaultRows: Row[] = [
  { nivel: 'Baixo', massa: '50', volBalao: '', potencia: '0.999', aliquota: '1', volFinal: '10', valorEncontrado: '' },
  { nivel: 'Baixo', massa: '50', volBalao: '', potencia: '0.999', aliquota: '1', volFinal: '10', valorEncontrado: '' },
  { nivel: 'Baixo', massa: '50', volBalao: '', potencia: '0.999', aliquota: '1', volFinal: '10', valorEncontrado: '' },
  { nivel: 'Médio', massa: '50', volBalao: '', potencia: '0.999', aliquota: '1', volFinal: '10', valorEncontrado: '' },
  { nivel: 'Médio', massa: '50', volBalao: '', potencia: '0.999', aliquota: '1', volFinal: '10', valorEncontrado: '' },
  { nivel: 'Médio', massa: '50', volBalao: '', potencia: '0.999', aliquota: '1', volFinal: '10', valorEncontrado: '' },
  { nivel: 'Alto', massa: '50', volBalao: '', potencia: '0.999', aliquota: '1', volFinal: '10', valorEncontrado: '' },
  { nivel: 'Alto', massa: '50', volBalao: '', potencia: '0.999', aliquota: '1', volFinal: '10', valorEncontrado: '' },
  { nivel: 'Alto', massa: '50', volBalao: '', potencia: '0.999', aliquota: '1', volFinal: '10', valorEncontrado: '' },
];

export function ExatidaoPesadaTab() {
  const [rows, setRows] = useState<Row[]>(defaultRows.map(r => ({ ...r })));
  const [calculated, setCalculated] = useState(false);

  const updateRow = (i: number, field: keyof Row, val: string) => {
    setRows(prev => prev.map((r, idx) => idx === i ? { ...r, [field]: val } : r));
    setCalculated(false);
  };

  const addRow = () => {
    setRows(p => [...p, { nivel: '', massa: '', volBalao: '', potencia: '0.999', aliquota: '1', volFinal: '10', valorEncontrado: '' }]);
    setCalculated(false);
  };

  const removeRow = (i: number) => {
    if (rows.length <= 1) return;
    setRows(p => p.filter((_, idx) => idx !== i));
    setCalculated(false);
  };

  // Calc concentrations inline
  const concResults = useMemo(() => {
    return rows.map(r => {
      const m = Number(r.massa), p = Number(r.potencia), vb = Number(r.volBalao), a = Number(r.aliquota), vf = Number(r.volFinal);
      if ([m, p, vb, a, vf].some(v => !v || isNaN(v))) return null;
      return executeFormula(formulaConc.formula, { massa: m, potencia: p, volBalao: vb, aliquota: a, volFinal: vf });
    });
  }, [rows]);

  const result = useMemo(() => {
    if (!calculated) return null;
    const recups: number[] = [];
    rows.forEach((r, i) => {
      const conc = concResults[i];
      const ve = Number(r.valorEncontrado);
      if (conc && !isNaN(ve) && ve > 0 && conc.value > 0) {
        recups.push((ve / conc.value) * 100);
      }
    });
    if (recups.length === 0) return null;
    return { media: stats.media(recups), dp: stats.desvio_padrao(recups), rsd: stats.rsd(recups), recups };
  }, [calculated, rows, concResults]);

  const rationaleSteps = useMemo(() => {
    if (!result) return [];
    const steps: { label: string; formula: string; substitution?: string; result?: string }[] = [];
    rows.forEach((r, i) => {
      const conc = concResults[i];
      if (conc) {
        steps.push({ label: `Conc. Final ${i + 1} (${r.nivel})`, formula: formulaConc.formula, substitution: conc.substitution, result: `${fmtNum(conc.value, 6)} mg/mL` });
      }
    });
    steps.push(
      { label: 'Média Recuperação', formula: 'Σ(recuperações) / n', result: `${fmtNum(result.media)} %` },
      { label: '%RSD', formula: '(DP / Média) × 100', result: `${fmtNum(result.rsd)} %` },
    );
    return steps;
  }, [result, concResults, rows]);

  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>⚖️</span> Exatidão — Pesada Direta
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {['Nível', 'Massa (mg)', 'Vol. Balão (mL)', 'Potência', 'Alíquota (mL)', 'Vol. Final (mL)', 'Conc. Final (mg/mL)', 'Valor Encontrado'].map(h => (
                  <th key={h} className="text-left py-2 px-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
                <th className="text-right py-2 px-1 text-[10px] font-semibold text-muted-foreground uppercase">Rec. (%)</th>
                <th className="w-8"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => {
                const conc = concResults[i];
                const ve = Number(r.valorEncontrado);
                const recup = conc && !isNaN(ve) && ve > 0 && conc.value > 0 && calculated ? (ve / conc.value) * 100 : null;
                return (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1.5 px-1"><Input value={r.nivel} onChange={e => updateRow(i, 'nivel', e.target.value)} className="h-8 w-20 text-xs" /></td>
                    <td className="py-1.5 px-1"><Input type="number" value={r.massa} onChange={e => updateRow(i, 'massa', e.target.value)} className="h-8 w-16 text-xs" /></td>
                    <td className="py-1.5 px-1"><Input type="number" value={r.volBalao} onChange={e => updateRow(i, 'volBalao', e.target.value)} className="h-8 w-16 text-xs" /></td>
                    <td className="py-1.5 px-1"><Input type="number" step="0.001" value={r.potencia} onChange={e => updateRow(i, 'potencia', e.target.value)} className="h-8 w-16 text-xs" /></td>
                    <td className="py-1.5 px-1"><Input type="number" value={r.aliquota} onChange={e => updateRow(i, 'aliquota', e.target.value)} className="h-8 w-14 text-xs" /></td>
                    <td className="py-1.5 px-1"><Input type="number" value={r.volFinal} onChange={e => updateRow(i, 'volFinal', e.target.value)} className="h-8 w-14 text-xs" /></td>
                    <td className="py-1.5 px-1 font-mono text-xs text-primary font-medium">{conc ? fmtNum(conc.value, 6) : '—'}</td>
                    <td className="py-1.5 px-1"><Input type="number" value={r.valorEncontrado} onChange={e => updateRow(i, 'valorEncontrado', e.target.value)} className="h-8 w-24 text-xs" /></td>
                    <td className="py-1.5 px-1 text-right font-mono text-xs font-medium">
                      {recup != null ? <span className={recup >= 98 && recup <= 102 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'}>{fmtNum(recup, 2)}</span> : '—'}
                    </td>
                    <td className="py-1.5 px-1">
                      <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRow(i)} disabled={rows.length <= 1}>
                        <Trash2 className="w-3 h-3 text-muted-foreground" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Button variant="ghost" size="sm" onClick={addRow} className="mt-2 gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Adicionar Linha
        </Button>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setCalculated(true)} className="gap-2"><Calculator className="w-4 h-4" /> Calcular</Button>
        <Button variant="outline" onClick={() => { setRows(defaultRows.map(r => ({ ...r }))); setCalculated(false); }} className="gap-2"><RotateCcw className="w-4 h-4" /> Resetar</Button>
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
          <CalculationRationale title="Racional: Exatidão — Pesada" steps={rationaleSteps} />
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2"><FileDown className="w-4 h-4" /> Exportar</Button>
      </div>
    </div>
  );
}
