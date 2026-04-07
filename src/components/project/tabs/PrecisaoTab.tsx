import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { ResultIndicator } from '@/components/project/ResultIndicator';
import { CalculationRationale } from '@/components/project/CalculationRationale';
import { fmtNum, stats, executeFormula, type FormulaDefinition } from '@/lib/calc-engine';
import { Calculator, RotateCcw, Plus, Trash2, FileDown } from 'lucide-react';

const formulaTeor: FormulaDefinition = {
  id: 'teor',
  nome: 'Teor (mg/mL)',
  formula: '(area_amostra / area_padrao) * conc_padrao',
  variaveis: { area_amostra: 'Área Amostra', area_padrao: 'Área Padrão', conc_padrao: 'Conc. Padrão' },
  unidade: 'mg/mL',
};

interface PrecisionSection {
  label: string;
  padrao: { massa: string; volBalao: string; potencia: string; aliquota: string; volFinal: string };
  rows: { areaAmostra: string; areaPadrao: string }[];
}

const emptyPadrao = { massa: '', volBalao: '', potencia: '', aliquota: '', volFinal: '' };

export function PrecisaoTab() {
  const [repetibilidade, setRepetibilidade] = useState<PrecisionSection>({
    label: 'Repetibilidade',
    padrao: { ...emptyPadrao },
    rows: Array(6).fill(null).map(() => ({ areaAmostra: '', areaPadrao: '' })),
  });

  const [intermediaria, setIntermediaria] = useState<PrecisionSection>({
    label: 'Precisão Intermediária',
    padrao: { ...emptyPadrao },
    rows: Array(6).fill(null).map(() => ({ areaAmostra: '', areaPadrao: '' })),
  });

  const [calculated, setCalculated] = useState(false);

  const calcSection = (section: PrecisionSection) => {
    const p = section.padrao;
    const m = Number(p.massa), vb = Number(p.volBalao), pot = Number(p.potencia), al = Number(p.aliquota), vf = Number(p.volFinal);
    const concPadrao = (m && vb && pot && al && vf) ? ((m * pot) / vb) * (al / vf) : null;

    const teores: { value: number; substitution: string }[] = [];
    for (const row of section.rows) {
      const aa = Number(row.areaAmostra), ap = Number(row.areaPadrao);
      if (!aa || !ap || isNaN(aa) || isNaN(ap)) continue;
      const cp = concPadrao || 1;
      const r = executeFormula(formulaTeor.formula, { area_amostra: aa, area_padrao: ap, conc_padrao: cp });
      teores.push(r);
    }

    if (teores.length === 0) return null;
    const values = teores.map(t => t.value);
    return { teores, values, media: stats.media(values), dp: stats.desvio_padrao(values), rsd: stats.rsd(values), concPadrao };
  };

  const repResult = useMemo(() => calculated ? calcSection(repetibilidade) : null, [calculated, repetibilidade]);
  const intResult = useMemo(() => calculated ? calcSection(intermediaria) : null, [calculated, intermediaria]);

  const renderSection = (
    section: PrecisionSection,
    setter: React.Dispatch<React.SetStateAction<PrecisionSection>>,
    result: ReturnType<typeof calcSection>,
    icon: string
  ) => (
    <div className="bg-card border rounded-xl p-6">
      <h3 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
        <span>{icon}</span> {section.label}
      </h3>

      {/* Solução Padrão */}
      <div className="mb-4">
        <span className="text-xs font-semibold text-primary uppercase tracking-wider">Solução Padrão</span>
        <div className="grid grid-cols-5 gap-3 mt-2">
          {[
            { key: 'massa' as const, label: 'Massa (mg)' },
            { key: 'volBalao' as const, label: 'Vol. Balão (mL)' },
            { key: 'potencia' as const, label: 'Potência (%)' },
            { key: 'aliquota' as const, label: 'Alíquota (mL)' },
            { key: 'volFinal' as const, label: 'Vol. Final (mL)' },
          ].map(f => (
            <div key={f.key}>
              <Label className="text-[10px] uppercase tracking-wider text-muted-foreground">{f.label}</Label>
              <Input
                type="number"
                step="0.001"
                value={section.padrao[f.key]}
                onChange={e => { setter(prev => ({ ...prev, padrao: { ...prev.padrao, [f.key]: e.target.value } })); setCalculated(false); }}
                className="h-8 mt-1"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Replicatas */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b">
            <th className="text-left py-2 text-[10px] font-semibold text-muted-foreground uppercase w-40">Área Amostra</th>
            <th className="text-left py-2 text-[10px] font-semibold text-muted-foreground uppercase w-40">Área Padrão</th>
            <th className="text-right py-2 text-[10px] font-semibold text-muted-foreground uppercase">Teor (mg/mL)</th>
            <th className="w-8"></th>
          </tr>
        </thead>
        <tbody>
          {section.rows.map((r, i) => {
            const teor = result?.teores[i];
            return (
              <tr key={i} className="border-b border-border/50">
                <td className="py-1.5 pr-2">
                  <Input type="number" value={r.areaAmostra} onChange={e => { setter(prev => { const rows = [...prev.rows]; rows[i] = { ...rows[i], areaAmostra: e.target.value }; return { ...prev, rows }; }); setCalculated(false); }} className="h-8 text-xs" />
                </td>
                <td className="py-1.5 pr-2">
                  <Input type="number" value={r.areaPadrao} onChange={e => { setter(prev => { const rows = [...prev.rows]; rows[i] = { ...rows[i], areaPadrao: e.target.value }; return { ...prev, rows }; }); setCalculated(false); }} className="h-8 text-xs" />
                </td>
                <td className="py-1.5 text-right font-mono text-xs font-medium text-foreground">
                  {teor ? fmtNum(teor.value) : <span className="text-muted-foreground">—</span>}
                </td>
                <td className="py-1.5">
                  <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => {
                    if (section.rows.length <= 2) return;
                    setter(prev => ({ ...prev, rows: prev.rows.filter((_, idx) => idx !== i) }));
                    setCalculated(false);
                  }} disabled={section.rows.length <= 2}>
                    <Trash2 className="w-3 h-3 text-muted-foreground" />
                  </Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <Button variant="ghost" size="sm" onClick={() => { setter(prev => ({ ...prev, rows: [...prev.rows, { areaAmostra: '', areaPadrao: '' }] })); setCalculated(false); }} className="mt-2 gap-1.5 text-xs">
        <Plus className="w-3.5 h-3.5" /> Adicionar Linha
      </Button>

      {/* Results */}
      {result && (
        <div className="grid grid-cols-3 gap-3 mt-4">
          <ResultIndicator label="Média" value={fmtNum(result.media)} criteria="—" status="pass" />
          <ResultIndicator label="DP" value={fmtNum(result.dp)} criteria="—" status="pass" />
          <ResultIndicator label="%RSD" value={`${fmtNum(result.rsd)} %`} criteria="≤ 2,0 %" status={result.rsd <= 2 ? 'pass' : 'fail'} />
        </div>
      )}
    </div>
  );

  const rationaleSteps = useMemo(() => {
    const steps: { label: string; formula: string; substitution?: string; result?: string }[] = [];
    if (repResult) {
      repResult.teores.forEach((t, i) => steps.push({ label: `Rep. Teor ${i + 1}`, formula: formulaTeor.formula, substitution: t.substitution, result: fmtNum(t.value) }));
      steps.push({ label: 'Repetibilidade %RSD', formula: '(DP / Média) × 100', result: `${fmtNum(repResult.rsd)} %` });
    }
    if (intResult) {
      intResult.teores.forEach((t, i) => steps.push({ label: `Int. Teor ${i + 1}`, formula: formulaTeor.formula, substitution: t.substitution, result: fmtNum(t.value) }));
      steps.push({ label: 'Intermediária %RSD', formula: '(DP / Média) × 100', result: `${fmtNum(intResult.rsd)} %` });
    }
    return steps;
  }, [repResult, intResult]);

  return (
    <div className="space-y-6">
      {renderSection(repetibilidade, setRepetibilidade, repResult, '🔁')}
      {renderSection(intermediaria, setIntermediaria, intResult, '🔄')}

      <div className="flex gap-3">
        <Button onClick={() => setCalculated(true)} className="gap-2"><Calculator className="w-4 h-4" /> Calcular</Button>
        <Button variant="outline" onClick={() => { setRepetibilidade({ label: 'Repetibilidade', padrao: { ...emptyPadrao }, rows: Array(6).fill(null).map(() => ({ areaAmostra: '', areaPadrao: '' })) }); setIntermediaria({ label: 'Precisão Intermediária', padrao: { ...emptyPadrao }, rows: Array(6).fill(null).map(() => ({ areaAmostra: '', areaPadrao: '' })) }); setCalculated(false); }} className="gap-2"><RotateCcw className="w-4 h-4" /> Resetar</Button>
      </div>

      {rationaleSteps.length > 0 && (
        <div className="bg-card border rounded-xl p-6">
          <CalculationRationale title="Racional: Precisão" steps={rationaleSteps} />
        </div>
      )}

      <div className="flex justify-end">
        <Button variant="outline" className="gap-2"><FileDown className="w-4 h-4" /> Exportar</Button>
      </div>
    </div>
  );
}
