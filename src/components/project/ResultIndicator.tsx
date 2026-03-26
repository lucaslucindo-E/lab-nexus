import { CheckCircle2, XCircle, AlertTriangle } from 'lucide-react';

type Status = 'pass' | 'fail' | 'warning';

interface Props {
  label: string;
  value: string;
  criteria: string;
  status: Status;
}

const icons = {
  pass: CheckCircle2,
  fail: XCircle,
  warning: AlertTriangle,
};

const classes = {
  pass: 'result-pass',
  fail: 'result-fail',
  warning: 'result-warning',
};

const colors = {
  pass: 'hsl(var(--success))',
  fail: 'hsl(var(--destructive))',
  warning: 'hsl(var(--warning))',
};

export function ResultIndicator({ label, value, criteria, status }: Props) {
  const Icon = icons[status];
  return (
    <div className={classes[status]}>
      <div className="flex items-center gap-2 mb-1">
        <Icon className="w-5 h-5" style={{ color: colors[status] }} />
        <span className="text-sm font-semibold text-foreground">{label}</span>
      </div>
      <p className="text-2xl font-bold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground mt-1">Critério: {criteria}</p>
    </div>
  );
}
