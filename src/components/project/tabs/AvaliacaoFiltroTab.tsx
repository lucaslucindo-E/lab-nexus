import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ResultIndicator } from '@/components/project/ResultIndicator';
import { CalculationRationale } from '@/components/project/CalculationRationale';
import { fmtNum, stats, executeFormula, type FormulaDefinition } from '@/lib/calc-engine';
import { Calculator, RotateCcw, Plus, Trash2, FileDown } from 'lucide-react';

const formulaRecuperacao: FormulaDefinition = {
  id: 'recuperacao_filtro',
  nome: 'Recuperação Filtro (%)',
  formula: '(area_filtrada / area_sem_filtrar) * 100',
  variaveis: { area_filtrada: 'Área Filtrada', area_sem_filtrar: 'Área Sem Filtrar' },
  unidade: '%',
};

const defaultRows = [
  { area_sem_filtrar: '490150', area_filtrada: '489800' },
  { area_sem_filtrar: '490150', area_filtrada: '490050' },
  { area_sem_filtrar: '490150', area_filtrada: '489500' },
];

export function AvaliacaoFiltroTab() {
  const [rows, setRows] = useState(defaultRows.map(r => ({ ...r })));
  const [observacoes, setObservacoes] = useState('');
  const [calculated, setCalculated] = useState(false);

  const addRow = () => { setRows(prev => [...prev, { area_sem_filtrar: '', area_filtrada: '' }]); setCalculated(false); };
  const removeRow = (i: number) => { if (rows.length <= 1) return; setRows(prev => prev.filter((_, idx) => idx !== i)); setCalculated(false); };
  const updateRow = (i: number, field: string, val: string) => { setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r))); setCalculated(false); };

  const result = useMemo(() => {
    if (!calculated) return null;
    const calcs: { value: number; substitution: string }[] = [];
    for (const row of rows) {
      const af = Number(row.area_filtrada), as_ = Number(row.area_sem_filtrar);
      if (isNaN(af) || isNaN(as_) || as_ === 0) return null;
      calcs.push(executeFormula(formulaRecuperacao.formula, { area_filtrada: af, area_sem_filtrar: as_ }));
    }
    const values = calcs.map(c => c.value);
    return { calcs, values, media: stats.media(values), dp: stats.desvio_padrao(values), rsd: stats.rsd(values) };
  }, [calculated, rows]);

  const rationaleSteps = useMemo(() => {
    if (!result) return [];
    const steps: { label: string; formula: string; substitution?: string; result?: string }[] = [];
    result.calcs.forEach((c, i) => {
      steps.push({ label: `Recuperação ${i + 1}`, formula: formulaRecuperacao.formula, substitution: c.substitution, result: `${fmtNum(c.value)} %` });
    });
    steps.push({ label: 'Média', formula: 'Σ(valores) / n', result: `${fmtNum(result.media)} %` });
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
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Área Sem Filtrar</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Área Filtrada</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-2"><Input type="number" value={r.area_sem_filtrar} onChange={e => updateRow(i, 'area_sem_filtrar', e.target.value)} className="h-8 w-36" /></td>
                  <td className="px-4 py-2"><Input type="number" value={r.area_filtrada} onChange={e => updateRow(i, 'area_filtrada', e.target.value)} className="h-8 w-36" /></td>
                  <td className="px-4 py-2">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRow(i)} disabled={rows.length <= 1}><Trash2 className="w-3.5 h-3.5 text-muted-foreground" /></Button>
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
            <CalculationRationale title="Avaliação de Filtro" steps={rationaleSteps} />
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
