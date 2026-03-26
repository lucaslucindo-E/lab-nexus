import { Project } from '@/lib/types';
import { StatusBadge } from './StatusBadge';
import { Card, CardContent } from '@/components/ui/card';
import { FlaskConical, Calendar, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function ProjectCard({ project }: { project: Project }) {
  const navigate = useNavigate();

  return (
    <Card
      className="cursor-pointer transition-all hover:shadow-md hover:border-primary/30 group"
      onClick={() => navigate(`/projeto/${project.id}`)}
    >
      <CardContent className="p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-muted-foreground font-mono">{project.id}</p>
            <h3 className="font-semibold text-foreground mt-0.5 group-hover:text-primary transition-colors">
              {project.produto}
            </h3>
          </div>
          <StatusBadge status={project.status} />
        </div>

        <div className="space-y-2 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <FlaskConical className="w-3.5 h-3.5" />
            <span>{project.analitos.join(', ')}</span>
          </div>
          <div className="flex items-center gap-2">
            <User className="w-3.5 h-3.5" />
            <span>{project.responsavelFMT}</span>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-3.5 h-3.5" />
            <span>{new Date(project.updatedAt).toLocaleDateString('pt-BR')}</span>
          </div>
        </div>

        <div className="mt-3 pt-3 border-t flex items-center gap-2">
          <span className="text-xs text-muted-foreground">PR: {project.pr}</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{project.colunaHPLC}</span>
        </div>
      </CardContent>
    </Card>
  );
}
