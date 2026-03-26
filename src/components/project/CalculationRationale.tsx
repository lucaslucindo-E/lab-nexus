interface Step {
  label: string;
  formula: string;
  substitution?: string;
  result?: string;
}

interface Props {
  title: string;
  steps: Step[];
}

export function CalculationRationale({ title, steps }: Props) {
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground text-sm">{title}</h3>
      <div className="space-y-0">
        {steps.map((step, i) => (
          <div key={i} className="calc-step" data-step={i + 1}>
            <p className="text-sm font-medium text-foreground mb-1">{step.label}</p>
            <div className="calc-formula">{step.formula}</div>
            {step.substitution && (
              <div className="calc-formula mt-1.5 text-muted-foreground">{step.substitution}</div>
            )}
            {step.result && (
              <p className="mt-1.5 text-sm font-bold" style={{ color: 'hsl(var(--success))' }}>
                = {step.result}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
