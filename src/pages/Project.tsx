import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProjectHeader } from '@/components/project/ProjectHeader';
import { LinearidadeTab } from '@/components/project/tabs/LinearidadeTab';
import { PrecisaoTab } from '@/components/project/tabs/PrecisaoTab';
import { ExatidaoEstoqueTab } from '@/components/project/tabs/ExatidaoEstoqueTab';
import { ExatidaoPesadaTab } from '@/components/project/tabs/ExatidaoPesadaTab';
import { EstabilidadeTab } from '@/components/project/tabs/EstabilidadeTab';
import { AvaliacaoFiltroTab } from '@/components/project/tabs/AvaliacaoFiltroTab';
import { RobustezTab } from '@/components/project/tabs/RobustezTab';

import { mockProjects } from '@/lib/mock-data';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { Project } from '@/lib/types';

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
  const found = mockProjects.find(p => p.id === id);
  const [project, setProject] = useState<Project>(found || {
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
  });

  return (
    <div className="min-h-screen bg-background">
      <ProjectHeader project={project} onEdit={setProject} />

      <main className="container max-w-6xl mx-auto px-6 py-6">
        <Tabs defaultValue="linearidade">
          <TabsList className="mb-6 flex flex-wrap h-auto gap-1 bg-muted p-1 rounded-lg">
            {tabs.map(tab => (
              <TabsTrigger key={tab.value} value={tab.value} className="text-sm data-[state=active]:bg-card data-[state=active]:shadow-sm">
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value="avaliacao-filtro"><AvaliacaoFiltroTab /></TabsContent>
          <TabsContent value="estabilidade"><EstabilidadeTab /></TabsContent>
          <TabsContent value="exatidao-estoque"><ExatidaoEstoqueTab /></TabsContent>
          <TabsContent value="exatidao-pesada"><ExatidaoPesadaTab /></TabsContent>
          <TabsContent value="linearidade"><LinearidadeTab /></TabsContent>
          <TabsContent value="precisao"><PrecisaoTab /></TabsContent>
          <TabsContent value="robustez"><RobustezTab /></TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
