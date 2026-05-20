import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  try {
    const { orcamento_id, billingType, installmentCount, dueDate } = await req.json()
    if (!orcamento_id) throw new Error('orcamento_id is required')

    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? ''
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    const supabase = createClient(supabaseUrl, supabaseKey)

    const { data: sysData } = await supabase.from('system_data').select('integrations').single()
    const integrations = (sysData?.integrations as any) || {}
    const env = integrations.payment_environment || 'sandbox'
    const asaasApiKey =
      env === 'production' ? integrations.asaas_production_key : integrations.asaas_sandbox_key

    if (!asaasApiKey) throw new Error('Asaas API Key não configurada.')

    const asaasUrl =
      env === 'production' ? 'https://api.asaas.com/v3' : 'https://sandbox.asaas.com/api/v3'

    const { data: quote } = await supabase
      .from('orcamentos')
      .select('*, clientes(*)')
      .eq('id', orcamento_id)
      .single()
    if (!quote) throw new Error('Orçamento não encontrado')

    const client = quote.clientes
    const customerPayload = {
      name: client?.nome || 'Cliente',
      cpfCnpj: client?.cpf_cnpj ? client.cpf_cnpj.replace(/\D/g, '') : '00000000000',
      email: client?.email || 'email@naoinformado.com',
      mobilePhone: client?.telefone ? client.telefone.replace(/\D/g, '') : '',
    }

    const customerRes = await fetch(`${asaasUrl}/customers`, {
      method: 'POST',
      headers: { access_token: asaasApiKey, 'Content-Type': 'application/json' },
      body: JSON.stringify(customerPayload),
    })
    const customerData = await customerRes.json()
    if (!customerRes.ok)
      throw new Error(customerData.errors?.[0]?.description || 'Erro Asaas Customer')
    const customerId = customerData.id

    let paymentData: any
    let asaasId = ''
    let invoiceUrl = ''

    if (installmentCount > 1) {
      const paymentPayload = {
        customer: customerId,
        billingType,
        installmentCount,
        installmentValue: Number((quote.total / installmentCount).toFixed(2)),
        dueDate,
        description: `Orçamento ${quote.numero_orcamento || ''}`,
        externalReference: quote.id,
      }

      const paymentRes = await fetch(`${asaasUrl}/payments`, {
        method: 'POST',
        headers: { access_token: asaasApiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload),
      })
      paymentData = await paymentRes.json()
      if (!paymentRes.ok)
        throw new Error(paymentData.errors?.[0]?.description || 'Erro Asaas Installment')

      asaasId = paymentData.installment

      const instPaymentsRes = await fetch(`${asaasUrl}/payments?installment=${asaasId}`, {
        headers: { access_token: asaasApiKey },
      })
      const instPaymentsData = await instPaymentsRes.json()

      invoiceUrl = instPaymentsData.data?.[0]?.invoiceUrl || ''

      const chargesToInsert = instPaymentsData.data.map((p: any, idx: number) => ({
        client_name: client?.nome || 'Cliente',
        amount: p.value,
        due_date: p.dueDate,
        description: `Orçamento ${quote.numero_orcamento || ''} - Parcela ${idx + 1}/${installmentCount}`,
        status: 'pendente',
        type: 'receivable',
        category: 'orcamento',
        asaas_id: p.id,
        orcamento_id: quote.id,
      }))

      await supabase.from('financial_charges').insert(chargesToInsert)
    } else {
      const paymentPayload = {
        customer: customerId,
        billingType,
        value: quote.total,
        dueDate,
        description: `Orçamento ${quote.numero_orcamento || ''}`,
        externalReference: quote.id,
      }

      const paymentRes = await fetch(`${asaasUrl}/payments`, {
        method: 'POST',
        headers: { access_token: asaasApiKey, 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentPayload),
      })
      paymentData = await paymentRes.json()
      if (!paymentRes.ok)
        throw new Error(paymentData.errors?.[0]?.description || 'Erro Asaas Payment')

      asaasId = paymentData.id
      invoiceUrl = paymentData.invoiceUrl

      await supabase.from('financial_charges').insert({
        client_name: client?.nome || 'Cliente',
        amount: quote.total,
        due_date: dueDate,
        description: `Orçamento ${quote.numero_orcamento || ''}`,
        status: 'pendente',
        type: 'receivable',
        category: 'orcamento',
        asaas_id: asaasId,
        orcamento_id: quote.id,
      })
    }

    await supabase
      .from('orcamentos')
      .update({
        link_pagamento: invoiceUrl,
        asaas_id: asaasId,
        status_pagamento: 'pendente',
      })
      .eq('id', quote.id)

    if (quote.responsavel_id) {
      await supabase.from('notifications').insert({
        user_id: quote.responsavel_id,
        title: 'Cobrança Gerada',
        message: `O link de pagamento do orçamento ${quote.numero_orcamento || ''} foi gerado com sucesso.`,
        type: 'system',
      })
    }

    return new Response(JSON.stringify({ success: true, invoiceUrl }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})
