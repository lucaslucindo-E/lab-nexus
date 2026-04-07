import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CalculationRationale } from '@/components/project/CalculationRationale';
import { fmtNum, executeFormula, type FormulaDefinition } from '@/lib/calc-engine';
import { Calculator, RotateCcw, Plus, Trash2, FileDown } from 'lucide-react';

const formulaRecuperacao: FormulaDefinition = {
  id: 'recuperacao_filtro',
  nome: 'Recuperação Filtro (%)',
  formula: '(area_filtrada / area_sem_filtrar) * 100',
  variaveis: { area_filtrada: 'Área Filtrada', area_sem_filtrar: 'Área Sem Filtrar' },
  unidade: '%',
};

interface FilterRow { filtro: string; area: string }
interface SectionData {
  areaRef: string;
  rows: FilterRow[];
}

const defaultFilters: FilterRow[] = [
  { filtro: 'PVDF 0,45', area: '' },
  { filtro: 'PVDF 0,22', area: '' },
  { filtro: 'PTFE 0,45', area: '' },
];

export function AvaliacaoFiltroTab() {
  const [padrao, setPadrao] = useState<SectionData>({ areaRef: '', rows: defaultFilters.map(r => ({ ...r })) });
  const [amostra, setAmostra] = useState<SectionData>({ areaRef: '', rows: [{ filtro: 'PVDF 0,45', area: '' }, { filtro: 'PVDF 0,22', area: '' }, { filtro: 'PTFE 0,22', area: '' }] });
  const [calculated, setCalculated] = useState(false);

  const calcSection = (data: SectionData) => {
    const ref = Number(data.areaRef);
    if (!ref || isNaN(ref)) return null;
    return data.rows.map(r => {
      const a = Number(r.area);
      if (!a || isNaN(a)) return { filtro: r.filtro, value: null, substitution: '' };
      const res = executeFormula(formulaRecuperacao.formula, { area_filtrada: a, area_sem_filtrar: ref });
      return { filtro: r.filtro, value: res.value, substitution: res.substitution };
    });
  };

  const padraoResults = useMemo(() => calculated ? calcSection(padrao) : null, [calculated, padrao]);
  const amostraResults = useMemo(() => calculated ? calcSection(amostra) : null, [calculated, amostra]);

  const addRow = (setter: React.Dispatch<React.SetStateAction<SectionData>>) => {
    setter(prev => ({ ...prev, rows: [...prev.rows, { filtro: '', area: '' }] }));
    setCalculated(false);
  };

  const updateRow = (setter: React.Dispatch<React.SetStateAction<SectionData>>, i: number, field: keyof FilterRow, val: string) => {
    setter(prev => ({
      ...prev,
      rows: prev.rows.map((r, idx) => idx === i ? { ...r, [field]: val } : r),
    }));
    setCalculated(false);
  };

  const removeRow = (setter: React.Dispatch<React.SetStateAction<SectionData>>, i: number, data: SectionData) => {
    if (data.rows.length <= 1) return;
    setter(prev => ({ ...prev, rows: prev.rows.filter((_, idx) => idx !== i) }));
    setCalculated(false);
  };

  const renderSection = (
    title: string,
    icon: string,
    data: SectionData,
    setter: React.Dispatch<React.SetStateAction<SectionData>>,
    results: ReturnType<typeof calcSection>
  ) => (
    <div className="bg-card border rounded-xl p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <span>{icon}</span> {title}
      </h3>

      <div className="mb-4">
        <label className="text-xs font-medium text-muted-foreground">Área sem Filtrar (Referência)</label>
        <Input
          type="number"
          value={data.areaRef}
          onChange={e => { setter(prev => ({ ...prev, areaRef: e.target.value })); setCalculated(false); }}
          className="h-9 w-48 mt-1"
          placeholder="Ex: 490150"
        />
      </div>

      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Filtro</th>
            <th className="text-left py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Área do Pico</th>
            <th className="text-right py-2 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Recuperação (%)</th>
            <th className="w-10"></th>
          </tr>
        </thead>
        <tbody>
          {data.rows.map((r, i) => (
            <tr key={i} className="border-b border-border/50">
              <td className="py-2 pr-3">
                <Input value={r.filtro} onChange={e => updateRow(setter, i, 'filtro', e.target.value)} className="h-8" placeholder="Tipo do filtro" />
              </td>
              <td className="py-2 pr-3">
                <Input type="number" value={r.area} onChange={e => updateRow(setter, i, 'area', e.target.value)} className="h-8" />
              </td>
              <td className="py-2 text-right font-mono text-sm font-medium">
                {results?.[i]?.value != null ? <span className={results[i].value! >= 98 && results[i].value! <= 102 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'}>{fmtNum(results[i].value!, 2)}</span> : <span className="text-muted-foreground">—</span>}
              </td>
              <td className="py-2">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => removeRow(setter, i, data)} disabled={data.rows.length <= 1}>
                  <Trash2 className="w-3.5 h-3.5 text-muted-foreground" />
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <Button variant="ghost" size="sm" onClick={() => addRow(setter)} className="mt-2 gap-1.5 text-xs">
        <Plus className="w-3.5 h-3.5" /> Adicionar Linha
      </Button>
    </div>
  );

  const rationaleSteps = useMemo(() => {
    if (!padraoResults && !amostraResults) return [];
    const steps: { label: string; formula: string; substitution?: string; result?: string }[] = [];
    padraoResults?.forEach(r => {
      if (r.value != null) steps.push({ label: `Padrão — ${r.filtro}`, formula: formulaRecuperacao.formula, substitution: r.substitution, result: `${fmtNum(r.value, 2)} %` });
    });
    amostraResults?.forEach(r => {
      if (r.value != null) steps.push({ label: `Amostra — ${r.filtro}`, formula: formulaRecuperacao.formula, substitution: r.substitution, result: `${fmtNum(r.value, 2)} %` });
    });
    return steps;
  }, [padraoResults, amostraResults]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {renderSection('Solução Padrão', '🧪', padrao, setPadrao, padraoResults)}
        {renderSection('Solução Amostra', '🧪', amostra, setAmostra, amostraResults)}
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setCalculated(true)} className="gap-2">
          <Calculator className="w-4 h-4" /> Calcular
        </Button>
        <Button variant="outline" onClick={() => { setPadrao({ areaRef: '', rows: defaultFilters.map(r => ({ ...r })) }); setAmostra({ areaRef: '', rows: [{ filtro: 'PVDF 0,45', area: '' }, { filtro: 'PVDF 0,22', area: '' }, { filtro: 'PTFE 0,22', area: '' }] }); setCalculated(false); }} className="gap-2">
          <RotateCcw className="w-4 h-4" /> Resetar
        </Button>
      </div>

      {rationaleSteps.length > 0 && (
        <div className="bg-card border rounded-xl p-6">
          <CalculationRationale title="Racional: Avaliação de Filtro" steps={rationaleSteps} />
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2"><FileDown className="w-4 h-4" /> Exportar</Button>
      </div>
    </div>
  );
}
