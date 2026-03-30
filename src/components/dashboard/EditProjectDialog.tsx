import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Pencil } from 'lucide-react';
import type { Project } from '@/lib/types';

interface Props {
  project: Project;
  onSave: (updated: Project) => void;
}

export function EditProjectDialog({ project, onSave }: Props) {
  const [open, setOpen] = useState(false);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    onSave({
      ...project,
      pr: (fd.get('pr') as string) || project.pr,
      produto: (fd.get('produto') as string) || project.produto,
      analitos: (fd.get('analitos') as string)?.split(',').map(s => s.trim()) || project.analitos,
      colunaHPLC: (fd.get('colunaHPLC') as string) || project.colunaHPLC,
      doseNominal: (fd.get('doseNominal') as string) || project.doseNominal,
      pesoMedio: (fd.get('pesoMedio') as string) || project.pesoMedio,
      responsavelFMT: (fd.get('responsavelFMT') as string) || project.responsavelFMT,
      responsavelDA: (fd.get('responsavelDA') as string) || project.responsavelDA,
      autores: (fd.get('autores') as string)?.split(',').map(s => s.trim()) || project.autores,
      dataInicio: (fd.get('dataInicio') as string) || project.dataInicio,
      dataFinalizacao: (fd.get('dataFinalizacao') as string) || project.dataFinalizacao,
      updatedAt: new Date().toISOString(),
    });
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-1.5">
          <Pencil className="w-3.5 h-3.5" />
          Editar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Projeto</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Informações do Produto</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="e-produto">Produto</Label><Input id="e-produto" name="produto" defaultValue={project.produto} /></div>
              <div className="space-y-2"><Label htmlFor="e-pr">PR</Label><Input id="e-pr" name="pr" defaultValue={project.pr} /></div>
              <div className="space-y-2"><Label htmlFor="e-analitos">Analito(s)</Label><Input id="e-analitos" name="analitos" defaultValue={project.analitos.join(', ')} /></div>
              <div className="space-y-2"><Label htmlFor="e-coluna">Coluna HPLC</Label><Input id="e-coluna" name="colunaHPLC" defaultValue={project.colunaHPLC} /></div>
              <div className="space-y-2"><Label htmlFor="e-dose">Dose Nominal</Label><Input id="e-dose" name="doseNominal" defaultValue={project.doseNominal} /></div>
              <div className="space-y-2"><Label htmlFor="e-peso">Peso Médio</Label><Input id="e-peso" name="pesoMedio" defaultValue={project.pesoMedio} /></div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Responsáveis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="e-fmt">Responsável FMT</Label><Input id="e-fmt" name="responsavelFMT" defaultValue={project.responsavelFMT} /></div>
              <div className="space-y-2"><Label htmlFor="e-da">Responsável D.A</Label><Input id="e-da" name="responsavelDA" defaultValue={project.responsavelDA} /></div>
              <div className="space-y-2 sm:col-span-2"><Label htmlFor="e-autores">Autor(es)</Label><Input id="e-autores" name="autores" defaultValue={project.autores.join(', ')} /></div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Datas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="e-inicio">Data de Início</Label><Input id="e-inicio" name="dataInicio" type="date" defaultValue={project.dataInicio?.split('T')[0]} /></div>
              <div className="space-y-2"><Label htmlFor="e-fim">Data de Finalização</Label><Input id="e-fim" name="dataFinalizacao" type="date" defaultValue={project.dataFinalizacao?.split('T')[0]} /></div>
            </div>
          </div>
          <Button type="submit" className="w-full">Salvar Alterações</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
