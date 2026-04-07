import { Project } from '@/lib/types';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { EditProjectDialog } from '@/components/dashboard/EditProjectDialog';
import { Paperclip } from 'lucide-react';
import { Button } from '@/components/ui/button';
import logoAppval from '@/assets/logo-appval.png';

interface Props {
  project: Project;
  onEdit?: (updated: Project) => void;
}

export function ProjectHeader({ project, onEdit }: Props) {
  const infoFields = [
    [
      { label: 'ID', value: project.id },
      { label: 'PR', value: project.pr },
      { label: 'Coluna HPLC', value: project.colunaHPLC },
      { label: 'Dose Nominal', value: project.doseNominal },
    ],
    [
      { label: 'Peso Médio', value: project.pesoMedio },
      { label: 'Resp. FMT', value: project.responsavelFMT },
      { label: 'Resp. D.A', value: project.responsavelDA },
      { label: 'Período', value: formatPeriodo(project.dataInicio, project.dataFinalizacao) },
    ],
    [
      { label: 'Autores', value: project.autores.join(', ') },
    ],
  ];

  return (
    <div className="container max-w-7xl mx-auto px-6">
      <div className="bg-card border rounded-xl p-6">
        {/* Title row */}
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
              <img src={logoAppval} alt="" className="w-8 h-8 object-contain" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-foreground">{project.produto}</h2>
              <p className="text-sm text-muted-foreground mt-0.5">{project.analitos.join(', ')}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={project.status} />
            {onEdit && <EditProjectDialog project={project} onSave={onEdit} />}
          </div>
        </div>

        {/* Info grid */}
        <div className="space-y-3">
          {infoFields.map((row, ri) => (
            <div key={ri} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {row.map(f => (
                <div key={f.label} className="bg-muted/50 rounded-lg px-4 py-2.5">
                  <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">{f.label}</span>
                  <p className="text-sm font-medium text-foreground mt-0.5 truncate">{f.value || '—'}</p>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function formatPeriodo(inicio?: string, fim?: string) {
  const fmt = (d: string) => d ? new Date(d).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '';
  const i = fmt(inicio || '');
  const f = fmt(fim || '');
  if (i && f) return `📅 ${i} — ${f}`;
  if (i) return `📅 ${i}`;
  return '—';
}
