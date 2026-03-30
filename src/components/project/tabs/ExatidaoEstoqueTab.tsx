import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';

import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ResultIndicator } from '@/components/project/ResultIndicator';
import { CalculationRationale } from '@/components/project/CalculationRationale';
import { fmtNum, stats, executeFormula, type FormulaDefinition } from '@/lib/calc-engine';
import { Calculator, RotateCcw, Plus, Trash2, FileDown } from 'lucide-react';

const formulaRecuperacao: FormulaDefinition = {
  id: 'recuperacao',
  nome: 'Recuperação (%)',
  formula: '(valor_encontrado / valor_teorico) * 100',
  variaveis: { valor_encontrado: 'Valor Encontrado', valor_teorico: 'Valor Teórico' },
  unidade: '%',
};

const defaultRows = [
  { nivel: '80%', valor_encontrado: '79.5', valor_teorico: '80' },
  { nivel: '100%', valor_encontrado: '100.2', valor_teorico: '100' },
  { nivel: '120%', valor_encontrado: '119.8', valor_teorico: '120' },
];

export function ExatidaoEstoqueTab() {
  const [rows, setRows] = useState(defaultRows.map(r => ({ ...r })));
  const [observacoes, setObservacoes] = useState('');
  const [calculated, setCalculated] = useState(false);

  const addRow = () => {
    setRows(prev => [...prev, { nivel: '', valor_encontrado: '', valor_teorico: '' }]);
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
    const calcs: { value: number; substitution: string }[] = [];
    for (const row of rows) {
      const ve = Number(row.valor_encontrado);
      const vt = Number(row.valor_teorico);
      if (isNaN(ve) || isNaN(vt) || vt === 0) return null;
      calcs.push(executeFormula(formulaRecuperacao.formula, { valor_encontrado: ve, valor_teorico: vt }));
    }
    const values = calcs.map(c => c.value);
    return { calcs, values, media: stats.media(values), dp: stats.desvio_padrao(values), rsd: stats.rsd(values) };
  }, [calculated, rows]);

  const rationaleSteps = useMemo(() => {
    if (!result) return [];
    const steps: { label: string; formula: string; substitution?: string; result?: string }[] = [];
    result.calcs.forEach((c, i) => {
      steps.push({ label: `Recuperação Nível ${i + 1}`, formula: formulaRecuperacao.formula, substitution: c.substitution, result: `${fmtNum(c.value)} %` });
    });
    steps.push(
      { label: 'Média', formula: 'Σ(recuperações) / n', result: `${fmtNum(result.media)} %` },
      { label: '%RSD', formula: '(DP / Média) × 100', result: `${fmtNum(result.rsd)} %` },
    );
    return steps;
  }, [result]);

  const reset = () => {
    setRows(defaultRows.map(r => ({ ...r })));
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
        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Nível</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Valor Teórico</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Valor Encontrado</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2">
                    <Input value={r.nivel} onChange={e => updateRow(i, 'nivel', e.target.value)} className="h-8 w-24" placeholder="80%" />
                  </td>
                  <td className="px-4 py-2">
                    <Input type="number" value={r.valor_teorico} onChange={e => updateRow(i, 'valor_teorico', e.target.value)} className="h-8 w-32" />
                  </td>
                  <td className="px-4 py-2">
                    <Input type="number" value={r.valor_encontrado} onChange={e => updateRow(i, 'valor_encontrado', e.target.value)} className="h-8 w-32" />
                  </td>
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
          <Button variant="outline" onClick={addRow} className="gap-2"><Plus className="w-4 h-4" /> Adicionar Nível</Button>
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
            <CalculationRationale title="Exatidão — Solução Estoque" steps={rationaleSteps} />
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
