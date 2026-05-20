import { z } from 'zod'

export const systemDataSchema = z.object({
  logo_url: z.string().optional().nullable(),
  menu_logo_size: z.coerce.number().optional().nullable(),
  footer_icon_size: z.coerce.number().optional().nullable(),
  platform_name: z.string().optional().nullable(),
  slogan: z.string().optional().nullable(),
  short_description: z.string().max(80, 'Máximo de 80 caracteres').optional().nullable(),
  cnpj: z.string().optional().nullable(),
  razao_social: z.string().optional().nullable(),
  address_street: z.string().optional().nullable(),
  address_number: z.string().optional().nullable(),
  address_complement: z.string().optional().nullable(),
  address_city: z.string().optional().nullable(),
  address_state: z.string().optional().nullable(),
  address_zip: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  mobile: z.string().optional().nullable(),
  responsible_name: z.string().optional().nullable(),
  responsible_cpf: z.string().optional().nullable(),
  responsible_role: z.string().optional().nullable(),
  responsible_email: z.string().optional().nullable(),
  responsible_phone: z.string().optional().nullable(),
  dark_mode: z.boolean().optional().nullable(),
  browser_icon_url: z.string().optional().nullable(),
  show_cnpj: z.boolean().optional().nullable(),
  show_contact_bar: z.boolean().optional().nullable(),
  session_lifetime: z.coerce.number().optional().nullable(),
  ai_context: z.string().optional().nullable(),
  active_theme: z.string().optional().nullable(),
  language: z.string().optional().nullable(),
  two_factor_auth: z.boolean().optional().nullable(),
  two_factor_method: z.string().optional().nullable(),
  libras_enabled: z.boolean().optional().nullable(),
  records_per_page: z.coerce.number().optional().nullable(),
  quote_validity_days: z.coerce.number().optional().nullable(),
  quote_footer_text: z.string().optional().nullable(),
  bg_image_url: z.string().optional().nullable(),
  bg_opacity: z.coerce.number().optional().nullable(),
  business_hours: z.any().optional().nullable(),

  instagram: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  facebook: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  youtube: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  google_maps_key: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  google_place_id: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  recaptcha_site_key: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  recaptcha_secret_key: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  smtp_key: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  correios_token: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  mercadolivre_token: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  stripe_public_key: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v))
    .refine((val) => !val || val.startsWith('pk_') || val.startsWith('rk_'), {
      message: "A chave pública deve começar com 'pk_' ou 'rk_'",
    }),
  stripe_secret_key: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v))
    .refine((val) => !val || val.startsWith('sk_') || val.startsWith('rk_'), {
      message: "A chave secreta deve começar com 'sk_' ou 'rk_'",
    }),
  whatsapp_enabled: z.boolean().optional().nullable(),
  accessibility_enabled: z.boolean().optional().nullable(),
  cookie_consent_enabled: z.boolean().optional().nullable(),
  whatsapp_number: z.string().optional().nullable(),

  active_payment_gateway: z.enum(['stripe', 'asaas']).optional().nullable(),
  payment_environment: z.enum(['sandbox', 'production']).optional().nullable(),
  asaas_production_key: z.string().optional().nullable(),
  asaas_sandbox_key: z.string().optional().nullable(),

  openai_api_key_test: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  openai_api_key_production: z
    .string()
    .optional()
    .nullable()
    .transform((v) => (v === '' ? null : v)),
  openai_environment: z.enum(['test', 'production']).optional().nullable(),

  term_content_uso: z.string().optional().nullable(),
  term_content_lgpd: z.string().optional().nullable(),
  term_content_cookies: z.string().optional().nullable(),
  footer_links: z.any().optional().nullable(),
})

export type SystemDataFormData = z.infer<typeof systemDataSchema>
