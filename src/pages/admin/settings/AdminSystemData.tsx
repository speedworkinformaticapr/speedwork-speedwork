import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Building, Phone, CreditCard, MessageSquare, Link, FileText } from 'lucide-react'
import InstitutionalTab from './tabs/InstitutionalTab'
import ContactsTab from './tabs/ContactsTab'
import FinancialTab from './tabs/FinancialTab'
import CommunicationTab from './tabs/CommunicationTab'
import IntegrationsTab from './tabs/IntegrationsTab'
import TermsTab from './tabs/TermsTab'

export default function AdminSystemData() {
  return (
    <div className="container py-8 space-y-6 max-w-5xl">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações do Sistema</h1>
        <p className="text-muted-foreground">
          Gerencie todas as configurações e integrações da plataforma em um só lugar.
        </p>
      </div>

      <Tabs defaultValue="institutional" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-2 justify-start mb-6">
          <TabsTrigger value="institutional" className="flex items-center gap-2">
            <Building className="w-4 h-4" /> Institucional
          </TabsTrigger>
          <TabsTrigger value="contacts" className="flex items-center gap-2">
            <Phone className="w-4 h-4" /> Contatos
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <CreditCard className="w-4 h-4" /> Financeiro
          </TabsTrigger>
          <TabsTrigger value="communication" className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" /> Comunicação
          </TabsTrigger>
          <TabsTrigger value="integrations" className="flex items-center gap-2">
            <Link className="w-4 h-4" /> Integrações
          </TabsTrigger>
          <TabsTrigger value="terms" className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Termos
          </TabsTrigger>
        </TabsList>

        <div className="mt-4">
          <TabsContent value="institutional">
            <InstitutionalTab />
          </TabsContent>
          <TabsContent value="contacts">
            <ContactsTab />
          </TabsContent>
          <TabsContent value="financial">
            <FinancialTab />
          </TabsContent>
          <TabsContent value="communication">
            <CommunicationTab />
          </TabsContent>
          <TabsContent value="integrations">
            <IntegrationsTab />
          </TabsContent>
          <TabsContent value="terms">
            <TermsTab />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  )
}
