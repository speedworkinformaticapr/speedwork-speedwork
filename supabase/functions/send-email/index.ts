import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, x-supabase-client-platform, apikey, content-type',
}

const BRAND_COLOR = '#2563EB'
const BRAND_COLOR_DARK = '#1D4ED8'

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabaseAdmin = createClient(supabaseUrl, supabaseKey)

    const body = await req.json()
    const {
      type,
      email,
      name,
      eventDetails,
      confirmationLink,
      subject: customSubject,
      html: customHtml,
      attachments = [],
    } = body

    const { data: rawSysData } = await supabaseAdmin.from('system_data').select('*').single()

    const sysData = rawSysData || {}
    const integrations =
      typeof sysData.integrations === 'object' && sysData.integrations !== null
        ? sysData.integrations
        : {}

    const smtpKey = body.smtpKey || (integrations as any).smtp_key
    const emailTemplates = (integrations as any).email_templates || {}

    const senderEmail =
      body.senderEmail ||
      (integrations as any).smtp_sender_email ||
      sysData.email ||
      'contato@speedwork.com.br'
    const senderName = sysData.razao_social || sysData.platform_name || 'Speedwork'

    const address =
      [
        sysData.address_street,
        sysData.address_number,
        sysData.address_complement ? `- ${sysData.address_complement}` : '',
        sysData.address_city ? `- ${sysData.address_city}` : '',
        sysData.address_state ? `/${sysData.address_state}` : '',
      ]
        .filter(Boolean)
        .join(' ') || 'Endereço da Empresa'

    const cnpj = sysData.cnpj || '00.000.000/0000-00'
    const phone = sysData.phone || '(00) 0000-0000'
    const presidentName = sysData.responsible_name || 'Administrador'
    const presidentRole = sysData.responsible_role || 'Administrador'

    let subject = ''
    let bodyContent = ''

    if (type === 'mfa_code') {
      const { data: profile, error: profileError } = await supabaseAdmin
        .from('profiles')
        .select('id, name, email, mfa_enabled')
        .eq('email', email)
        .maybeSingle()

      if (profileError) {
        throw new Error(`Erro ao buscar perfil: ${profileError.message}`)
      }

      if (!profile) {
        throw new Error('Perfil não encontrado para o e-mail informado.')
      }

      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

      await supabaseAdmin
        .from('profiles')
        .update({ mfa_code: code, mfa_code_expires_at: expiresAt })
        .eq('id', profile.id)

      subject = `Código de Verificação - ${senderName}`
      bodyContent = `<p>Olá <strong>${profile.name || ''}</strong>,</p><p>Seu código de verificação é:</p><p style="font-size:32px;font-weight:bold;letter-spacing:8px;text-align:center;padding:20px;background:#f4f4f4;border-radius:8px;color:${BRAND_COLOR};">${code}</p><p>Este código expira em 15 minutos.</p><p>Se você não solicitou este código, ignore este e-mail.</p>`
    } else if (type === 'test_smtp') {
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

        bodyContent = bodyContent.replace(/{{name}}/g, name || 'Usuário')

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
          bodyContent = bodyContent.replace(/{{description}}/g, c.description || 'Cobrança')
          bodyContent = bodyContent.replace(/{{due_date}}/g, c.due_date || 'A definir')
          bodyContent = bodyContent.replace(/{{amount}}/g, c.amount || '0,00')
        }
      } else {
        if (type === 'welcome') {
          subject = `Bem-vindo à ${senderName}!`
          bodyContent = `<p>Olá <strong>${name}</strong>,</p><p>Estamos muito felizes em ter você na plataforma ${senderName}!</p><p>Para ativar sua conta, por favor confirme seu e-mail clicando no botão abaixo:</p><div style="text-align: center; margin: 30px 0;"><a href="${confirmationLink || '#'}" style="background-color: ${BRAND_COLOR}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">Confirmar meu e-mail</a></div>`
        } else if (type === 'welcome_club') {
          subject = `Cadastro Recebido - ${senderName}`
          bodyContent = `<p>Olá,</p><p>O cadastro de <strong>${name}</strong> foi recebido com sucesso.</p><p>Sua solicitação está em análise e, assim que for aprovada, você terá acesso completo ao painel administrativo.</p><p>Em caso de dúvidas, entre em contato conosco.</p>`
        } else if (type === 'password_reset') {
          subject = `Alteração de Senha - ${senderName}`
          bodyContent = `<p>Olá <strong>${name}</strong>,</p><p>Você solicitou a alteração da sua senha. Clique no link abaixo para redefinir:</p><div style="text-align: center; margin: 30px 0;"><a href="${body.resetLink || '#'}" style="background-color: ${BRAND_COLOR}; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; font-size: 16px; display: inline-block;">Redefinir Senha</a></div>`
        } else if (type === 'event_registration') {
          subject = `Confirmação de Inscrição - ${senderName}`
          bodyContent = `<p>Olá <strong>${name}</strong>,</p><p>Sua inscrição para o evento foi realizada com sucesso.</p><div style="background-color: #f9f9f9; border-left: 4px solid ${BRAND_COLOR}; padding: 15px; margin: 20px 0;"><h3 style="margin-top: 0; color: ${BRAND_COLOR};">Detalhes do Evento:</h3><p style="margin: 5px 0;"><strong>Evento:</strong> ${eventDetails?.title || 'Evento'}</p><p style="margin: 5px 0;"><strong>Data:</strong> ${eventDetails?.date || 'A definir'}</p><p style="margin: 5px 0;"><strong>Local:</strong> ${eventDetails?.location || 'A definir'}</p></div>`
        }
      }
    }

    let fullLogoUrl = sysData.logo_url
    if (fullLogoUrl) {
      const supabaseBaseUrl = Deno.env.get('SUPABASE_URL')?.replace(/\/$/, '') || ''
      const publicBaseUrl = 'https://www.speedworkinformatica.com'
      const cleanPath = (p: string) => p.split('?')[0]

      if (fullLogoUrl.startsWith('http://') || fullLogoUrl.startsWith('https://')) {
        if (
          fullLogoUrl.includes('/storage/v1/object/sign/media/') ||
          fullLogoUrl.includes('/storage/v1/render/image/media/')
        ) {
          const match = fullLogoUrl.match(
            /\/storage\/v1\/(?:object\/sign|render\/image)\/media\/(.+)/,
          )
          if (match) {
            fullLogoUrl = `${supabaseBaseUrl}/storage/v1/object/public/media/${cleanPath(match[1])}`
          }
        }
        // Already an absolute URL — use as-is
      } else if (fullLogoUrl.startsWith('/storage/v1/object/public/media/')) {
        fullLogoUrl = `${supabaseBaseUrl}${cleanPath(fullLogoUrl)}`
      } else if (
        fullLogoUrl.startsWith('/storage/v1/object/sign/media/') ||
        fullLogoUrl.startsWith('/storage/v1/render/image/media/')
      ) {
        const match = fullLogoUrl.match(
          /\/storage\/v1\/(?:object\/sign|render\/image)\/media\/(.+)/,
        )
        if (match) {
          fullLogoUrl = `${supabaseBaseUrl}/storage/v1/object/public/media/${cleanPath(match[1])}`
        }
      } else if (fullLogoUrl.startsWith('/storage/')) {
        const mediaMatch = fullLogoUrl.match(/media\/(.+)/)
        if (mediaMatch) {
          fullLogoUrl = `${supabaseBaseUrl}/storage/v1/object/public/media/${cleanPath(mediaMatch[1])}`
        } else {
          fullLogoUrl = `${supabaseBaseUrl}${cleanPath(fullLogoUrl)}`
        }
      } else if (fullLogoUrl.startsWith('media/')) {
        fullLogoUrl = `${supabaseBaseUrl}/storage/v1/object/public/${cleanPath(fullLogoUrl)}`
      } else if (fullLogoUrl.startsWith('/')) {
        fullLogoUrl = `${publicBaseUrl}${cleanPath(fullLogoUrl)}`
      } else {
        fullLogoUrl = `${supabaseBaseUrl}/storage/v1/object/public/media/${cleanPath(fullLogoUrl)}`
      }
    }

    const logoUrl = fullLogoUrl
      ? `<img src="${fullLogoUrl}" alt="${senderName}" width="250" height="80" style="max-height: 80px; max-width: 250px; width: auto; height: auto; display: block; margin: 0 auto; border: 0; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic; font-family: Arial, Helvetica, sans-serif; font-size: 20px; font-weight: bold; color: ${BRAND_COLOR}; line-height: 80px; text-align: center;" />`
      : `<h1 style="color: ${BRAND_COLOR}; margin: 0; font-size: 24px; font-family: Arial, Helvetica, sans-serif;">${senderName}</h1>`

    let finalHtml = bodyContent
    if (!bodyContent.includes('<html')) {
      finalHtml = `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${subject}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #f0f0f0; font-family: Arial, Helvetica, sans-serif; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; line-height: 1.6;">
  <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="background-color: #f0f0f0;">
    <tr>
      <td align="center" style="padding: 20px 10px;">
        <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="600" style="max-width: 600px; width: 100%; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <tr>
            <td align="center" style="background-color: #f5f5f5; padding: 25px 20px; border-bottom: 4px solid ${BRAND_COLOR};">
              ${logoUrl}
            </td>
          </tr>
          <tr>
            <td style="padding: 40px 30px; color: #333333; line-height: 1.6; font-size: 16px;">
              ${bodyContent}
            </td>
          </tr>
          <tr>
            <td style="background-color: #f9f9f9; padding: 30px 20px; text-align: center; border-top: 1px solid #e0e0e0; font-size: 13px; color: #666666; line-height: 1.6;">
              <p style="margin: 0 0 15px 0; font-size: 15px; color: ${BRAND_COLOR_DARK};"><strong>${presidentName}</strong><br /><span style="font-size: 13px; color: #666666;">${presidentRole}</span></p>
              <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin: 15px auto;">
                <tr><td style="border-top: 1px solid #dddddd; line-height: 0; font-size: 0; height: 1px; width: 200px;">&nbsp;</td></tr>
              </table>
              <p style="margin: 5px 0; color: #444444;"><strong>${senderName}</strong></p>
              <p style="margin: 5px 0;">CNPJ: ${cnpj}</p>
              <p style="margin: 5px 0;">${address}</p>
              <p style="margin: 5px 0;">Telefone: ${phone} | E-mail: ${senderEmail}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`
    }

    let logStatus = 'enviado'
    let logProvider = ''
    let logError: string | null = null
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
            attachments: attachments.map((a: any) => ({
              filename: a.filename,
              fileblob: a.content,
              mimetype: a.mimetype || 'text/plain',
            })),
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
            from: `${senderName} <onboarding@resend.dev>`,
            to: [email],
            subject: subject,
            html: finalHtml,
            attachments: attachments.map((a: any) => ({
              filename: a.filename,
              content: a.content,
            })),
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
    const message = error.message || 'Unknown error'
    let code = 'EMAIL_SEND_ERROR'
    if (message.includes('SMTP2GO')) {
      code = 'SMTP_PROVIDER_ERROR'
    } else if (message.includes('Nenhum provedor')) {
      code = 'NO_PROVIDER_CONFIGURED'
    } else if (message.includes('Perfil não encontrado')) {
      code = 'PROFILE_NOT_FOUND'
    }
    return new Response(JSON.stringify({ error: message, code }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
