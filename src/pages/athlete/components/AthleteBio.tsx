import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'

export default function AthleteBio({ profile }: { profile: any }) {
  const getInitials = (name: string) => (name ? name.substring(0, 2).toUpperCase() : 'AT')

  return (
    <Card className="shadow-sm border-muted">
      <CardContent className="flex flex-col md:flex-row gap-8 p-6 items-start">
        <Avatar className="w-32 h-32 border-4 border-background shadow-md">
          <AvatarImage src={profile.foto_url || profile.photo_url || ''} className="object-cover" />
          <AvatarFallback className="text-3xl bg-primary/10 text-primary">
            {getInitials(profile.name)}
          </AvatarFallback>
        </Avatar>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
          <div>
            <h2 className="text-2xl font-bold text-foreground">{profile.name}</h2>
            <p className="text-muted-foreground">{profile.email}</p>
            <div className="mt-4 space-y-2 text-sm text-foreground/80">
              <p>
                <strong className="text-foreground">CPF/CNPJ:</strong>{' '}
                {profile.cpf_cnpj || profile.document || 'Não informado'}
              </p>
              <p>
                <strong className="text-foreground">Nascimento:</strong>{' '}
                {profile.birth_date
                  ? new Date(profile.birth_date).toLocaleDateString()
                  : 'Não informado'}
              </p>
              <p>
                <strong className="text-foreground">Gênero:</strong>{' '}
                {profile.gender || 'Não informado'}
              </p>
              <p>
                <strong className="text-foreground">Contato:</strong>{' '}
                {profile.phone || 'Não informado'}
              </p>
            </div>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-3 border-b pb-2">Dados Federativos</h3>
            <div className="space-y-2 text-sm text-foreground/80">
              <p>
                <strong className="text-foreground">Clube Atual:</strong>{' '}
                {profile.clubs?.name || 'Sem clube'}
              </p>
              <p>
                <strong className="text-foreground">Registro Federação:</strong>{' '}
                <span className="font-semibold text-primary">
                  {profile.numero_registro_federativo
                    ? profile.numero_registro_federativo.replace(/\D/g, '').length === 10
                      ? `${profile.numero_registro_federativo.slice(0, 4)}-${profile.numero_registro_federativo.slice(4, 6)}-${profile.numero_registro_federativo.slice(6, 10)}`
                      : profile.numero_registro_federativo
                    : 'Gerando...'}
                </span>
              </p>
              <p className="flex items-center gap-2">
                <strong className="text-foreground">Categoria:</strong>{' '}
                <Badge variant="secondary">{profile.categoria || 'Geral'}</Badge>
              </p>
              <p>
                <strong className="text-foreground">Subcategoria:</strong>{' '}
                {profile.subcategoria || 'N/A'}
              </p>
              <p>
                <strong className="text-foreground">Data de Filiação:</strong>{' '}
                {profile.data_filiacao_clube
                  ? new Date(profile.data_filiacao_clube).toLocaleDateString()
                  : 'Não informado'}
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
