import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { ProjectCard } from '@/components/dashboard/ProjectCard';
import { NewProjectDialog } from '@/components/dashboard/NewProjectDialog';
import { mockProjects } from '@/lib/mock-data';
import { ProjectStatus } from '@/lib/types';
import { Search, FlaskConical, LayoutDashboard, FolderOpen } from 'lucide-react';
import logoAppval from '@/assets/logo-appval.png';

const statusFilters: { value: ProjectStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Todos os Status' },
  { value: 'not_started', label: 'Não Iniciado' },
  { value: 'active', label: 'Em Andamento' },
  { value: 'correction', label: 'Em Correção' },
  { value: 'review', label: 'Revisão' },
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
      {/* Navbar */}
      <header className="border-b bg-card shadow-sm">
        <div className="container max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center overflow-hidden">
              <img src={logoAppval} alt="AppVal" className="w-7 h-7 object-contain" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">AppVal</h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Validação Analítica</p>
            </div>
          </div>
          <nav className="flex items-center gap-1">
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent transition-colors">
              <FolderOpen className="w-4 h-4" /> Projetos
            </button>
          </nav>
        </div>
      </header>

      <main className="container max-w-7xl mx-auto px-6 py-8">
        {/* Page title */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Projetos de Validação</h2>
            <p className="text-sm text-muted-foreground mt-1">Gerencie suas validações analíticas com rastreabilidade e confiança.</p>
          </div>
          <NewProjectDialog />
        </div>

        {/* Search + Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por produto, ID ou analito..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value as ProjectStatus | 'all')}
          >
            {statusFilters.map(f => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>

        {/* Project Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
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
