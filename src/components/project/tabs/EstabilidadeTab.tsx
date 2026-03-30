import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ResultIndicator } from '@/components/project/ResultIndicator';
import { CalculationRationale } from '@/components/project/CalculationRationale';
import { fmtNum, executeFormula, type FormulaDefinition } from '@/lib/calc-engine';
import { Calculator, RotateCcw, Plus, Trash2, FileDown } from 'lucide-react';

const formulaResposta: FormulaDefinition = {
  id: 'resposta',
  nome: 'Resposta Relativa (%)',
  formula: '(area_tempo_t / area_tempo_0) * 100',
  variaveis: { area_tempo_t: 'Área no tempo T', area_tempo_0: 'Área no tempo 0' },
  unidade: '%',
};

const defaultRows = [
  { tempo: '0h', area_tempo_0: '490150', area_tempo_t: '490150' },
  { tempo: '6h', area_tempo_0: '490150', area_tempo_t: '489200' },
  { tempo: '12h', area_tempo_0: '490150', area_tempo_t: '488100' },
  { tempo: '24h', area_tempo_0: '490150', area_tempo_t: '486500' },
];

export function EstabilidadeTab() {
  const [rows, setRows] = useState(defaultRows.map(r => ({ ...r })));
  const [observacoes, setObservacoes] = useState('');
  const [calculated, setCalculated] = useState(false);

  const addRow = () => { setRows(prev => [...prev, { tempo: '', area_tempo_0: rows[0]?.area_tempo_0 || '', area_tempo_t: '' }]); setCalculated(false); };
  const removeRow = (i: number) => { if (rows.length <= 1) return; setRows(prev => prev.filter((_, idx) => idx !== i)); setCalculated(false); };
  const updateRow = (i: number, field: string, val: string) => { setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r))); setCalculated(false); };

  const result = useMemo(() => {
    if (!calculated) return null;
    const calcs: { tempo: string; value: number; substitution: string }[] = [];
    for (const row of rows) {
      const a0 = Number(row.area_tempo_0), at = Number(row.area_tempo_t);
      if (isNaN(a0) || isNaN(at) || a0 === 0) return null;
      const r = executeFormula(formulaResposta.formula, { area_tempo_t: at, area_tempo_0: a0 });
      calcs.push({ tempo: row.tempo, ...r });
    }
    return calcs;
  }, [calculated, rows]);

  const rationaleSteps = useMemo(() => {
    if (!result) return [];
    return result.map(c => ({
      label: `Resposta — ${c.tempo}`,
      formula: formulaResposta.formula,
      substitution: c.substitution,
      result: `${fmtNum(c.value)} %`,
    }));
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
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Tempo</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Área T=0</th>
                <th className="text-left px-4 py-2 font-medium text-muted-foreground">Área T</th>
                <th className="w-12"></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2"><Input value={r.tempo} onChange={e => updateRow(i, 'tempo', e.target.value)} className="h-8 w-20" /></td>
                  <td className="px-4 py-2"><Input type="number" value={r.area_tempo_0} onChange={e => updateRow(i, 'area_tempo_0', e.target.value)} className="h-8 w-32" /></td>
                  <td className="px-4 py-2"><Input type="number" value={r.area_tempo_t} onChange={e => updateRow(i, 'area_tempo_t', e.target.value)} className="h-8 w-32" /></td>
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
          <Button variant="outline" onClick={addRow} className="gap-2"><Plus className="w-4 h-4" /> Adicionar Tempo</Button>
          <Button variant="outline" onClick={reset} className="gap-2"><RotateCcw className="w-4 h-4" /> Resetar</Button>
        </div>
      </section>

      {result && (
        <section>
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
            Resultados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {result.map((c, i) => (
              <ResultIndicator key={i} label={`${c.tempo}`} value={`${fmtNum(c.value)} %`} criteria="98,0 – 102,0 %" status={c.value >= 98 && c.value <= 102 ? 'pass' : 'fail'} />
            ))}
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
            <CalculationRationale title="Estabilidade de Soluções" steps={rationaleSteps} />
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
