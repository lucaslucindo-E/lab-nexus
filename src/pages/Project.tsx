import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ProjectHeader } from '@/components/project/ProjectHeader';
import { LinearidadeTab } from '@/components/project/tabs/LinearidadeTab';
import { PrecisaoTab } from '@/components/project/tabs/PrecisaoTab';
import { ExatidaoEstoqueTab } from '@/components/project/tabs/ExatidaoEstoqueTab';
import { ExatidaoPesadaTab } from '@/components/project/tabs/ExatidaoPesadaTab';
import { EstabilidadeTab } from '@/components/project/tabs/EstabilidadeTab';
import { AvaliacaoFiltroTab } from '@/components/project/tabs/AvaliacaoFiltroTab';
import { RobustezTab } from '@/components/project/tabs/RobustezTab';
import { mockProjects } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { ArrowLeft, FileText, Save, FlaskConical, Plus, LayoutDashboard, FolderOpen } from 'lucide-react';
import type { Project } from '@/lib/types';
import logoAppval from '@/assets/logo-appval.png';

const analysisTabs = [
  { value: 'avaliacao-filtro', label: 'Avaliação de Filtro', icon: '🧪' },
  { value: 'exatidao-estoque', label: 'Exatidão — Estoque', icon: '⚗️' },
  { value: 'exatidao-pesada', label: 'Exatidão — Pesada', icon: '⚖️' },
  { value: 'linearidade', label: 'Linearidade', icon: '📈' },
  { value: 'precisao', label: 'Precisão', icon: '🎯' },
  { value: 'robustez', label: 'Robustez', icon: '🔬' },
];

export default function ProjectPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const found = mockProjects.find(p => p.id === id);
  const [project, setProject] = useState<Project>(found || {
    id: id || 'VAL-NOVO',
    pr: '',
    produto: 'Novo Projeto',
    analitos: ['Analito 1'],
    colunaHPLC: '',
    doseNominal: '',
    pesoMedio: '',
    responsavelFMT: '',
    responsavelDA: '',
    autores: [],
    status: 'not_started' as const,
    dataInicio: '',
    dataFinalizacao: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  });

  const [activeAnalyte, setActiveAnalyte] = useState(0);
  const [activeTab, setActiveTab] = useState('avaliacao-filtro');

  const renderTab = () => {
    switch (activeTab) {
      case 'avaliacao-filtro': return <AvaliacaoFiltroTab />;
      case 'exatidao-estoque': return <ExatidaoEstoqueTab />;
      case 'exatidao-pesada': return <ExatidaoPesadaTab />;
      case 'linearidade': return <LinearidadeTab />;
      case 'precisao': return <PrecisaoTab />;
      case 'robustez': return <RobustezTab />;
      default: return <AvaliacaoFiltroTab />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Navbar */}
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
            <button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-muted-foreground hover:bg-accent transition-colors">
              <LayoutDashboard className="w-4 h-4" /> Dashboard
            </button>
            <button className="flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg bg-primary text-primary-foreground">
              <FolderOpen className="w-4 h-4" /> Projetos
            </button>
          </nav>
        </div>
      </header>

      {/* Back + Actions */}
      <div className="container max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft className="w-4 h-4" /> Voltar
        </button>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="sm" className="gap-2">
            <FileText className="w-4 h-4" /> Exportar PDF
          </Button>
          <Button size="sm" className="gap-2">
            <Save className="w-4 h-4" /> Salvar
          </Button>
        </div>
      </div>

      {/* Project Header */}
      <ProjectHeader project={project} onEdit={setProject} />

      {/* Analyte Tabs (Nível 2) */}
      <div className="container max-w-7xl mx-auto px-6 mt-6">
        <div className="bg-card border rounded-xl p-2 flex items-center gap-2 flex-wrap">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3">Analito:</span>
          {project.analitos.map((analito, i) => (
            <button
              key={i}
              onClick={() => setActiveAnalyte(i)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeAnalyte === i
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'text-muted-foreground hover:bg-accent'
              }`}
            >
              <FlaskConical className="w-3.5 h-3.5" />
              {analito}
            </button>
          ))}
          <button className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:bg-accent border border-dashed transition-colors">
            <Plus className="w-3.5 h-3.5" /> Analito
          </button>
        </div>
      </div>

      {/* Analysis Tabs (Nível 3) */}
      <div className="container max-w-7xl mx-auto px-6 mt-4">
        <div className="border-b flex items-center gap-0 overflow-x-auto">
          {analysisTabs.map(tab => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 transition-all ${
                activeTab === tab.value
                  ? 'border-primary text-primary'
                  : 'border-transparent text-muted-foreground hover:text-foreground hover:border-border'
              }`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab Content */}
      <main className="container max-w-7xl mx-auto px-6 py-6">
        {renderTab()}
      </main>
    </div>
  );
}
