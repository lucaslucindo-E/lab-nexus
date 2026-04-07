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

interface Row { tempo: string; area_tempo_0: string; area_tempo_t: string }

const defaultRows: Row[] = [
  { tempo: '0h', area_tempo_0: '', area_tempo_t: '' },
  { tempo: '6h', area_tempo_0: '', area_tempo_t: '' },
  { tempo: '12h', area_tempo_0: '', area_tempo_t: '' },
  { tempo: '24h', area_tempo_0: '', area_tempo_t: '' },
];

export function EstabilidadeTab() {
  const [rows, setRows] = useState<Row[]>(defaultRows.map(r => ({ ...r })));
  const [observacoes, setObservacoes] = useState('');
  const [calculated, setCalculated] = useState(false);

  const addRow = () => { setRows(prev => [...prev, { tempo: '', area_tempo_0: rows[0]?.area_tempo_0 || '', area_tempo_t: '' }]); setCalculated(false); };
  const removeRow = (i: number) => { if (rows.length <= 1) return; setRows(prev => prev.filter((_, idx) => idx !== i)); setCalculated(false); };
  const updateRow = (i: number, field: keyof Row, val: string) => { setRows(prev => prev.map((r, idx) => (idx === i ? { ...r, [field]: val } : r))); setCalculated(false); };

  const result = useMemo(() => {
    if (!calculated) return null;
    return rows.map(row => {
      const a0 = Number(row.area_tempo_0), at = Number(row.area_tempo_t);
      if (!a0 || !at || isNaN(a0) || isNaN(at)) return { tempo: row.tempo, value: null, substitution: '' };
      const r = executeFormula(formulaResposta.formula, { area_tempo_t: at, area_tempo_0: a0 });
      return { tempo: row.tempo, value: r.value, substitution: r.substitution };
    });
  }, [calculated, rows]);

  const rationaleSteps = useMemo(() => {
    if (!result) return [];
    return result.filter(r => r.value != null).map(c => ({
      label: `Resposta — ${c.tempo}`,
      formula: formulaResposta.formula,
      substitution: c.substitution,
      result: `${fmtNum(c.value!, 2)} %`,
    }));
  }, [result]);

  return (
    <div className="space-y-6">
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>⏱️</span> Estabilidade de Soluções
        </h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2 text-[10px] font-semibold text-muted-foreground uppercase">Tempo</th>
              <th className="text-left py-2 text-[10px] font-semibold text-muted-foreground uppercase">Área T=0</th>
              <th className="text-left py-2 text-[10px] font-semibold text-muted-foreground uppercase">Área T</th>
              <th className="text-right py-2 text-[10px] font-semibold text-muted-foreground uppercase">Resposta (%)</th>
              <th className="w-8"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const res = result?.[i];
              return (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-1.5 pr-2"><Input value={r.tempo} onChange={e => updateRow(i, 'tempo', e.target.value)} className="h-8 w-20 text-xs" /></td>
                  <td className="py-1.5 pr-2"><Input type="number" value={r.area_tempo_0} onChange={e => updateRow(i, 'area_tempo_0', e.target.value)} className="h-8 w-32 text-xs" /></td>
                  <td className="py-1.5 pr-2"><Input type="number" value={r.area_tempo_t} onChange={e => updateRow(i, 'area_tempo_t', e.target.value)} className="h-8 w-32 text-xs" /></td>
                  <td className="py-1.5 text-right font-mono text-sm font-medium">
                    {res?.value != null ? <span className={res.value >= 98 && res.value <= 102 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'}>{fmtNum(res.value, 2)}</span> : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="py-1.5">
                    <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => removeRow(i)} disabled={rows.length <= 1}><Trash2 className="w-3 h-3 text-muted-foreground" /></Button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Button variant="ghost" size="sm" onClick={addRow} className="mt-2 gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Adicionar Tempo
        </Button>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setCalculated(true)} className="gap-2"><Calculator className="w-4 h-4" /> Calcular</Button>
        <Button variant="outline" onClick={() => { setRows(defaultRows.map(r => ({ ...r }))); setCalculated(false); setObservacoes(''); }} className="gap-2"><RotateCcw className="w-4 h-4" /> Resetar</Button>
      </div>

      {result && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {result.filter(r => r.value != null).map((c, i) => (
            <ResultIndicator key={i} label={c.tempo} value={`${fmtNum(c.value!, 2)} %`} criteria="98,0 – 102,0 %" status={c.value! >= 98 && c.value! <= 102 ? 'pass' : 'fail'} />
          ))}
        </div>
      )}

      {rationaleSteps.length > 0 && (
        <div className="bg-card border rounded-xl p-6">
          <CalculationRationale title="Racional: Estabilidade" steps={rationaleSteps} />
        </div>
      )}

      <Textarea value={observacoes} onChange={e => setObservacoes(e.target.value)} placeholder="Observações..." rows={3} />

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2"><FileDown className="w-4 h-4" /> Exportar</Button>
      </div>
    </div>
  );
}
