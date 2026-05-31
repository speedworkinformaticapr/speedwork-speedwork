import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Plus } from 'lucide-react'

export function VehicleQuickAdd({ onAdded }: { onAdded?: (vehicle: any) => void }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const [brands, setBrands] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])

  const [data, setData] = useState({
    plate: '',
    chassis: '',
    brand_id: '',
    model_id: '',
    version: '',
    manufacturing_year: '',
    model_year: '',
  })

  useEffect(() => {
    if (open) {
      supabase
        .from('vehicle_brands')
        .select('*')
        .order('name')
        .then(({ data }) => setBrands(data || []))
    }
  }, [open])

  const loadModels = async (brandId: string) => {
    setData((p) => ({ ...p, brand_id: brandId, model_id: '' }))
    const { data } = await supabase
      .from('vehicle_models')
      .select('*')
      .eq('brand_id', brandId)
      .order('name')
    setModels(data || [])
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      const { data: newVehicle, error } = await supabase
        .from('vehicles')
        .insert({
          plate: data.plate.toUpperCase(),
          chassis: data.chassis.toUpperCase(),
          brand_id: data.brand_id || null,
          model_id: data.model_id || null,
          version: data.version,
          manufacturing_year: parseInt(data.manufacturing_year) || null,
          model_year: parseInt(data.model_year) || null,
        })
        .select()
        .single()

      if (error) throw error

      toast({ title: 'Sucesso', description: 'Veículo cadastrado com sucesso.' })
      setOpen(false)
      if (onAdded) onAdded(newVehicle)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button type="button" variant="outline" size="icon" className="shrink-0">
          <Plus className="w-4 h-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastro Rápido de Veículo</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Placa</Label>
              <Input
                value={data.plate}
                onChange={(e) => setData((p) => ({ ...p, plate: e.target.value }))}
                className="uppercase"
              />
            </div>
            <div className="space-y-2">
              <Label>Chassi (VIN)</Label>
              <Input
                value={data.chassis}
                onChange={(e) => setData((p) => ({ ...p, chassis: e.target.value }))}
                className="uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Marca</Label>
              <Select value={data.brand_id} onValueChange={loadModels}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {brands.map((b) => (
                    <SelectItem key={b.id} value={b.id}>
                      {b.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Modelo</Label>
              <Select
                value={data.model_id}
                onValueChange={(v) => setData((p) => ({ ...p, model_id: v }))}
                disabled={!data.brand_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {models.map((m) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Versão</Label>
            <Input
              value={data.version}
              onChange={(e) => setData((p) => ({ ...p, version: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ano Fabricação</Label>
              <Input
                value={data.manufacturing_year}
                onChange={(e) => setData((p) => ({ ...p, manufacturing_year: e.target.value }))}
                type="number"
              />
            </div>
            <div className="space-y-2">
              <Label>Ano Modelo</Label>
              <Input
                value={data.model_year}
                onChange={(e) => setData((p) => ({ ...p, model_year: e.target.value }))}
                type="number"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={loading || !data.plate}>
            Salvar Veículo
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
