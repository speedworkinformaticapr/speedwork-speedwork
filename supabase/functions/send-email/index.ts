import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    const { data: rawSysData } = await supabaseAdmin.from('system_data').select('*').single()

    // Provide robust defaults if system_data is missing or empty
    const sysData = rawSysData || {}
    const integrations =
      typeof sysData.integrations === 'object' && sysData.integrations !== null
        ? sysData.integrations
        : {}
    const smtpKey = (integrations as any).smtp_key
    const emailTemplates = (integrations as any).email_templates || {}

    const senderEmail = sysData.email || 'contato@footgolfpr.com.br'
    const senderName =
      sysData.razao_social || sysData.platform_name || 'Federação de Footgolf do Paraná'

    const address =
      [
        sysData.address_street,
        sysData.address_number,
        sysData.address_complement ? `- ${sysData.address_complement}` : '',
        sysData.address_city ? `- ${sysData.address_city}` : '',
        sysData.address_state ? `/${sysData.address_state}` : '',
      ]
        .filter(Boolean)
        .join(' ') || 'Rua da Federação, 100 - Curitiba/PR'

    const cnpj = sysData.cnpj || '00.000.000/0000-00'
    const phone = sysData.phone || '(00) 0000-0000'
    const presidentName = sysData.responsible_name || 'Presidente da Federação'
    const presidentRole = sysData.responsible_role || 'Presidente'

    const body = await req.json()
    const {
      type,
      email,
      name,
      eventDetails,
      confirmationLink,
      subject: customSubject,
      html: customHtml,
    } = body

    let subject = ''
    let bodyContent = ''

    if (type === 'test_smtp') {
      subject = `Teste de Integração SMTP - ${senderName}`
      bodyContent =
        '<p>Olá,</p><p>Este é um e-mail de teste para confirmar que a integração com o provedor de e-mail está funcionando corretamente.</p>'
    } else if (type === 'custom') {
      subject = customSubject || 'Notificação'
      bodyContent = customHtml || ''
    } else {
      const template = emailTemplates[type]
      if (template) {
        subject = template.subject
        bodyContent = template.body

        bodyContent = bodyContent.replace(/{{name}}/g, name || 'Atleta')

        if (type === 'welcome') {
          bodyContent = bodyContent.replace(/{{link}}/g, confirmationLink || '#')
        } else if (type === 'password_reset') {
          bodyContent = bodyContent.replace(/{{link}}/g, body.resetLink || '#')
        } else if (type === 'event_registration' && eventDetails) {
          bodyContent = bodyContent.replace(/{{event_name}}/g, eventDetails.title || 'Evento')
          bodyContent = bodyContent.replace(/{{event_date}}/g, eventDetails.date || 'A definir')
          bodyContent = bodyContent.replace(
            /{{event_location}}/g,
            eventDetails.location || 'A definir',
          )
        } else if (type === 'billing_reminder' || type === 'billing_overdue') {
          const c = body.chargeDetails || {}
          bodyContent = bodyContent.replace(/{{description}}/g, c.description || 'Anuidade')
          bodyContent = bodyContent.replace(/{{due_date}}/g, c.due_date || 'A definir')
          bodyContent = bodyContent.replace(/{{amount}}/g, c.amount || '0,00')
        }
      } else {
        if (type === 'welcome') {
          subject = `Bem-vindo à ${senderName}!`
          bodyContent = `<p>Olá <strong>${name}</strong>,</p><p>Estamos muito felizes em ter você na comunidade oficial de Footgolf do Paraná!</p><p>Para ativar sua conta, por favor confirme seu e-mail clicando no botão abaixo:</p><div style="text-align: center; margin: 30px 0;"><a href="${confirmationLink || '#'}" style="background-color: #1B7D3A; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">Confirmar meu e-mail</a></div>`
        } else if (type === 'welcome_club') {
          subject = `Cadastro de Clube Recebido - ${senderName}`
          bodyContent = `<p>Olá,</p><p>O cadastro do clube <strong>${name}</strong> foi recebido com sucesso pela nossa federação.</p><p>Sua solicitação está em análise e, assim que for aprovada, você terá acesso completo ao painel administrativo.</p><p>Em caso de dúvidas, entre em contato conosco.</p>`
        } else if (type === 'password_reset') {
          subject = `Alteração de Senha - ${senderName}`
          bodyContent = `<p>Olá <strong>${name}</strong>,</p><p>Você solicitou a alteração da sua senha. Clique no link abaixo para redefinir:</p><div style="text-align: center; margin: 30px 0;"><a href="${body.resetLink || '#'}" style="background-color: #1B7D3A; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">Redefinir Senha</a></div>`
        } else if (type === 'event_registration') {
          subject = `Confirmação de Inscrição - ${senderName}`
          bodyContent = `<p>Olá <strong>${name}</strong>,</p><p>Sua inscrição para o evento foi realizada com sucesso.</p><div style="background-color: #f9f9f9; border-left: 4px solid #1B7D3A; padding: 15px; margin: 20px 0;"><h3 style="margin-top: 0; color: #1B7D3A;">Detalhes do Evento:</h3><p style="margin: 5px 0;"><strong>Evento:</strong> ${eventDetails?.title || 'Torneio Oficial'}</p><p style="margin: 5px 0;"><strong>Data:</strong> ${eventDetails?.date || 'A definir'}</p><p style="margin: 5px 0;"><strong>Local:</strong> ${eventDetails?.location || 'A definir'}</p></div><p>Prepare-se e nos vemos no campo!</p>`
        }
      }
    }

    let fullLogoUrl = sysData.logo_url
    if (fullLogoUrl && fullLogoUrl.startsWith('/storage/')) {
      const baseUrl = Deno.env.get('SUPABASE_URL')?.replace(/\/$/, '') || ''
      fullLogoUrl = `${baseUrl}${fullLogoUrl}`
    } else if (fullLogoUrl && fullLogoUrl.startsWith('/')) {
      fullLogoUrl = `https://www.footgolfpr.com.br${fullLogoUrl}`
    }
    const logoUrl = fullLogoUrl
      ? `<img src="${fullLogoUrl}" alt="Logo" style="max-height: 80px; max-width: 250px; display: block; margin: 0 auto;" />`
      : `<h1 style="color: #1B7D3A; margin: 0; font-size: 24px;">${senderName}</h1>`

    let finalHtml = bodyContent
    if (!bodyContent.includes('<html')) {
      finalHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #f5f5f5; padding: 25px 20px; text-align: center; border-bottom: 4px solid #1B7D3A;">
            ${logoUrl}
          </div>
          <div style="padding: 40px 30px; color: #333333; line-height: 1.6; font-size: 16px;">
            ${bodyContent}
          </div>
          <div style="background-color: #f9f9f9; padding: 30px 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 13px; color: #666666; line-height: 1.6;">
            <p style="margin: 0 0 15px 0; font-size: 15px; color: #1B7D3A;"><strong>${presidentName}</strong><br><span style="font-size: 13px; color: #666;">${presidentRole}</span></p>
            <hr style="border: none; border-top: 1px solid #ddd; margin: 15px auto; width: 50%;" />
            <p style="margin: 5px 0; color: #444;"><strong>${senderName}</strong></p>
            <p style="margin: 5px 0;">CNPJ: ${cnpj}</p>
            <p style="margin: 5px 0;">${address}</p>
            <p style="margin: 5px 0;">Telefone: ${phone} | E-mail: ${senderEmail}</p>
          </div>
        </div>
      `
    }

    let logStatus = 'enviado'
    let logProvider = ''
    let logError = null
    let successData = null

    try {
      if (smtpKey) {
        logProvider = 'smtp2go'
        const res = await fetch('https://api.smtp2go.com/v3/email/send', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Smtp2go-Api-Key': smtpKey,
          },
          body: JSON.stringify({
            sender: `${senderName} <${senderEmail}>`,
            to: [email],
            subject: subject,
            html_body: finalHtml,
          }),
        })

        const data = await res.json()
        if (!res.ok || data.data?.error) {
          throw new Error(`SMTP2GO Error: ${JSON.stringify(data.data?.error || data)}`)
        }
        successData = data
      } else if (Deno.env.get('RESEND_API_KEY')) {
        const resendKey = Deno.env.get('RESEND_API_KEY')
        logProvider = 'resend'
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${resendKey}`,
          },
          body: JSON.stringify({
            from: 'Footgolf PR <onboarding@resend.dev>',
            to: [email],
            subject: subject,
            html: finalHtml,
          }),
        })
        const data = await res.json()
        if (!res.ok) throw new Error(`Resend Error: ${JSON.stringify(data)}`)
        successData = data
      } else {
        throw new Error('Nenhum provedor de e-mail configurado (SMTP2GO ou Resend)')
      }

      await supabaseAdmin.from('email_logs').insert({
        recipient_email: email,
        subject: subject,
        flow_type: type,
        status: logStatus,
        provider: logProvider,
      })

      return new Response(
        JSON.stringify({ success: true, provider: logProvider, data: successData }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } catch (e: any) {
      logStatus = 'falha'
      logError = e.message

      await supabaseAdmin.from('email_logs').insert({
        recipient_email: email,
        subject: subject,
        flow_type: type,
        status: logStatus,
        provider: logProvider || 'unknown',
        error_message: logError,
      })

      throw e
    }
  } catch (error: any) {
    console.error('Send email error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
