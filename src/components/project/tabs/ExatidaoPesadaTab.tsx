import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ResultIndicator } from '@/components/project/ResultIndicator';
import { CalculationRationale } from '@/components/project/CalculationRationale';
import { fmtNum, stats, executeFormula, type FormulaDefinition } from '@/lib/calc-engine';
import { Calculator, RotateCcw, Plus, Trash2, FileDown } from 'lucide-react';

const formulaConcentracao: FormulaDefinition = {
  id: 'C',
  nome: 'Concentração Real',
  formula: '(massa * potencia) / volume',
  variaveis: { massa: 'Massa (mg)', potencia: 'Potência (fração)', volume: 'Volume (mL)' },
  unidade: 'mg/mL',
};

const formulaRecuperacao: FormulaDefinition = {
  id: 'recuperacao',
  nome: 'Recuperação (%)',
  formula: '(resultado / teorico) * 100',
  variaveis: { resultado: 'Resultado', teorico: 'Teórico' },
  unidade: '%',
};

const defaultRows = [
  { massa: '10.05', potencia: '0.995', volume: '25', teorico: '100' },
  { massa: '10.02', potencia: '0.995', volume: '25', teorico: '100' },
  { massa: '9.98', potencia: '0.995', volume: '25', teorico: '100' },
];

export function ExatidaoPesadaTab() {
  const [rows, setRows] = useState(defaultRows.map(r => ({ ...r })));
  const [observacoes, setObservacoes] = useState('');
  const [calculated, setCalculated] = useState(false);

  const addRow = () => {
    setRows(prev => [...prev, { massa: '', potencia: '', volume: '', teorico: '' }]);
    setCalculated(false);
  };

  const removeRow = (i: number) => {
    if (rows.length <= 1) return;
    setRows(prev => prev.filter((_, idx) => idx !== i));
    setCalculated(false);
  };

  const updateRow = (i: number, field: string, val: string) => {
    setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r)));
    setCalculated(false);
  };

  const result = useMemo(() => {
    if (!calculated) return null;
    const calcs: { conc: { value: number; substitution: string }; recup: { value: number; substitution: string } }[] = [];
    for (const row of rows) {
      const m = Number(row.massa), p = Number(row.potencia), v = Number(row.volume), t = Number(row.teorico);
      if ([m, p, v, t].some(isNaN) || v === 0 || t === 0) return null;
      const conc = executeFormula(formulaConcentracao.formula, { massa: m, potencia: p, volume: v });
      const recup = executeFormula(formulaRecuperacao.formula, { resultado: conc.value, teorico: t });
      calcs.push({ conc, recup });
    }
    const recValues = calcs.map(c => c.recup.value);
    return { calcs, media: stats.media(recValues), dp: stats.desvio_padrao(recValues), rsd: stats.rsd(recValues) };
  }, [calculated, rows]);

  const rationaleSteps = useMemo(() => {
    if (!result) return [];
    const steps: { label: string; formula: string; substitution?: string; result?: string }[] = [];
    result.calcs.forEach((c, i) => {
      steps.push(
        { label: `Concentração ${i + 1}`, formula: formulaConcentracao.formula, substitution: c.conc.substitution, result: `${fmtNum(c.conc.value)} mg/mL` },
        { label: `Recuperação ${i + 1}`, formula: formulaRecuperacao.formula, substitution: c.recup.substitution, result: `${fmtNum(c.recup.value)} %` },
      );
    });
    steps.push(
      { label: 'Média Recuperação', formula: 'Σ(recuperações) / n', result: `${fmtNum(result.media)} %` },
      { label: '%RSD', formula: '(DP / Média) × 100', result: `${fmtNum(result.rsd)} %` },
    );
    return steps;
  }, [result]);

  const reset = () => { setRows(defaultRows.map(r => ({ ...r }))); setCalculated(false); setObservacoes(''); };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
          Entrada de Dados
        </h2>
        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground w-12">#</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Massa (mg)</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Potência</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Volume (mL)</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Teórico</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-2"><Input type="number" value={r.massa} onChange={e => updateRow(i, 'massa', e.target.value)} className="h-8 w-28" /></td>
                  <td className="px-4 py-2"><Input type="number" step="0.001" value={r.potencia} onChange={e => updateRow(i, 'potencia', e.target.value)} className="h-8 w-24" /></td>
                  <td className="px-4 py-2"><Input type="number" value={r.volume} onChange={e => updateRow(i, 'volume', e.target.value)} className="h-8 w-24" /></td>
                  <td className="px-4 py-2"><Input type="number" value={r.teorico} onChange={e => updateRow(i, 'teorico', e.target.value)} className="h-8 w-24" /></td>
                  <td className="px-4 py-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRow(i)} disabled={rows.length <= 1}>
                      <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 mt-4">
          <Button onClick={() => setCalculated(true)} className="gap-2"><Calculator className="w-4 h-4" /> Calcular</Button>
          <Button variant="outline" onClick={addRow} className="gap-2"><Plus className="w-4 h-4" /> Adicionar Linha</Button>
          <Button variant="outline" onClick={reset} className="gap-2"><RotateCcw className="w-4 h-4" /> Resetar</Button>
        </div>
      </section>

      {result && (
        <section>
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
            Resultados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <ResultIndicator label="Recuperação Média" value={`${fmtNum(result.media)} %`} criteria="98,0 – 102,0 %" status={result.media >= 98 && result.media <= 102 ? 'pass' : 'fail'} />
            <ResultIndicator label="Desvio Padrão" value={fmtNum(result.dp)} criteria="—" status="pass" />
            <ResultIndicator label="%RSD" value={`${fmtNum(result.rsd)} %`} criteria="≤ 2,0 %" status={result.rsd <= 2 ? 'pass' : 'fail'} />
          </div>
        </section>
      )}

      {rationaleSteps.length > 0 && (
        <section>
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
            Racional do Cálculo
          </h2>
          <div className="bg-card border rounded-lg p-6">
            <CalculationRationale title="Exatidão — Pesada Individual" steps={rationaleSteps} />
          </div>
        </section>
      )}

      <section>
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</span>
          Observações
        </h2>
        <Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Adicione observações..." rows={4} />
      </section>

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2"><FileDown className="w-4 h-4" /> Exportar</Button>
      </div>
    </div>
  );
}
