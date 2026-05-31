import React, { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

export function VehicleFormModal({ isOpen, onClose, onSuccess }: any) {
  const [formData, setFormData] = useState({
    plate: '',
    chassis: '',
    brand_id: '',
    model_id: '',
    version: '',
    manufacturing_year: '',
    model_year: '',
  })
  const [brands, setBrands] = useState<any[]>([])
  const [models, setModels] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchBrands()
  }, [])

  useEffect(() => {
    if (formData.brand_id) {
      fetchModels(formData.brand_id)
    } else {
      setModels([])
    }
  }, [formData.brand_id])

  const fetchBrands = async () => {
    const { data } = await supabase.from('vehicle_brands').select('*').order('name')
    setBrands(data || [])
  }

  const fetchModels = async (brandId: string) => {
    const { data } = await supabase
      .from('vehicle_models')
      .select('*')
      .eq('brand_id', brandId)
      .order('name')
    setModels(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('vehicles')
        .insert([
          {
            plate: formData.plate.toUpperCase(),
            chassis: formData.chassis,
            brand_id: formData.brand_id,
            model_id: formData.model_id,
            version: formData.version,
            manufacturing_year: formData.manufacturing_year
              ? parseInt(formData.manufacturing_year)
              : null,
            model_year: formData.model_year ? parseInt(formData.model_year) : null,
          },
        ])
        .select()
        .single()

      if (error) throw error
      toast({ title: 'Sucesso', description: 'Veículo cadastrado.' })
      onSuccess(data.id)
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Novo Veículo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Placa *</Label>
              <Input
                required
                value={formData.plate}
                onChange={(e) => setFormData((p) => ({ ...p, plate: e.target.value }))}
                placeholder="ABC1D23"
              />
            </div>
            <div className="space-y-2">
              <Label>Chassi</Label>
              <Input
                value={formData.chassis}
                onChange={(e) => setFormData((p) => ({ ...p, chassis: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Marca *</Label>
              <Select
                required
                value={formData.brand_id}
                onValueChange={(v) => setFormData((p) => ({ ...p, brand_id: v, model_id: '' }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
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
              <Label>Modelo *</Label>
              <Select
                required
                value={formData.model_id}
                onValueChange={(v) => setFormData((p) => ({ ...p, model_id: v }))}
                disabled={!formData.brand_id}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
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
              value={formData.version}
              onChange={(e) => setFormData((p) => ({ ...p, version: e.target.value }))}
              placeholder="Ex: 1.0 Flex"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Ano Fabricação</Label>
              <Input
                type="number"
                value={formData.manufacturing_year}
                onChange={(e) => setFormData((p) => ({ ...p, manufacturing_year: e.target.value }))}
              />
            </div>
            <div className="space-y-2">
              <Label>Ano Modelo</Label>
              <Input
                type="number"
                value={formData.model_year}
                onChange={(e) => setFormData((p) => ({ ...p, model_year: e.target.value }))}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              Salvar
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
