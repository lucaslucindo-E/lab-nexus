import { Project } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { FlaskConical, Calendar, User, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import logoAppval from '@/assets/logo-appval.png';

export function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-0.5 group"
      onClick={() => navigate(`/projeto/${project.id}`)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
              <img src={logoAppval} alt="" className="w-6 h-6 object-contain" />
            </div>
            <div>
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">
                {project.produto}
              </h3>
              <p className="text-xs text-muted-foreground font-mono mt-0.5">
                {project.id}
                {project.pr && <> • PR: {project.pr}</>}
              </p>
            </div>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="space-y-1.5 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-3.5 h-3.5 flex-shrink-0" />
            <span className="truncate">{project.analitos.join(', ')}</span>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t flex items-center justify-between">
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {project.dataInicio ? new Date(project.dataInicio).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: '2-digit' }) : '—'}
            </span>
            <span className="flex items-center gap-1">
              <User className="w-3 h-3" />
              {project.responsavelFMT}
            </span>
          </div>
          <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors" />
        </div>
      </CardContent>
    </Card>
  );
}
