import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { MessageSquare, Settings2, FileText } from 'lucide-react'
import WhatsAppConfigTab from './components/WhatsAppConfigTab'
import WhatsAppLogsTab from './components/WhatsAppLogsTab'

export default function AdminWhatsApp() {
  const [activeTab, setActiveTab] = useState('config')

  return (
    <div className="container py-8 max-w-6xl space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <MessageSquare className="w-8 h-8 text-green-600" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Gestão WhatsApp</h1>
          <p className="text-muted-foreground mt-1">
            Configure a integração, templates e acompanhe os envios.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:w-[400px]">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Settings2 className="w-4 h-4" /> Configuração e Templates
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Histórico e Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <WhatsAppConfigTab />
        </TabsContent>
        <TabsContent value="logs">
          <WhatsAppLogsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
