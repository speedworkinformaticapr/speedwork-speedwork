import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { EvaluationFormData } from '@/lib/evaluation-scoring'
import { formatCnpj, formatPhone, sanitizeCnpj } from '@/lib/evaluation-scoring'
import { ArrowRight, ArrowLeft, Building2 } from 'lucide-react'

interface Props {
  formData: EvaluationFormData
  updateField: (field: keyof EvaluationFormData, value: any) => void
  onNext: () => void
  onBack: () => void
  onCnpjBlur: () => void
}

export function IdentificationStep({ formData, updateField, onNext, onBack, onCnpjBlur }: Props) {
  const isValid =
    formData.nome_empresa &&
    sanitizeCnpj(formData.cnpj).length === 14 &&
    formData.email_corporativo &&
    formData.telefone_whatsapp &&
    formData.nome_contato &&
    formData.cargo_contato &&
    formData.porte_empresa

  return (
    <div className="space-y-5 animate-fade-in">
      <div className="flex items-center gap-2 text-primary">
        <Building2 className="w-5 h-5" />
        <h2 className="text-xl font-semibold">Identificação da Empresa</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <Label>Nome da Empresa *</Label>
          <Input
            value={formData.nome_empresa}
            onChange={(e) => updateField('nome_empresa', e.target.value)}
            placeholder="Empresa Ltda"
          />
        </div>
        <div className="space-y-2">
          <Label>CNPJ *</Label>
          <Input
            value={formData.cnpj}
            onChange={(e) => updateField('cnpj', formatCnpj(e.target.value))}
            onBlur={onCnpjBlur}
            placeholder="00.000.000/0000-00"
          />
        </div>
        <div className="space-y-2">
          <Label>Email Corporativo *</Label>
          <Input
            type="email"
            value={formData.email_corporativo}
            onChange={(e) => updateField('email_corporativo', e.target.value)}
            placeholder="contato@empresa.com"
          />
        </div>
        <div className="space-y-2">
          <Label>Telefone / WhatsApp *</Label>
          <Input
            value={formData.telefone_whatsapp}
            onChange={(e) => updateField('telefone_whatsapp', formatPhone(e.target.value))}
            placeholder="(11) 99999-9999"
          />
        </div>
        <div className="space-y-2">
          <Label>Nome do Contato *</Label>
          <Input
            value={formData.nome_contato}
            onChange={(e) => updateField('nome_contato', e.target.value)}
            placeholder="João Silva"
          />
        </div>
        <div className="space-y-2">
          <Label>Cargo *</Label>
          <Input
            value={formData.cargo_contato}
            onChange={(e) => updateField('cargo_contato', e.target.value)}
            placeholder="Diretor de TI"
          />
        </div>
        <div className="space-y-2">
          <Label>Porte da Empresa *</Label>
          <Select
            value={formData.porte_empresa}
            onValueChange={(v) => updateField('porte_empresa', v)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="Micro">Micro</SelectItem>
              <SelectItem value="Pequena">Pequena</SelectItem>
              <SelectItem value="Média">Média</SelectItem>
              <SelectItem value="Grande">Grande</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Segmento de Atuação</Label>
          <Input
            value={formData.segmento_atuacao}
            onChange={(e) => updateField('segmento_atuacao', e.target.value)}
            placeholder="Ex: Varejo, Indústria, Serviços"
          />
        </div>
        <div className="space-y-2">
          <Label>Funcionários de TI</Label>
          <Input
            type="number"
            value={formData.funcionarios_ti}
            onChange={(e) => updateField('funcionarios_ti', e.target.value)}
            placeholder="Ex: 3"
          />
        </div>
      </div>

      <div className="flex justify-between pt-2">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" /> Voltar
        </Button>
        <Button onClick={onNext} disabled={!isValid}>
          Próximo <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
