import { useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'

export function VehicleModal({ onSaved }: { onSaved?: (vehicle: any) => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()
  const [data, setData] = useState({
    plate: '',
    chassis: '',
    version: '',
    manufacturing_year: '',
    model_year: '',
  })

  const save = async () => {
    setLoading(true)
    const { data: v, error } = await supabase
      .from('vehicles')
      .insert({
        plate: data.plate,
        chassis: data.chassis,
        version: data.version,
        manufacturing_year: parseInt(data.manufacturing_year) || null,
        model_year: parseInt(data.model_year) || null,
      })
      .select()
      .single()

    setLoading(false)
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Veículo salvo!' })
      setOpen(false)
      onSaved?.(v)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="icon" title="Cadastrar Veículo">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Veículo Rápido</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 pt-4">
          <div>
            <Label>Placa</Label>
            <Input
              className="uppercase"
              value={data.plate}
              onChange={(e) => setData({ ...data, plate: e.target.value })}
            />
          </div>
          <div>
            <Label>Chassi (VIN)</Label>
            <Input
              value={data.chassis}
              onChange={(e) => setData({ ...data, chassis: e.target.value })}
            />
          </div>
          <div>
            <Label>Versão</Label>
            <Input
              value={data.version}
              onChange={(e) => setData({ ...data, version: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Ano Fabricação</Label>
              <Input
                type="number"
                value={data.manufacturing_year}
                onChange={(e) => setData({ ...data, manufacturing_year: e.target.value })}
              />
            </div>
            <div>
              <Label>Ano Modelo</Label>
              <Input
                type="number"
                value={data.model_year}
                onChange={(e) => setData({ ...data, model_year: e.target.value })}
              />
            </div>
          </div>
          <Button className="w-full" onClick={save} disabled={loading || !data.plate}>
            Salvar Veículo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
