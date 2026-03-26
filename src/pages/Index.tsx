import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { NewProjectDialog } from '@/components/dashboard/NewProjectDialog';
import { mockProjects } from '@/lib/mock-data';
import { ProjectStatus } from '@/lib/types';
import { Search, FlaskConical } from 'lucide-react';

const statusFilters: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos' },
  { value: 'active', label: 'Em andamento' },
  { value: 'review', label: 'Em revisão' },
  { value: 'done', label: 'Finalizado' },
];

export default function Dashboard() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<ProjectStatus | 'all'>('all');

  const filtered = mockProjects.filter(p => {
    const matchesSearch = !search ||
      p.produto.toLowerCase().includes(search.toLowerCase()) ||
      p.analitos.some(a => a.toLowerCase().includes(search.toLowerCase())) ||
      p.responsavelFMT.toLowerCase().includes(search.toLowerCase()) ||
      p.id.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary flex items-center justify-center">
              <FlaskConical className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground tracking-tight">ValAnalítica</h1>
              <p className="text-xs text-muted-foreground">Sistema de Validação Analítica</p>
            </div>
          </div>
          <NewProjectDialog />
        </div>
      </header>

      {/* Content */}
      <main className="container max-w-6xl mx-auto px-6 py-8">
        {/* Search & Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por produto, analito, responsável ou ID..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-1.5">
            {statusFilters.map(f => (
              <button
                key={f.value}
                onClick={() => setStatusFilter(f.value)}
                className={`px-3 py-2 text-sm rounded-md transition-colors ${
                  statusFilter === f.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-accent'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <FlaskConical className="w-12 h-12 mx-auto mb-3 opacity-30" />
            <p className="text-lg font-medium">Nenhum projeto encontrado</p>
            <p className="text-sm mt-1">Tente ajustar os filtros ou criar um novo projeto.</p>
          </div>
        )}
      </main>
    </div>
  );
}
