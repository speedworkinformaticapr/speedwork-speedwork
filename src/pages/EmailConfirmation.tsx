import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { MailCheck } from 'lucide-react'

export default function EmailConfirmation() {
  return (
    <Card className="border-none shadow-2xl bg-white/95 backdrop-blur text-center">
      <CardHeader className="space-y-4 pb-2">
        <div className="mx-auto w-16 h-16 bg-[#4ADE80]/20 rounded-full flex items-center justify-center">
          <MailCheck className="w-8 h-8 text-[#1B7D3A]" />
        </div>
        <CardTitle className="text-2xl font-poppins font-bold tracking-tight text-[#1B7D3A]">
          Verifique seu E-mail
        </CardTitle>
        <CardDescription className="text-muted-foreground font-inter text-base">
          Enviamos um link de confirmação para o seu endereço de e-mail. Por favor, verifique sua
          caixa de entrada e spam.
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4">
        <p className="text-sm text-muted-foreground font-inter">
          Não recebeu o e-mail?{' '}
          <button className="text-[#1B7D3A] font-medium hover:underline">Reenviar</button>
        </p>
      </CardContent>
      <CardFooter className="flex justify-center border-t p-6 mt-2">
        <Button asChild variant="outline" className="w-full font-inter">
          <Link to="/login">Voltar para o Login</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
