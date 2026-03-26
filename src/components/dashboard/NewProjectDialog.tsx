import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function NewProjectDialog() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const id = `VAL-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 999)).padStart(3, '0')}`;
    setOpen(false);
    navigate(`/projeto/${id}`, {
      state: {
        produto: formData.get('produto'),
        analitos: (formData.get('analitos') as string)?.split(',').map(s => s.trim()),
        pr: formData.get('pr'),
        colunaHPLC: formData.get('colunaHPLC'),
        doseNominal: formData.get('doseNominal'),
        pesoMedio: formData.get('pesoMedio'),
        responsavelFMT: formData.get('responsavelFMT'),
        responsavelDA: formData.get('responsavelDA'),
        autores: (formData.get('autores') as string)?.split(',').map(s => s.trim()),
        dataInicio: formData.get('dataInicio'),
        dataFinalizacao: formData.get('dataFinalizacao'),
      }
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="lg" className="gap-2">
          <Plus className="w-4 h-4" />
          Novo Projeto
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Novo Projeto de Validação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-6 mt-2">
          {/* Informações do Produto */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Informações do Produto</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="produto">Produto *</Label>
                <Input id="produto" name="produto" placeholder="Ex: Losartana Potássica 50mg" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pr">PR *</Label>
                <Input id="pr" name="pr" placeholder="Ex: PR-4521" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="analitos">Analito(s) *</Label>
                <Input id="analitos" name="analitos" placeholder="Separar por vírgula" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="colunaHPLC">Coluna HPLC *</Label>
                <Input id="colunaHPLC" name="colunaHPLC" placeholder="Ex: C18 250x4.6mm 5μm" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doseNominal">Dose Nominal *</Label>
                <Input id="doseNominal" name="doseNominal" placeholder="Ex: 50 mg" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="pesoMedio">Peso Médio *</Label>
                <Input id="pesoMedio" name="pesoMedio" placeholder="Ex: 200.5 mg" required />
              </div>
            </div>
          </div>

          {/* Responsáveis */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Responsáveis</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="responsavelFMT">Responsável FMT *</Label>
                <Input id="responsavelFMT" name="responsavelFMT" placeholder="Nome do responsável" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="responsavelDA">Responsável D.A *</Label>
                <Input id="responsavelDA" name="responsavelDA" placeholder="Nome do responsável" required />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label htmlFor="autores">Autor(es) *</Label>
                <Input id="autores" name="autores" placeholder="Separar por vírgula" required />
              </div>
            </div>
          </div>

          {/* Datas */}
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3">Datas</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataInicio">Data de Início</Label>
                <Input id="dataInicio" name="dataInicio" type="date" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dataFinalizacao">Data de Finalização</Label>
                <Input id="dataFinalizacao" name="dataFinalizacao" type="date" />
              </div>
            </div>
          </div>

          <Button type="submit" className="w-full">Criar Projeto</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
