import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Search, UserPlus, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react'

export function StepClientAuth({ data, onChange, onBack, onNext }: any) {
  const { toast } = useToast()
  const [doc, setDoc] = useState(data.client?.cpf_cnpj || '')
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')

  const formatDoc = (v: string) => {
    const numbers = v.replace(/\D/g, '')
    if (numbers.length <= 11) {
      return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
    }
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})/, '$1.$2.$3/$4-$5')
  }

  const handleSearch = async () => {
    const cleanDoc = doc.replace(/\D/g, '')
    if (!cleanDoc) {
      toast({ title: 'Atenção', description: 'Digite o CPF ou CNPJ.', variant: 'destructive' })
      return
    }

    setLoading(true)
    const { data: profile } = await supabase
      .from('profiles')
      .select('id, name, email, phone, cpf_cnpj')
      .eq('cpf_cnpj', cleanDoc)
      .eq('is_client', true)
      .maybeSingle()

    if (profile) {
      onChange({ ...data, client: profile })
      setNotFound(false)
    } else {
      setNotFound(true)
      onChange({ ...data, client: null })
      toast({
        title: 'Não encontrado',
        description: 'Cliente não existe na base. Cadastre-o agora.',
        variant: 'default',
      })
    }
    setLoading(false)
  }

  const handleCreateClient = async () => {
    if (!name) {
      toast({ title: 'Atenção', description: 'O nome é obrigatório.', variant: 'destructive' })
      return
    }

    setLoading(true)
    const cleanDoc = doc.replace(/\D/g, '')
    const { data: newProfile, error } = await supabase
      .from('profiles')
      .insert({
        name,
        email,
        phone,
        cpf_cnpj: cleanDoc,
        is_client: true,
        role: 'client',
      })
      .select('id, name, email, phone, cpf_cnpj')
      .single()

    if (error) {
      toast({ title: 'Erro ao cadastrar', description: error.message, variant: 'destructive' })
    } else if (newProfile) {
      onChange({ ...data, client: newProfile })
      setNotFound(false)
      toast({ title: 'Sucesso', description: 'Cliente cadastrado e selecionado com sucesso.' })
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col h-full max-w-2xl mx-auto w-full">
      <div className="flex-1 space-y-8 pb-8">
        <div className="space-y-4 bg-card p-6 border rounded-2xl shadow-sm">
          <Label className="text-lg font-semibold">Documento do Cliente (CPF/CNPJ)</Label>
          <p className="text-sm text-muted-foreground">
            Informe o documento para resgatar os dados do cliente ou iniciar um novo cadastro.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Input
              value={doc}
              onChange={(e) => setDoc(formatDoc(e.target.value))}
              placeholder="000.000.000-00"
              className="h-14 text-lg font-medium tracking-wide"
              maxLength={18}
            />
            <Button
              size="lg"
              onClick={handleSearch}
              disabled={loading}
              className="shrink-0 h-14 px-8 text-base"
            >
              <Search className="w-5 h-5 mr-2" /> Buscar
            </Button>
          </div>
        </div>

        {data.client && !notFound && (
          <div className="p-6 border border-green-200 bg-green-50/50 dark:bg-green-950/10 rounded-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 shadow-sm">
            <div className="flex items-center gap-3 text-green-700 dark:text-green-500 border-b border-green-200/50 pb-4">
              <CheckCircle2 className="w-6 h-6" />
              <p className="font-bold text-xl">Cliente Identificado</p>
            </div>
            <div className="grid sm:grid-cols-2 gap-6">
              <div className="space-y-1">
                <p className="text-sm text-green-800/70 dark:text-green-400/70 font-medium uppercase tracking-wider">
                  Nome
                </p>
                <p className="font-semibold text-foreground text-lg">{data.client.name}</p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-green-800/70 dark:text-green-400/70 font-medium uppercase tracking-wider">
                  E-mail
                </p>
                <p className="font-medium text-foreground">
                  {data.client.email || 'Não informado'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-sm text-green-800/70 dark:text-green-400/70 font-medium uppercase tracking-wider">
                  Telefone
                </p>
                <p className="font-medium text-foreground">
                  {data.client.phone || 'Não informado'}
                </p>
              </div>
            </div>
          </div>
        )}

        {notFound && (
          <div className="p-8 border border-primary/20 bg-primary/5 rounded-2xl space-y-6 animate-in fade-in slide-in-from-bottom-4 shadow-sm">
            <div className="flex items-center gap-3 text-primary border-b border-primary/10 pb-4">
              <UserPlus className="w-6 h-6" />
              <p className="font-bold text-xl">Novo Cadastro de Cliente</p>
            </div>

            <div className="space-y-5 pt-2">
              <div className="space-y-2">
                <Label className="text-base">Nome Completo *</Label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-12 text-base"
                  placeholder="Digite o nome completo"
                />
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <Label className="text-base">E-mail</Label>
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    type="email"
                    className="h-12 text-base"
                    placeholder="exemplo@email.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-base">Telefone / WhatsApp</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="h-12 text-base"
                    placeholder="(00) 00000-0000"
                  />
                </div>
              </div>
              <Button
                size="lg"
                onClick={handleCreateClient}
                disabled={loading || !name}
                className="w-full mt-4 h-14 text-base shadow-sm"
              >
                Salvar Cadastro
              </Button>
            </div>
          </div>
        )}
      </div>

      <div className="mt-auto pt-6 border-t flex justify-between shrink-0 bg-background/95 backdrop-blur">
        <Button size="lg" variant="outline" onClick={onBack} className="shadow-sm">
          <ArrowLeft className="w-5 h-5 mr-2" /> Voltar
        </Button>
        <Button size="lg" disabled={!data.client} onClick={onNext} className="shadow-sm">
          Continuar <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
      </div>
    </div>
  )
}
