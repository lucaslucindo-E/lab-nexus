import { useParams } from 'react-router-dom';
import { ProjectHeader } from '@/components/project/ProjectHeader';
import { LinearidadeTab } from '@/components/project/tabs/LinearidadeTab';
import { PlaceholderTab } from '@/components/project/tabs/PlaceholderTab';
import { mockProjects } from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

const tabs = [
  { value: 'avaliacao-filtro', label: 'Avaliação de Filtro' },
  { value: 'estabilidade', label: 'Estabilidade' },
  { value: 'exatidao-estoque', label: 'Exatidão - Estoque' },
  { value: 'exatidao-pesada', label: 'Exatidão - Pesada' },
  { value: 'linearidade', label: 'Linearidade' },
  { value: 'precisao', label: 'Precisão' },
  { value: 'robustez', label: 'Robustez' },
];

export default function ProjectPage() {
  const { id } = useParams();
  const project = mockProjects.find(p => p.id === id) || {
    id: id || 'VAL-NOVO',
    pr: '',
    produto: 'Novo Projeto',
    analitos: [],
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
  };

  return (
    <div className="min-h-screen bg-background">
      <ProjectHeader project={project} />

      <main className="container max-w-6xl mx-auto px-6 py-6">
        <Tabs defaultValue="linearidade">
          <TabsList className="mb-6 flex flex-wrap h-auto gap-1 bg-muted p-1 rounded-lg">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="linearidade">
            <LinearidadeTab />
          </TabsContent>

          {tabs.filter(t => t.value !== 'linearidade').map(tab => (
            <TabsContent key={tab.value} value={tab.value}>
              <PlaceholderTab name={tab.label} />
            </TabsContent>
          ))}
        </Tabs>
      </main>
    </div>
  );
}
