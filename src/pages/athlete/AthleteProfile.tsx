import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import AthleteBio from './components/AthleteBio'
import AthleteHistory from './components/AthleteHistory'
import AthleteFinancial from './components/AthleteFinancial'
import AthleteAttributes from './components/AthleteAttributes'

export default function AthleteProfile() {
  const { id } = useParams()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) {
      supabase
        .from('profiles')
        .select('*, clubs:club_id(name)')
        .eq('id', id)
        .single()
        .then(({ data }) => {
          setProfile(data)
          setLoading(false)
        })
    }
  }, [id])

  if (loading)
    return (
      <div className="p-8 text-center text-muted-foreground animate-pulse">
        Carregando perfil...
      </div>
    )
  if (!profile)
    return (
      <div className="p-8 text-center text-destructive">Atleta não encontrado ou excluído.</div>
    )

  return (
    <div className="container mx-auto py-8 px-4 animate-fade-in">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="outline" size="icon" asChild>
          <Link to="/admin/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">Perfil do Atleta</h1>
      </div>

      <AthleteBio profile={profile} />

      <Tabs defaultValue="atributos" className="mt-8">
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="atributos">Atributos e Avaliações</TabsTrigger>
          <TabsTrigger value="historico">Histórico de Transferências</TabsTrigger>
          <TabsTrigger value="financeiro">Movimentações Financeiras</TabsTrigger>
        </TabsList>
        <div className="mt-6">
          <TabsContent value="atributos">
            <AthleteAttributes athleteId={id!} profile={profile} />
          </TabsContent>
          <TabsContent value="historico">
            <AthleteHistory athleteId={id!} />
          </TabsContent>
          <TabsContent value="financeiro">
            <AthleteFinancial athleteId={id!} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
