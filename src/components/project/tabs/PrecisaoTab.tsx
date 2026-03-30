import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ResultIndicator } from '@/components/project/ResultIndicator';
import { CalculationRationale } from '@/components/project/CalculationRationale';
import { fmtNum, stats, executeFormula, type FormulaDefinition } from '@/lib/calc-engine';
import { Calculator, RotateCcw, Plus, Trash2, FileDown } from 'lucide-react';

const formulaTeor: FormulaDefinition = {
  id: 'teor',
  nome: 'Teor (%)',
  formula: '(area_amostra / area_padrao) * conc_padrao * fator',
  variaveis: { area_amostra: 'Área Amostra', area_padrao: 'Área Padrão', conc_padrao: 'Conc. Padrão', fator: 'Fator' },
  unidade: '%',
};

const defaultReplicates = [
  { area_amostra: '491200' },
  { area_amostra: '490800' },
  { area_amostra: '491500' },
  { area_amostra: '490100' },
  { area_amostra: '491800' },
  { area_amostra: '490600' },
];

export function PrecisaoTab() {
  const [areaPadrao, setAreaPadrao] = useState('490150');
  const [concPadrao, setConcPadrao] = useState('100');
  const [fator, setFator] = useState('1');
  const [replicates, setReplicates] = useState(defaultReplicates.map(r => ({ ...r })));
  const [observacoes, setObservacoes] = useState('');
  const [calculated, setCalculated] = useState(false);

  const addRow = () => {
    setReplicates(prev => [...prev, { area_amostra: '' }]);
    setCalculated(false);
  };

  const removeRow = (i: number) => {
    if (replicates.length <= 2) return;
    setReplicates(prev => prev.filter((_, idx) => idx !== i));
    setCalculated(false);
  };

  const result = useMemo(() => {
    if (!calculated) return null;
    const ap = Number(areaPadrao);
    const cp = Number(concPadrao);
    const f = Number(fator);
    if ([ap, cp, f].some(isNaN) || ap === 0) return null;

    const teores: { value: number; substitution: string }[] = [];
    for (const rep of replicates) {
      const aa = Number(rep.area_amostra);
      if (isNaN(aa)) return null;
      const r = executeFormula(formulaTeor.formula, { area_amostra: aa, area_padrao: ap, conc_padrao: cp, fator: f });
      teores.push(r);
    }

    const values = teores.map(t => t.value);
    const media = stats.media(values);
    const dp = stats.desvio_padrao(values);
    const rsd = stats.rsd(values);

    return { teores, values, media, dp, rsd };
  }, [calculated, replicates, areaPadrao, concPadrao, fator]);

  const rationaleSteps = useMemo(() => {
    if (!result) return [];
    const steps: { label: string; formula: string; substitution?: string; result?: string }[] = [];
    result.teores.forEach((t, i) => {
      steps.push({
        label: `Teor Rep. ${i + 1}`,
        formula: formulaTeor.formula,
        substitution: t.substitution,
        result: `${fmtNum(t.value)} %`,
      });
    });
    steps.push(
      { label: 'Média', formula: 'Σ(valores) / n', result: `${fmtNum(result.media)} %` },
      { label: 'Desvio Padrão', formula: '√[Σ(x - média)² / (n-1)]', result: fmtNum(result.dp) },
      { label: '%RSD', formula: '(DP / Média) × 100', substitution: `(${fmtNum(result.dp)} / ${fmtNum(result.media)}) × 100`, result: `${fmtNum(result.rsd)} %` },
    );
    return steps;
  }, [result]);

  const reset = () => {
    setReplicates(defaultReplicates.map(r => ({ ...r })));
    setAreaPadrao('490150');
    setConcPadrao('100');
    setFator('1');
    setCalculated(false);
    setObservacoes('');
  };

  return (
    <div className="space-y-8">
      <section>
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
          Entrada de Dados
        </h2>
        <div className="bg-card border rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label className="text-xs">Área Padrão</Label>
              <Input type="number" value={areaPadrao} onChange={e => { setAreaPadrao(e.target.value); setCalculated(false); }} className="h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Concentração Padrão</Label>
              <Input type="number" value={concPadrao} onChange={e => { setConcPadrao(e.target.value); setCalculated(false); }} className="h-8" />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">Fator</Label>
              <Input type="number" step="0.01" value={fator} onChange={e => { setFator(e.target.value); setCalculated(false); }} className="h-8" />
            </div>
          </div>

          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground w-16">Rep.</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Área Amostra</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {replicates.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-2">
                    <Input type="number" value={r.area_amostra} onChange={e => { const next = [...replicates]; next[i] = { area_amostra: e.target.value }; setReplicates(next); setCalculated(false); }} className="h-8 w-40" />
                  </td>
                  <td className="px-4 py-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRow(i)} disabled={replicates.length <= 2}>
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
          <Button variant="outline" onClick={addRow} className="gap-2"><Plus className="w-4 h-4" /> Adicionar Replicata</Button>
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
            <ResultIndicator label="Média" value={`${fmtNum(result.media)} %`} criteria="98,0 – 102,0 %" status={result.media >= 98 && result.media <= 102 ? 'pass' : 'fail'} />
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
            <CalculationRationale title="Precisão — Repetibilidade" steps={rationaleSteps} />
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
