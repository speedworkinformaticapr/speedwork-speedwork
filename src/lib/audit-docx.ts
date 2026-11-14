// Conteúdo do documento de auditoria de segurança do Speedwork
// (usado por scripts/generate-docx.mjs e por src/lib/audit-docx-build.ts).
export interface AuditPrompt {
  title: string
  desc: string
  prompt: string
}

const PROMPTS: AuditPrompt[] = [
  {
    title: '1. RLS e views públicas',
    desc: 'RLS de profiles, system_data e services endurecido (anon bloqueado), com as views públicas system_data_public e services_public criadas para a vitrine, sem expor colunas sensíveis.',
    prompt:
      'Endurecer RLS de profiles, system_data e services bloqueando acesso anônimo e criar views públicas system_data_public e services_public para a vitrine sem expor colunas sensíveis (mfa_code, integrations, cost_value).',
  },
  {
    title: '2. Edge functions admin',
    desc: 'requireAdmin (JWT) aplicado nas edge functions admin-update-password, generate-ai-text, translate-text, sync-google-* e crons de cobrança; webhooks Stripe/Asaas com validação de assinatura HMAC; CRON_SECRET nos crons.',
    prompt:
      'Aplicar requireAdmin (JWT) nas edge functions admin-update-password, generate-ai-text, translate-text, sync-google-* e crons de cobrança; webhooks Stripe/Asaas com validação de assinatura HMAC; CRON_SECRET nos crons.',
  },
  {
    title: '3. requireAdmin nas 4 functions restantes',
    desc: 'requireAdmin aplicado em create-asaas-charge, validar_whatsapp_config, process-stripe-payment e process-registration-payment, com verificação dos chamadores do front para não quebrar fluxos legítimos.',
    prompt:
      'Aplicar requireAdmin em create-asaas-charge, validar_whatsapp_config, process-stripe-payment e process-registration-payment, verificando os chamadores do front para não quebrar fluxos legítimos.',
  },
  {
    title: '4. send-email anti-spam',
    desc: 'Rate limit de 15 envios por IP a cada 15 minutos e whitelist de tipos de e-mail permitidos na edge function send-email; disparos internos com service key isentos.',
    prompt:
      'Adicionar rate limit de 15 envios por IP a cada 15 minutos e whitelist dos tipos de e-mail permitidos (MFA, reset de senha, boas-vindas, cobranças, orçamento, teste SMTP etc.) na edge function send-email; isentar disparos internos com service key.',
  },
  {
    title: '5. 2FA com dois métodos',
    desc: '2FA por perfil na tela Editar Registro (aba Acesso e Segurança) com e-mail (código válido 15 min, reenvio) e app autenticador TOTP (QRCode, chave manual, validação antes de ativar).',
    prompt:
      'Implementar 2FA por perfil na tela Editar Registro (aba Acesso e Segurança) com dois métodos: e-mail com código (válido 15 min, com reenvio) e app autenticador TOTP com QRCode, chave manual e validação de código de teste antes de ativar; edge function mfa-totp com requireUser/requireAdmin e rate limit; proteção para admin/master não desativarem o próprio 2FA.',
  },
  {
    title: '6. Correção do login MFA',
    desc: 'Login.tsx corrigido para disparar o e-mail de MFA apenas quando mfa_type = "email"; usuários com mfa_type = "totp" vão direto à tela de verificação, sem e-mail.',
    prompt:
      'Corrigir o Login.tsx para disparar o e-mail de MFA apenas quando mfa_type = "email"; usuários com mfa_type = "totp" vão direto à tela de verificação sem e-mail.',
  },
  {
    title: '7. Correção do loop TOTP',
    desc: 'Edge function mfa-totp corrigida: na ação verify, ao validar o código com sucesso, grava mfa_verified = true no perfil do usuário, encerrando o loop de verificação.',
    prompt:
      'Corrigir a edge function mfa-totp: na ação verify, ao validar o código com sucesso, gravar mfa_verified = true no perfil do usuário.',
  },
  {
    title: '8. Perfis e papéis',
    desc: 'profiles.id realinhado ao auth.users.id (caso Caroline), papel "autor" aplicado, checkboxes Cliente/Autor concedendo/revogando o papel em profiles + user_roles e policy de user_roles corrigida.',
    prompt:
      'Realinhar profiles.id ao auth.users.id quando divergirem (Caroline), aplicar papel "autor" e fazer os checkboxes Cliente/Autor da tela Editar Registro concederem/revogarem o papel em profiles + user_roles (admin/master protegidos); corrigir a policy de user_roles que permitia autoconcessão de master.',
  },
  {
    title: '9. Exclusão definitiva (hard delete)',
    desc: 'Telas admin convertidas de soft-delete para exclusão definitiva via serviço hard-delete; em Pessoas e Usuários o login do Auth também é removido via edge function delete-user.',
    prompt:
      'Converter todas as telas admin (~19) de soft-delete para exclusão definitiva via serviço hard-delete (hardDeleteRecord/hardDeleteMany); em Pessoas e Usuários remover também o login do Auth via edge function delete-user com requireAdmin e bloqueio de autoexclusão; erros de FK com mensagem amigável; remover delete-user-soft.',
  },
  {
    title: '10. Diálogos padrão',
    desc: 'confirm() nativo substituído por ConfirmDialog (shadcn) em todas as telas admin; registros inativos ocultos do filtro padrão "Todos".',
    prompt:
      'Substituir o confirm() nativo por ConfirmDialog (shadcn) em todas as telas admin; ocultar registros inativos do filtro padrão "Todos".',
  },
  {
    title: '11. Ajuda e Tour',
    desc: 'Botão "?" no cabeçalho admin com menu "Ajuda da tela" (modal por rota) e "Tour da tela" (driver.js com data-tour); conteúdo de 33 telas, tour detalhado em 7.',
    prompt:
      'Adicionar botão "?" no cabeçalho admin com menu "Ajuda da tela" (modal com conteúdo por rota) e "Tour da tela" (driver.js com atributos data-tour); conteúdo inicial de 33 telas, tour detalhado em 7.',
  },
  {
    title: '12. Contato',
    desc: 'Formulário de contato gravando em leads com sanitização (trim, limites) e policy leads_anon_insert restritiva.',
    prompt:
      'Fazer o formulário de contato gravar em leads com sanitização (trim, limites) e policy leads_anon_insert restritiva.',
  },
]

const MANUAL_ITEMS: Array<[string, string]> = [
  [
    'Rotacionar as 2 chaves da OpenAI',
    'Painel OpenAI (platform.openai.com): revogar as chaves atuais, gerar novas e atualizá-las em Dados do Sistema > Integrações (openai_api_key_test e openai_api_key_production).',
  ],
  [
    'Rotacionar a chave do Asaas',
    'Painel Asaas: revogar a chave API atual, gerar nova e atualizar em Dados do Sistema > Integrações (asaas_config.production_key e/ou sandbox_key).',
  ],
  [
    'Rotacionar a credencial SMTP2GO',
    'Painel SMTP2GO: revogar a API key atual, gerar nova e atualizar a configuração de e-mail (campo smtp_key) para que a edge function send-email volte a autenticar.',
  ],
  [
    'Trocar a senha do usuário master',
    'Supabase Auth (dashboard > Authentication > Users) ou pela tela de usuários do painel: definir nova senha forte para o Master Admin e invalidar sessões ativas.',
  ],
  [
    'Aplicar cabeçalhos HTTP de segurança no servidor/CDN',
    'Item de infraestrutura: configurar no servidor/CDN os cabeçalhos Content-Security-Policy (CSP), X-Frame-Options, Permissions-Policy e Cross-Origin-Opener-Policy (COOP).',
  ],
  [
    'Corrigir apex do domínio (SSL de speedworkinformatica.com)',
    'Emitir/renovar o certificado SSL do apex (DNS + certificado na hospedagem/CDN) e atualizar robots.txt e sitemap.xml, que ainda apontam para footgolfpr.com.br.',
  ],
  [
    'Revisar identidade/clonagem da marca S4MD',
    'Investigar a clonagem da marca: coletar evidências, registrar reclamação junto à plataforma/hospedagem do clone e avaliar medidas legais.',
  ],
]

export { PROMPTS, MANUAL_ITEMS }
