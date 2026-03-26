import { ProjectStatus } from '@/lib/types';

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  not_started: { label: 'Não iniciado', className: 'status-badge status-not-started' },
  active: { label: 'Em andamento', className: 'status-badge status-active' },
  correction: { label: 'Em correção', className: 'status-badge status-correction' },
  review: { label: 'Em revisão', className: 'status-badge status-review' },
  done: { label: 'Finalizado', className: 'status-badge status-done' },
};

export function StatusBadge({ status }: { status: ProjectStatus }) {
  const config = statusConfig[status];
  return (
    <span className={config.className}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {config.label}
    </span>
  );
}
