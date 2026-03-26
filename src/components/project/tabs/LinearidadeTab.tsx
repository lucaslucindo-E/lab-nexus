import { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { ResultIndicator } from '@/components/project/ResultIndicator';
import { CalculationRationale } from '@/components/project/CalculationRationale';
import { linearRegression, formatNumber } from '@/lib/calculations';
import { Calculator, RotateCcw } from 'lucide-react';

const defaultConcentrations = [50, 75, 100, 125, 150];
const defaultAreas = [
  [245310, 247120],
  [368200, 370015],
  [490150, 491800],
  [612400, 614100],
  [735600, 737250],
];

export function LinearidadeTab() {
  const [concentrations, setConcentrations] = useState<string[]>(
    defaultConcentrations.map(String)
  );
  const [areas, setAreas] = useState<string[][]>(
    defaultAreas.map(row => row.map(String))
  );
  const [observacoes, setObservacoes] = useState('');
  const [calculated, setCalculated] = useState(false);

  const result = useMemo(() => {
    if (!calculated) return null;
    const x = concentrations.map(Number).filter(n => !isNaN(n));
    const yMeans = areas.map(row => {
      const nums = row.map(Number).filter(n => !isNaN(n));
      return nums.reduce((a, b) => a + b, 0) / nums.length;
    });
    if (x.length < 3 || yMeans.length < 3) return null;
    return linearRegression(x, yMeans);
  }, [calculated, concentrations, areas]);

  const updateConcentration = (i: number, val: string) => {
    const next = [...concentrations];
    next[i] = val;
    setConcentrations(next);
    setCalculated(false);
  };

  const updateArea = (i: number, j: number, val: string) => {
    const next = areas.map(row => [...row]);
    next[i][j] = val;
    setAreas(next);
    setCalculated(false);
  };

  const reset = () => {
    setConcentrations(defaultConcentrations.map(String));
    setAreas(defaultAreas.map(row => row.map(String)));
    setCalculated(false);
    setObservacoes('');
  };

  const yMeans = areas.map(row => {
    const nums = row.map(Number).filter(n => !isNaN(n));
    return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
  });

  const rationaleSteps = result
    ? [
        {
          label: 'Médias das áreas (ȳ)',
          formula: 'ȳᵢ = (Área₁ + Área₂) / 2',
          substitution: yMeans.map((m, i) => `ȳ${i + 1} = ${formatNumber(m, 0)}`).join('  |  '),
        },
        {
          label: 'Média de X (concentrações)',
          formula: 'X̄ = Σxᵢ / n',
          substitution: `X̄ = (${concentrations.join(' + ')}) / ${concentrations.length}`,
          result: formatNumber(result.meanX, 2),
        },
        {
          label: 'Média de Y (áreas)',
          formula: 'Ȳ = Σȳᵢ / n',
          result: formatNumber(result.meanY, 2),
        },
        {
          label: 'Coeficiente angular (slope)',
          formula: 'b = Σ(xᵢ - X̄)(yᵢ - Ȳ) / Σ(xᵢ - X̄)²',
          substitution: `b = ${formatNumber(result.ssXY, 2)} / ${formatNumber(result.ssX, 2)}`,
          result: formatNumber(result.slope, 4),
        },
        {
          label: 'Intercepto',
          formula: 'a = Ȳ - b·X̄',
          substitution: `a = ${formatNumber(result.meanY, 2)} - ${formatNumber(result.slope, 4)} × ${formatNumber(result.meanX, 2)}`,
          result: formatNumber(result.intercept, 4),
        },
        {
          label: 'Coeficiente de correlação (r)',
          formula: 'r = Σ(xᵢ-X̄)(yᵢ-Ȳ) / √[Σ(xᵢ-X̄)² · Σ(yᵢ-Ȳ)²]',
          result: formatNumber(result.correlationCoef, 6),
        },
        {
          label: 'Coeficiente de determinação (r²)',
          formula: 'r² = r × r',
          result: formatNumber(result.rSquared, 6),
        },
      ]
    : [];

  return (
    <div className="space-y-8">
      {/* 1. INPUTS */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">1</span>
          Entrada de Dados
        </h2>
        <div className="bg-card border rounded-lg overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted">
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Nível</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Concentração (%)</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Área Rep. 1</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Área Rep. 2</th>
                <th className="text-left px-4 py-2.5 font-medium text-muted-foreground">Média</th>
              </tr>
            </thead>
            <tbody>
              {concentrations.map((c, i) => (
                <tr key={i} className="border-t">
                  <td className="px-4 py-2 text-muted-foreground font-mono text-xs">{i + 1}</td>
                  <td className="px-4 py-2">
                    <Input
                      type="number"
                      value={c}
                      onChange={e => updateConcentration(i, e.target.value)}
                      className="h-8 w-28"
                    />
                  </td>
                  {areas[i].map((a, j) => (
                    <td key={j} className="px-4 py-2">
                      <Input
                        type="number"
                        value={a}
                        onChange={e => updateArea(i, j, e.target.value)}
                        className="h-8 w-32"
                      />
                    </td>
                  ))}
                  <td className="px-4 py-2 font-mono text-foreground">
                    {formatNumber(yMeans[i], 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex gap-3 mt-4">
          <Button onClick={() => setCalculated(true)} className="gap-2">
            <Calculator className="w-4 h-4" />
            Calcular
          </Button>
          <Button variant="outline" onClick={reset} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Resetar
          </Button>
        </div>
      </section>

      {/* 2. RESULTS */}
      {result && (
        <section>
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">2</span>
            Resultados
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <ResultIndicator
              label="Coef. Correlação (r)"
              value={formatNumber(result.correlationCoef, 6)}
              criteria="≥ 0,990"
              status={Math.abs(result.correlationCoef) >= 0.99 ? 'pass' : 'fail'}
            />
            <ResultIndicator
              label="Coef. Determinação (r²)"
              value={formatNumber(result.rSquared, 6)}
              criteria="≥ 0,980"
              status={result.rSquared >= 0.98 ? 'pass' : 'fail'}
            />
            <ResultIndicator
              label="Slope (b)"
              value={formatNumber(result.slope, 4)}
              criteria="—"
              status="pass"
            />
            <ResultIndicator
              label="Intercepto (a)"
              value={formatNumber(result.intercept, 4)}
              criteria="—"
              status="pass"
            />
          </div>

          {/* Equation */}
          <div className="mt-4 p-4 bg-muted rounded-lg">
            <p className="text-sm text-muted-foreground mb-1">Equação da reta</p>
            <p className="text-lg font-mono font-bold text-foreground">
              y = {formatNumber(result.slope, 4)}x + {formatNumber(result.intercept, 4)}
            </p>
          </div>
        </section>
      )}

      {/* 3. RATIONALE */}
      {result && (
        <section>
          <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
            <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">3</span>
            Racional do Cálculo
          </h2>
          <div className="bg-card border rounded-lg p-6">
            <CalculationRationale
              title="Regressão Linear — Método dos Mínimos Quadrados"
              steps={rationaleSteps}
            />
          </div>
        </section>
      )}

      {/* 4. OBSERVATIONS */}
      <section>
        <h2 className="text-base font-semibold text-foreground mb-4 flex items-center gap-2">
          <span className="w-6 h-6 rounded bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">4</span>
          Observações e Anotações
        </h2>
        <div className="space-y-2">
          <Label htmlFor="obs">Comentários</Label>
          <Textarea
            id="obs"
            value={observacoes}
            onChange={e => setObservacoes(e.target.value)}
            placeholder="Adicione observações sobre esta análise..."
            rows={4}
          />
        </div>
      </section>
    </div>
  );
}
