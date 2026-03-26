import { Project } from '@/lib/types';
import { StatusBadge } from '@/components/dashboard/StatusBadge';
import { ArrowLeft, Paperclip } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface Props {
  project: Project;
}

export function ProjectHeader({ project }: Props) {
  const navigate = useNavigate();

  const fields = [
    { label: 'ID', value: project.id },
    { label: 'PR', value: project.pr },
    { label: 'Produto', value: project.produto },
    { label: 'Analito(s)', value: project.analitos.join(', ') },
    { label: 'Coluna HPLC', value: project.colunaHPLC },
    { label: 'Dose Nominal', value: project.doseNominal },
    { label: 'Peso Médio', value: project.pesoMedio },
    { label: 'Resp. FMT', value: project.responsavelFMT },
    { label: 'Resp. D.A', value: project.responsavelDA },
    { label: 'Autor(es)', value: project.autores.join(', ') },
  ];

  return (
    <div className="sticky top-0 z-30 bg-card border-b shadow-sm">
      <div className="container max-w-6xl mx-auto px-6">
        {/* Top row */}
        <div className="flex items-center justify-between py-3 border-b">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={() => navigate('/')}>
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div>
              <h1 className="text-lg font-bold text-foreground">{project.produto}</h1>
              <p className="text-xs text-muted-foreground font-mono">{project.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge status={project.status} />
            <Button variant="outline" size="sm" className="gap-1.5">
              <Paperclip className="w-3.5 h-3.5" />
              Anexos
            </Button>
          </div>
        </div>

        {/* Info grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-x-6 gap-y-2 py-3 text-sm">
          {fields.map(f => (
            <div key={f.label}>
              <span className="text-muted-foreground text-xs">{f.label}</span>
              <p className="font-medium text-foreground truncate">{f.value || '—'}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
