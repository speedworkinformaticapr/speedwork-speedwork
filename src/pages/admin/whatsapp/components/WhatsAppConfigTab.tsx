import WhatsAppCredentials from './WhatsAppCredentials'
import WhatsAppTemplates from './WhatsAppTemplates'

export default function WhatsAppConfigTab() {
  return (
    <div className="space-y-6">
      <WhatsAppCredentials />
      <WhatsAppTemplates />
    </div>
  )
}
