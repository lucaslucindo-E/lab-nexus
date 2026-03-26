import { ProjectStatus } from '@/lib/types';

const statusConfig: Record<ProjectStatus, { label: string; className: string }> = {
  active: { label: 'Em andamento', className: 'status-badge status-active' },
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
