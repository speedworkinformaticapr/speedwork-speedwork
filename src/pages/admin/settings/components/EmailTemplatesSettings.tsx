import { Card, CardContent } from '@/components/ui/card'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Info, Mail } from 'lucide-react'
import { Link } from 'react-router-dom'

export default function EmailTemplatesSettings() {
  return (
    <Card className="animate-fade-in-up border-dashed">
      <CardContent className="pt-6">
        <Alert className="border-primary/20 bg-primary/5">
          <Mail className="h-4 w-4 text-primary" />
          <AlertTitle className="text-primary">Configuração Movida</AlertTitle>
          <AlertDescription className="mt-2 text-muted-foreground flex flex-col items-start gap-4">
            <p>
              As configurações de Servidor SMTP e Modelos de E-mail foram movidas para uma nova área
              dedicada no menu de Integrações.
            </p>
            <Button asChild variant="outline" size="sm">
              <Link to="/admin/email/config">Acessar Configurações de E-mail</Link>
            </Button>
          </AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
