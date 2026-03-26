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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Novo Projeto de Validação</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleCreate} className="space-y-4 mt-2">
          <div className="space-y-2">
            <Label htmlFor="produto">Produto</Label>
            <Input id="produto" name="produto" placeholder="Ex: Losartana Potássica 50mg" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="pr">PR</Label>
            <Input id="pr" name="pr" placeholder="Ex: PR-4521" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="analitos">Analito(s)</Label>
            <Input id="analitos" name="analitos" placeholder="Separar por vírgula" required />
          </div>
          <Button type="submit" className="w-full">Criar Projeto</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
