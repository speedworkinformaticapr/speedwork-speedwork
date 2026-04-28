import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Mail, Server, Settings, FileText } from 'lucide-react'
import EmailConfigTab from './components/EmailConfigTab'
import EmailTemplatesTab from './components/EmailTemplatesTab'
import EmailLogsTab from './components/EmailLogsTab'

export default function AdminEmail() {
  const [activeTab, setActiveTab] = useState('config')

  return (
    <div className="container py-8 max-w-6xl space-y-6 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <Mail className="w-8 h-8 text-primary" />
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Gestão de E-mail</h1>
          <p className="text-muted-foreground mt-1">
            Configure o provedor SMTP, modelos de mensagens e acompanhe os disparos.
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 md:w-[600px]">
          <TabsTrigger value="config" className="flex items-center gap-2">
            <Server className="w-4 h-4" /> Provedor SMTP
          </TabsTrigger>
          <TabsTrigger value="templates" className="flex items-center gap-2">
            <Settings className="w-4 h-4" /> Templates
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <FileText className="w-4 h-4" /> Logs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="config">
          <EmailConfigTab />
        </TabsContent>
        <TabsContent value="templates">
          <EmailTemplatesTab />
        </TabsContent>
        <TabsContent value="logs">
          <EmailLogsTab />
        </TabsContent>
      </Tabs>
    </div>
  )
}
