import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ResultIndicator } from '@/components/project/ResultIndicator';
import { CalculationRationale } from '@/components/project/CalculationRationale';
import { fmtNum, executeFormula, type FormulaDefinition } from '@/lib/calc-engine';
import { Calculator, RotateCcw, Plus, Trash2, FileDown } from 'lucide-react';

const formulaRecuperacao: FormulaDefinition = {
  id: 'recuperacao_robustez',
  nome: 'Recuperação Robustez (%)',
  formula: '(areaAmostra / areaPadrao) * 100',
  variaveis: { areaAmostra: 'Área Amostra', areaPadrao: 'Área Padrão' },
  unidade: '%',
};

interface SSTRow {
  parametro: string;
  tRetencao: string;
  dpr: string;
  fatorCauda: string;
  pratosT: string;
}

interface ResultRow {
  parametro: string;
  areaPadrao: string;
  areaAmostra: string;
}

const defaultSST: SSTRow[] = [
  { parametro: 'Controle (n=5)', tRetencao: '', dpr: '', fatorCauda: '1', pratosT: '' },
  { parametro: 'Temperatura 36 °C', tRetencao: '', dpr: '', fatorCauda: '1', pratosT: '' },
  { parametro: 'Temperatura 44 °C', tRetencao: '', dpr: '', fatorCauda: '1', pratosT: '' },
  { parametro: 'Fluxo 1,2 mL/min', tRetencao: '', dpr: '', fatorCauda: '1', pratosT: '' },
  { parametro: 'Fluxo 0,9 mL/min', tRetencao: '', dpr: '', fatorCauda: '1', pratosT: '' },
];

const defaultResults: ResultRow[] = [
  { parametro: 'Controle (n=5)', areaPadrao: '', areaAmostra: '' },
  { parametro: 'Temperatura 36 °C', areaPadrao: '', areaAmostra: '' },
  { parametro: 'Temperatura 44 °C', areaPadrao: '', areaAmostra: '' },
  { parametro: 'Fluxo 1,2 mL/min', areaPadrao: '', areaAmostra: '' },
  { parametro: 'Fluxo 0,9 mL/min', areaPadrao: '', areaAmostra: '' },
];

export function RobustezTab() {
  const [sstRows, setSstRows] = useState<SSTRow[]>(defaultSST.map(r => ({ ...r })));
  const [resultRows, setResultRows] = useState<ResultRow[]>(defaultResults.map(r => ({ ...r })));
  const [calculated, setCalculated] = useState(false);

  const addSST = () => { setSstRows(p => [...p, { parametro: '', tRetencao: '', dpr: '', fatorCauda: '1', pratosT: '' }]); setCalculated(false); };
  const addResult = () => { setResultRows(p => [...p, { parametro: '', areaPadrao: '', areaAmostra: '' }]); setCalculated(false); };

  const recResults = useMemo(() => {
    if (!calculated) return null;
    return resultRows.map(r => {
      const ap = Number(r.areaPadrao), aa = Number(r.areaAmostra);
      if (!ap || !aa || isNaN(ap) || isNaN(aa)) return { parametro: r.parametro, value: null, substitution: '' };
      const res = executeFormula(formulaRecuperacao.formula, { areaAmostra: aa, areaPadrao: ap });
      return { parametro: r.parametro, value: res.value, substitution: res.substitution };
    });
  }, [calculated, resultRows]);

  const rationaleSteps = useMemo(() => {
    if (!recResults) return [];
    return recResults.filter(r => r.value != null).map(r => ({
      label: `Recuperação — ${r.parametro}`,
      formula: formulaRecuperacao.formula,
      substitution: r.substitution,
      result: `${fmtNum(r.value!, 2)} %`,
    }));
  }, [recResults]);

  return (
    <div className="space-y-6">
      {/* SST Table */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>⚙️</span> Adequabilidade do Sistema
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                {['Parâmetro', 'T. Retenção (min)', 'DPR (%)', 'Fator Cauda', 'Pratos Teóricos'].map(h => (
                  <th key={h} className="text-left py-2 px-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sstRows.map((r, i) => (
                <tr key={i} className="border-b border-border/50">
                  <td className="py-1.5 px-1"><Input value={r.parametro} onChange={e => { const next = [...sstRows]; next[i] = { ...r, parametro: e.target.value }; setSstRows(next); }} className="h-8 text-xs" /></td>
                  <td className="py-1.5 px-1"><Input type="number" value={r.tRetencao} onChange={e => { const next = [...sstRows]; next[i] = { ...r, tRetencao: e.target.value }; setSstRows(next); }} className="h-8 w-24 text-xs" /></td>
                  <td className="py-1.5 px-1"><Input type="number" value={r.dpr} onChange={e => { const next = [...sstRows]; next[i] = { ...r, dpr: e.target.value }; setSstRows(next); }} className="h-8 w-20 text-xs" /></td>
                  <td className="py-1.5 px-1"><Input type="number" value={r.fatorCauda} onChange={e => { const next = [...sstRows]; next[i] = { ...r, fatorCauda: e.target.value }; setSstRows(next); }} className="h-8 w-20 text-xs" /></td>
                  <td className="py-1.5 px-1"><Input type="number" value={r.pratosT} onChange={e => { const next = [...sstRows]; next[i] = { ...r, pratosT: e.target.value }; setSstRows(next); }} className="h-8 w-24 text-xs" /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Button variant="ghost" size="sm" onClick={addSST} className="mt-2 gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Adicionar Linha
        </Button>
      </div>

      {/* Results Table */}
      <div className="bg-card border rounded-xl p-6">
        <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
          <span>📊</span> Resultados de Robustez
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b">
                <th className="text-left py-2 px-1 text-[10px] font-semibold text-muted-foreground uppercase">Parâmetro</th>
                <th className="text-left py-2 px-1 text-[10px] font-semibold text-muted-foreground uppercase">Área Padrão (mAU)</th>
                <th className="text-left py-2 px-1 text-[10px] font-semibold text-muted-foreground uppercase">Área Amostra (mAU)</th>
                <th className="text-right py-2 px-1 text-[10px] font-semibold text-muted-foreground uppercase">Recuperação (%)</th>
              </tr>
            </thead>
            <tbody>
              {resultRows.map((r, i) => {
                const rec = recResults?.[i];
                return (
                  <tr key={i} className="border-b border-border/50">
                    <td className="py-1.5 px-1"><Input value={r.parametro} onChange={e => { const next = [...resultRows]; next[i] = { ...r, parametro: e.target.value }; setResultRows(next); setCalculated(false); }} className="h-8 text-xs" /></td>
                    <td className="py-1.5 px-1"><Input type="number" value={r.areaPadrao} onChange={e => { const next = [...resultRows]; next[i] = { ...r, areaPadrao: e.target.value }; setResultRows(next); setCalculated(false); }} className="h-8 w-32 text-xs" /></td>
                    <td className="py-1.5 px-1"><Input type="number" value={r.areaAmostra} onChange={e => { const next = [...resultRows]; next[i] = { ...r, areaAmostra: e.target.value }; setResultRows(next); setCalculated(false); }} className="h-8 w-32 text-xs" /></td>
                    <td className="py-1.5 px-1 text-right font-mono text-sm font-medium">
                      {rec?.value != null ? <span className={rec.value >= 98 && rec.value <= 102 ? 'text-[hsl(var(--success))]' : 'text-[hsl(var(--destructive))]'}>{fmtNum(rec.value, 2)}</span> : <span className="text-muted-foreground">—</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        <Button variant="ghost" size="sm" onClick={addResult} className="mt-2 gap-1.5 text-xs">
          <Plus className="w-3.5 h-3.5" /> Adicionar Linha
        </Button>
      </div>

      <div className="flex gap-3">
        <Button onClick={() => setCalculated(true)} className="gap-2"><Calculator className="w-4 h-4" /> Calcular</Button>
        <Button variant="outline" onClick={() => { setSstRows(defaultSST.map(r => ({ ...r }))); setResultRows(defaultResults.map(r => ({ ...r }))); setCalculated(false); }} className="gap-2"><RotateCcw className="w-4 h-4" /> Resetar</Button>
      </div>

      {recResults && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recResults.filter(r => r.value != null).map((r, i) => (
            <ResultIndicator key={i} label={r.parametro} value={`${fmtNum(r.value!, 2)} %`} criteria="98,0 – 102,0 %" status={r.value! >= 98 && r.value! <= 102 ? 'pass' : 'fail'} />
          ))}
        </div>
      )}

      {rationaleSteps.length > 0 && (
        <div className="bg-card border rounded-xl p-6">
          <CalculationRationale title="Racional: Robustez" steps={rationaleSteps} />
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2"><FileDown className="w-4 h-4" /> Exportar</Button>
      </div>
    </div>
  );
}
