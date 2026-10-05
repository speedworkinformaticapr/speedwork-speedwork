import { useState } from 'react'
import {
  FileDown,
  FileText,
  CheckCircle2,
  Layers,
  Sparkles,
  Settings,
  Sliders,
  Database,
  ArrowRight,
  ExternalLink,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { generateSystemDocumentationDocx } from '@/lib/docx-documentation-generator'
import { Link } from 'react-router-dom'

export default function AdminSystemDocumentation() {
  const [isGenerating, setIsGenerating] = useState(false)

  const handleDownloadDocx = async () => {
    if (isGenerating) return

    try {
      setIsGenerating(true)
      toast.info('Gerando arquivo Word formatado (.docx)...')

      const blob = await generateSystemDocumentationDocx()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'Documentacao_Speedwork_Sistema.docx'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success('Download concluído com sucesso: Documentacao_Speedwork_Sistema.docx')
    } catch (error) {
      console.error('Erro ao gerar documento:', error)
      toast.error('Erro ao gerar o documento .docx. Tente novamente.')
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6 pb-12 max-w-7xl mx-auto">
      {/* Top Banner & Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-xl border bg-gradient-to-r from-blue-900/10 via-primary/5 to-background shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-primary/40 text-primary font-semibold">
              Documentação Oficial
            </Badge>
            <Badge variant="secondary">Versão 1.0</Badge>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <FileText className="size-7 text-primary" />
            Documentação do Sistema
          </h1>
          <p className="text-sm md:text-base text-muted-foreground max-w-3xl">
            Manual técnico e operacional completo contendo o mapeamento dos 4 processos-chave da
            plataforma Speedwork. Faça o download em formato Microsoft Word (.docx) formatado e
            estruturado com tabelas esquemáticas de layout.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 shrink-0">
          <Button
            size="lg"
            onClick={handleDownloadDocx}
            disabled={isGenerating}
            className="gap-2 shadow-md bg-blue-700 hover:bg-blue-800 text-white font-medium"
          >
            <FileDown className={`size-5 ${isGenerating ? 'animate-bounce' : ''}`} />
            {isGenerating ? 'Gerando .docx...' : 'Baixar Documentação (.docx)'}
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                Capítulo 1
              </span>
              <Settings className="size-4 text-blue-600" />
            </div>
            <CardTitle className="text-base font-bold">Dados do Sistema</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-muted-foreground space-y-2">
            <p>10 guias, tabela única system_data, audit_logs e integrações completas.</p>
            <Link
              to="/admin/settings/system"
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              Acessar Tela <ExternalLink className="size-3" />
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                Capítulo 2
              </span>
              <Sparkles className="size-4 text-amber-500" />
            </div>
            <CardTitle className="text-base font-bold">Blog com IA</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-muted-foreground space-y-2">
            <p>4 blocos, auto-salvamento, DALL·E 16:9 e tripla camada de ai_context.</p>
            <Link
              to="/admin/settings/blog/novo"
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              Acessar Tela <ExternalLink className="size-3" />
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                Capítulo 3
              </span>
              <Sliders className="size-4 text-emerald-600" />
            </div>
            <CardTitle className="text-base font-bold">Serviços para Planos</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-muted-foreground space-y-2">
            <p>4 modalidades (Avulso..Anual), descontos cumulativos e calculatePrice.</p>
            <Link
              to="/admin/settings/plan-services"
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              Acessar Tela <ExternalLink className="size-3" />
            </Link>
          </CardContent>
        </Card>

        <Card className="hover:border-primary/50 transition-colors">
          <CardHeader className="p-4 pb-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase text-muted-foreground">
                Capítulo 4
              </span>
              <Layers className="size-4 text-indigo-600" />
            </div>
            <CardTitle className="text-base font-bold">Page Builder</CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 text-xs text-muted-foreground space-y-2">
            <p>Dobras modulares em JSONB, 20 elementos declarativos e preview WYSIWYG.</p>
            <Link
              to="/admin/settings/pages"
              className="inline-flex items-center gap-1 text-primary hover:underline font-medium"
            >
              Acessar Tela <ExternalLink className="size-3" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Tabs with in-depth view */}
      <Tabs defaultValue="cap1" className="w-full">
        <TabsList className="grid grid-cols-2 md:grid-cols-4 w-full h-auto p-1 bg-muted/60">
          <TabsTrigger value="cap1" className="py-2.5 text-xs sm:text-sm font-medium">
            Capítulo 1: Dados do Sistema
          </TabsTrigger>
          <TabsTrigger value="cap2" className="py-2.5 text-xs sm:text-sm font-medium">
            Capítulo 2: Blog & IA
          </TabsTrigger>
          <TabsTrigger value="cap3" className="py-2.5 text-xs sm:text-sm font-medium">
            Capítulo 3: Serviços & Planos
          </TabsTrigger>
          <TabsTrigger value="cap4" className="py-2.5 text-xs sm:text-sm font-medium">
            Capítulo 4: Page Builder
          </TabsTrigger>
        </TabsList>

        {/* ================= CAPÍTULO 1 ================= */}
        <TabsContent value="cap1" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-xl">Capítulo 1: Tela "Dados do Sistema"</CardTitle>
                  <CardDescription>
                    Rota:{' '}
                    <code className="text-primary font-mono font-semibold">
                      /admin/settings/system
                    </code>{' '}
                    • Tabela: <code className="font-mono">system_data</code> (ID único fixo)
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadDocx}>
                  <FileDown className="size-4 mr-2" />
                  Exportar .docx
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">1.1 Visão Geral</h3>
                <p className="text-muted-foreground leading-relaxed">
                  A tela "Dados do Sistema" (/admin/settings/system) é o painel central de
                  configuração da plataforma. Todo o conteúdo é gravado em uma única linha da tabela{' '}
                  <code className="font-mono bg-muted px-1 py-0.5 rounded">system_data</code>{' '}
                  (registro de ID fixo{' '}
                  <code className="font-mono text-xs">00000000-0000-0000-0000-000000000001</code>).
                  Salvar a tela faz um upsert nesse registro único, atualizando colunas de
                  configuração e os objetos JSONB (integrations, terms, business_hours,
                  footer_links).
                </p>
                <div className="p-3 bg-muted/40 rounded-lg border text-xs text-muted-foreground space-y-1">
                  <p>
                    <strong>Segurança:</strong> somente admin ou master podem alterar (política RLS{' '}
                    <code className="font-mono">system_data_update_admin</code>); leitura pública
                    pois alimenta o site.
                  </p>
                  <p>
                    <strong>Auditoria:</strong> um trigger (
                    <code className="font-mono">audit_system_data</code>) grava toda alteração na
                    tabela <code className="font-mono">audit_logs</code>{' '}
                    (old_data/new_data/changed_by), alimentando a tela "Histórico de Alterações".
                  </p>
                </div>
              </div>

              {/* Esquema de Layout 1 */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  Esquema do Layout (Representação)
                </h3>
                <div className="border-2 border-dashed rounded-lg p-4 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between bg-card p-3 rounded border text-xs font-medium">
                    <span className="font-bold text-primary">Cabeçalho: Dados do Sistema</span>
                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">
                      Histórico de Alterações
                    </span>
                  </div>
                  <div className="grid grid-cols-5 md:grid-cols-10 gap-1 text-[11px] text-center font-medium">
                    {[
                      'Identidade',
                      'Negócio',
                      'Responsável',
                      'Horários',
                      'Interface',
                      'Integrações',
                      'Preferências',
                      'Rodapé',
                      'Legal',
                      'Financeiro',
                    ].map((g, i) => (
                      <div
                        key={g}
                        className={`p-2 rounded border ${i === 0 ? 'bg-primary text-primary-foreground font-bold' : 'bg-background'}`}
                      >
                        {i + 1}. {g}
                      </div>
                    ))}
                  </div>
                  <div className="bg-card p-5 rounded border text-center text-xs text-muted-foreground min-h-[120px] flex flex-col items-center justify-center gap-2">
                    <p className="font-semibold text-foreground">
                      Card do Formulário Ativo da Guia Selecionada
                    </p>
                    <p>
                      Campos de texto, seletores de tema, uploads de logos/ícones, chaves de API,
                      toggles e parâmetros numéricos
                    </p>
                  </div>
                  <div className="flex justify-end gap-2 bg-card p-3 rounded border text-xs">
                    <span className="px-3 py-1 rounded border bg-background">Descartar</span>
                    <span className="px-3 py-1 rounded bg-primary text-primary-foreground font-medium">
                      Salvar Alterações
                    </span>
                  </div>
                </div>
              </div>

              {/* Tabela das 10 guias */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  1.2 As 10 Guias de Configuração
                </h3>
                <div className="overflow-x-auto border rounded-lg">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-muted font-semibold text-foreground border-b">
                      <tr>
                        <th className="p-3">Guia</th>
                        <th className="p-3">Colunas no Banco</th>
                        <th className="p-3">Uso no Sistema e Consumidores</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y text-muted-foreground">
                      <tr>
                        <td className="p-3 font-medium text-foreground">
                          1. Identidade e Branding
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          platform_name, slogan, short_description, logo_url, browser_icon_url,
                          menu_logo_size, active_theme, login_*
                        </td>
                        <td className="p-3">
                          Navbar, menu lateral admin, tela de Login e título do site, via hook
                          use-system-data (cache local + Supabase).
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-foreground">2. Negócio</td>
                        <td className="p-3 font-mono text-[11px]">
                          razao_social, cnpj, show_cnpj, email, phone, mobile, address_*
                        </td>
                        <td className="p-3">
                          Rodapé do site, barra de contato, orçamentos e portal de aprovação de
                          orçamentos do cliente.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-foreground">3. Responsável</td>
                        <td className="p-3 font-mono text-[11px]">
                          responsible_name, responsible_cpf, responsible_role, responsible_email,
                          responsible_phone
                        </td>
                        <td className="p-3">
                          Identificação legal do responsável (LGPD e documentos gerados).
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-foreground">4. Horários</td>
                        <td className="p-3 font-mono text-[11px]">
                          business_hours (JSONB), scheduling_interval_minutes (padrão 30)
                        </td>
                        <td className="p-3">
                          business_hours (JSONB, objeto por dia com active, open, close,
                          has_lunch_break, lunch_start, lunch_end; valida fechamento após abertura e
                          almoço dentro do expediente). Consumido pelo agendamento público e pela
                          grade da equipe para calcular horários livres.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-foreground">5. Interface</td>
                        <td className="p-3 font-mono text-[11px]">
                          records_per_page, session_lifetime, dark_mode, language, libras_enabled,
                          footer_icon_size
                        </td>
                        <td className="p-3">
                          Linhas por página nas listas admin, tempo de sessão em horas, VLibras e
                          tema.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-foreground">6. Integrações Externas</td>
                        <td className="p-3 font-mono text-[11px]">
                          integrations (JSONB), stripe_config, asaas_config
                        </td>
                        <td className="p-3">
                          Merge parcial no JSONB integrations ao salvar. Grava em stripe_config e
                          asaas_config (tenant_id &rarr; system_data.id). OpenAI (openai_api_key_*,
                          blog_ai_model), Google (google_maps_key, google_place_id), SMTP2GO,
                          reCAPTCHA e Redes Sociais. Consumidores: edge functions generate-ai-text,
                          sync-google-reviews, send-email e checkout.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-foreground">
                          7. Preferências do Sistema
                        </td>
                        <td className="p-3 font-mono text-[11px]">
                          ai_context, show_contact_bar, two_factor_auth, two_factor_method,
                          accessibility_enabled, cookie_consent_enabled
                        </td>
                        <td className="p-3">
                          ai_context (Contexto de IA — texto que instrui a IA na geração de posts;
                          consumido por generate-ai-text, AIGenerateButton e editor rico).
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-foreground">8. Rodapé / Textos</td>
                        <td className="p-3 font-mono text-[11px]">
                          quote_footer_text, footer_links (JSONB com links[] e columns)
                        </td>
                        <td className="p-3">Rodapé dos orçamentos, links e redes sociais.</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-foreground">9. Legal</td>
                        <td className="p-3 font-mono text-[11px]">
                          terms (JSONB: uso, lgpd, cookies)
                        </td>
                        <td className="p-3">
                          Termos de Uso, LGPD, Cookies. Suporta variáveis dinâmicas{' '}
                          {`{{cliente_nome}}, {{empresa_cnpj}}, {{data_atual}}`}.
                        </td>
                      </tr>
                      <tr>
                        <td className="p-3 font-medium text-foreground">10. Financeiro</td>
                        <td className="p-3 font-mono text-[11px]">
                          quote_validity_days, taxas de cartão via stripe_config
                        </td>
                        <td className="p-3">
                          Validade dos orçamentos e parâmetros de taxas de cartão.
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  1.3 Mapa de Relacionamentos
                </h3>
                <p className="text-muted-foreground">
                  <code className="font-mono">system_data</code> (registro único) &rarr;{' '}
                  <code className="font-mono">stripe_config.tenant_id</code> e{' '}
                  <code className="font-mono">asaas_config.tenant_id</code> apontam para{' '}
                  <code className="font-mono">system_data.id</code>;{' '}
                  <code className="font-mono">audit_logs</code> via trigger; consumido por Site
                  público, Agendamento, Orçamentos, Blog/IA, E-commerce/Checkout e Edge functions
                  (generate-ai-text, send-email, sync-google-reviews).
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= CAPÍTULO 2 ================= */}
        <TabsContent value="cap2" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-xl">
                    Capítulo 2: Tela "Criar Novo Post" (Blog & IA)
                  </CardTitle>
                  <CardDescription>
                    Rota:{' '}
                    <code className="text-primary font-mono font-semibold">
                      /admin/settings/blog/novo
                    </code>{' '}
                    • Tabela: <code className="font-mono">blog_posts</code>
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadDocx}>
                  <FileDown className="size-4 mr-2" />
                  Exportar .docx
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  2.1 Visão Geral e Ciclo de Vida
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  A rota <code className="font-mono">/admin/settings/blog/novo</code> (vira{' '}
                  <code className="font-mono">/edit</code> após o 1º salvamento) organiza a criação
                  de conteúdo em 4 blocos operacionais: Identificação, Mídia, Textos (com IA) e
                  Fechamento.
                </p>
                <div className="p-3 bg-muted/40 rounded-lg border text-xs text-muted-foreground">
                  Possui sistema de <strong>auto-salvamento de rascunho</strong> em tempo real
                  ("Salvando…" / "Rascunho salvo ✓"). Ao salvar grava na tabela{' '}
                  <code className="font-mono">blog_posts</code>; se status Publicado, preenche{' '}
                  <code className="font-mono">published_at</code> automaticamente.
                </div>
              </div>

              {/* Esquema de Layout 2 */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  Esquema do Layout (Representação)
                </h3>
                <div className="border-2 border-dashed rounded-lg p-4 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between bg-card p-3 rounded border text-xs font-medium">
                    <span className="font-bold text-primary">Criar Novo Post</span>
                    <span className="text-muted-foreground">
                      Rascunho salvo ✓ • Botões: Cancelar / Publicar
                    </span>
                  </div>
                  <div className="bg-card p-3 rounded border text-xs space-y-2">
                    <span className="font-semibold text-primary">Bloco 1: Identificação</span>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-center text-[11px]">
                      <div className="p-2 border rounded bg-muted/30">
                        Título do Artigo (100c) ✨ IA
                      </div>
                      <div className="p-2 border rounded bg-muted/30">Categoria (50c)</div>
                      <div className="p-2 border rounded bg-muted/30">Status (Rascunho/Publ.)</div>
                      <div className="p-2 border rounded bg-muted/30">Autor / Fonte (100c)</div>
                    </div>
                  </div>
                  <div className="bg-card p-3 rounded border text-xs space-y-2">
                    <span className="font-semibold text-primary">Bloco 2: Mídia</span>
                    <div className="grid grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="p-2 border rounded bg-muted/30">
                        Capa: Galeria / DALL·E 16:9 / URL
                      </div>
                      <div className="p-2 border rounded bg-muted/30">Texto Alt (125c SEO)</div>
                      <div className="p-2 border rounded bg-muted/30">
                        Imagens Intercaladas (Repetidor)
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-3 rounded border text-xs space-y-2">
                    <span className="font-semibold text-primary">
                      Bloco 3: Textos (Assistência com IA ✨)
                    </span>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-center text-[11px]">
                      <div className="p-2 border rounded bg-muted/30">Lead / Resumo (160c) ✨</div>
                      <div className="p-2 border rounded bg-muted/30">
                        SEO Description (160c) ✨
                      </div>
                      <div className="p-2 border rounded bg-muted/30">Introdução (800c) ✨</div>
                      <div className="p-2 border rounded bg-muted/30">Conteúdo (2000p) ✨</div>
                      <div className="p-2 border rounded bg-muted/30">Takeaways (500c) ✨</div>
                      <div className="p-2 border rounded bg-muted/30">
                        Conclusão & CTA (150c) ✨
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-3 rounded border text-xs space-y-2">
                    <span className="font-semibold text-primary">Bloco 4: Classificação</span>
                    <div className="p-2 border rounded bg-muted/30 text-center text-[11px]">
                      Tags (Seletor múltiplo com chips de sugestões prévias)
                    </div>
                  </div>
                </div>
              </div>

              {/* ai_context */}
              <div className="space-y-3">
                <h3 className="text-base font-semibold text-foreground">
                  2.3 Ligação com o "Contexto Base para a IA" (ai_context)
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Todo campo com IA consome o <code className="font-mono">ai_context</code> de Dados
                  do Sistema &gt; Preferências do Sistema. O fluxo ao clicar "Gerar com IA" segue 3
                  etapas de injeção de contexto:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 border rounded-lg bg-card space-y-1">
                    <span className="font-bold text-primary">1. field_context</span>
                    <p className="text-muted-foreground">
                      Instrução específica do campo montada dinamicamente com o que já foi digitado
                      (ex.: "Introdução envolvente para o post: '&lt;título&gt;'").
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg bg-card space-y-1">
                    <span className="font-bold text-primary">2. current_text</span>
                    <p className="text-muted-foreground">
                      Texto atual do campo, para a IA aprimorar, corrigir ou expandir em vez de
                      recomeçar do zero.
                    </p>
                  </div>
                  <div className="p-3 border rounded-lg bg-card space-y-1">
                    <span className="font-bold text-primary">3. system_context</span>
                    <p className="text-muted-foreground">
                      ai_context buscado da tabela system_data no momento exato do clique,
                      garantindo sempre a versão mais recente.
                    </p>
                  </div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg text-xs text-muted-foreground">
                  A edge function <code className="font-mono">generate-ai-text</code> recebe tudo,
                  aplica o modelo <code className="font-mono">blog_ai_model</code> (ex.: gpt-4-turbo
                  configurado em Blog &gt; "Configurações de IA — Blog") e chama a OpenAI com a
                  chave de produção da guia Integrações Externas. O mesmo mecanismo vale para os
                  editores de Regras, Torneios, Cursos, Contratos, Pedidos, Orçamentos e LGPD.
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= CAPÍTULO 3 ================= */}
        <TabsContent value="cap3" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-xl">
                    Capítulo 3: Cadastro de Serviços para Planos
                  </CardTitle>
                  <CardDescription>
                    Rota:{' '}
                    <code className="text-primary font-mono font-semibold">
                      /admin/settings/plan-services
                    </code>{' '}
                    • Tabelas: <code className="font-mono">services</code>,{' '}
                    <code className="font-mono">plan_categories</code>
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadDocx}>
                  <FileDown className="size-4 mr-2" />
                  Exportar .docx
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  3.1 Visão Geral e Estrutura
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Cadastra os serviços que compõem os planos da plataforma. Cada serviço possui{' '}
                  <strong>4 modalidades de cobrança</strong> (Avulso, Mensal, Semestral, Anual),
                  cada uma com valor base, desconto permanente e desconto promocional com data de
                  expiração.
                </p>
              </div>

              {/* Esquema de Layout 3 */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  Esquema do Layout (Representação)
                </h3>
                <div className="border-2 border-dashed rounded-lg p-4 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between bg-card p-3 rounded border text-xs font-medium">
                    <span className="font-bold text-primary">Cadastro de Serviços para Planos</span>
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded font-medium">
                      + Novo Serviço
                    </span>
                  </div>
                  <div className="overflow-x-auto">
                    <div className="min-w-[600px] border rounded bg-card text-xs">
                      <div className="grid grid-cols-8 p-2 font-semibold bg-muted/60 border-b text-[11px]">
                        <span>Título [Promo]</span>
                        <span>Categoria</span>
                        <span>Descrição</span>
                        <span>Avulso</span>
                        <span>Mensal</span>
                        <span>Semestral</span>
                        <span>Anual</span>
                        <span>Ações</span>
                      </div>
                      <div className="grid grid-cols-8 p-2 border-b text-[11px] items-center text-muted-foreground">
                        <span className="font-medium text-foreground">Consultoria A</span>
                        <span>Comercial</span>
                        <span className="truncate">Assessoria...</span>
                        <span>R$ 150,00</span>
                        <span>
                          <s className="text-muted-foreground">R$ 500</s>{' '}
                          <span className="text-emerald-600 font-bold">R$ 450</span>
                        </span>
                        <span>R$ 2.700,00</span>
                        <span>R$ 4.800,00</span>
                        <span>Editar | Excluir</span>
                      </div>
                    </div>
                  </div>
                  <div className="bg-card p-3 rounded border text-xs space-y-1">
                    <span className="font-bold text-primary">
                      Modal de Formulário (5 Seções Empilhadas):
                    </span>
                    <p className="text-muted-foreground text-[11px]">
                      1. Identificação (Título*, Categoria + mini-modal ➕, Descrição*) | 2. Dados
                      Técnicos (caixa azul: Slug, Tempo hh:mm:ss, Custo R$, Venda R$) | 3. Valores
                      (Grid 4 modalidades com % Desc. Permanente) | 4. Descontos Promo (% e
                      expiração datetime) | 5. Observação (com IA ✨).
                    </p>
                  </div>
                </div>
              </div>

              {/* Regra de Cálculo */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  3.4 Regra de Cálculo (calculatePrice)
                </h3>
                <div className="p-4 bg-blue-50/50 dark:bg-blue-950/20 rounded-lg border border-blue-200 dark:border-blue-900 space-y-2 text-xs">
                  <p className="font-semibold text-blue-900 dark:text-blue-300">
                    Descontos cumulativos em cadeia aplicados de forma consistente em todo o
                    ecossistema (tabela, vitrines, checkout):
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-muted-foreground">
                    <li>
                      <strong>Preço Padrão:</strong> Preço Base − Desconto Permanente (% sobre a
                      base).
                    </li>
                    <li>
                      <strong>Preço Promocional:</strong> Se promoção vigente (promo &gt; 0 E data
                      de expiração no futuro): Preço Padrão − Promo% (% sobre o preço padrão).
                    </li>
                    <li>
                      <strong>Expiração Automática:</strong> Promoção com data ultrapassada deixa de
                      valer instantaneamente.
                    </li>
                  </ol>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ================= CAPÍTULO 4 ================= */}
        <TabsContent value="cap4" className="space-y-4 mt-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div>
                  <CardTitle className="text-xl">
                    Capítulo 4: Menu "Páginas" / Page Builder
                  </CardTitle>
                  <CardDescription>
                    Rotas:{' '}
                    <code className="text-primary font-mono font-semibold">/admin/pages</code>,{' '}
                    <code className="font-mono">/admin/settings/pages</code> • Tabela:{' '}
                    <code className="font-mono">pages</code> (blocos JSONB)
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={handleDownloadDocx}>
                  <FileDown className="size-4 mr-2" />
                  Exportar .docx
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6 text-sm">
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  4.1 Visão Geral e Arquitetura
                </h3>
                <p className="text-muted-foreground leading-relaxed">
                  Gerencia as páginas institucionais montadas por blocos ("dobras"). Uma única tela
                  unificada com seletor de páginas embutido no topo. O estado central{' '}
                  <code className="font-mono">use-page-builder-store</code> alimenta simultaneamente
                  as 3 abas, gravando na tabela <code className="font-mono">pages</code> o array
                  serializado de blocos JSONB.
                </p>
              </div>

              {/* Esquema de Layout 4 */}
              <div className="space-y-2">
                <h3 className="text-base font-semibold text-foreground">
                  Esquema do Layout (Representação)
                </h3>
                <div className="border-2 border-dashed rounded-lg p-4 bg-muted/20 space-y-3">
                  <div className="flex items-center justify-between bg-card p-3 rounded border text-xs font-medium">
                    <div className="space-y-0.5">
                      <span className="font-bold text-primary">
                        Página Institucional: Sobre Nós (/sobre)
                      </span>
                      <span className="ml-2 text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 px-1.5 py-0.5 rounded">
                        Publicado
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <span className="border px-2 py-0.5 rounded bg-muted/30">Preview ↗</span>
                      <span className="bg-primary text-primary-foreground px-2 py-0.5 rounded">
                        Salvar
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 bg-card p-2 rounded border text-xs">
                    <span className="font-semibold text-muted-foreground">Página em Edição:</span>
                    <span className="border px-3 py-1 rounded bg-background font-mono flex-1">
                      PageListbox (Combobox com popover de busca)
                    </span>
                    <span className="text-muted-foreground text-[11px]">Total: 12 páginas</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs font-semibold">
                    <div className="p-2 border rounded bg-background">
                      1. Propriedade (Metadados/SEO)
                    </div>
                    <div className="p-2 border rounded bg-primary text-primary-foreground">
                      2. Page Builder (Canvas)
                    </div>
                    <div className="p-2 border rounded bg-background">
                      3. Propriedades do Elemento
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="col-span-2 border rounded bg-card p-4 space-y-2 min-h-[160px]">
                      <div className="flex justify-between items-center text-xs font-medium border-b pb-2">
                        <span>Canvas de Montagem (Dobras da Página)</span>
                        <span className="text-primary font-bold">+ Adicionar Elemento</span>
                      </div>
                      <div className="border border-dashed p-3 rounded flex items-center justify-between text-xs">
                        <span className="font-mono text-primary font-semibold">HERO BANNER</span>
                        <span className="text-muted-foreground">
                          Alça de arraste (drag) | ⬆️ ⬇️ | Ocultar | Excluir
                        </span>
                      </div>
                      <div className="border border-dashed p-3 rounded flex items-center justify-between text-xs">
                        <span className="font-mono text-primary font-semibold">
                          DYNAMIC_PRICING_TABLE
                        </span>
                        <span className="text-muted-foreground">
                          Alça de arraste (drag) | ⬆️ ⬇️ | Ocultar | Excluir
                        </span>
                      </div>
                    </div>
                    <div className="border rounded bg-card p-3 space-y-2 text-xs">
                      <span className="font-bold text-foreground">Paleta / 20 Elementos:</span>
                      <p className="text-[11px] text-muted-foreground">
                        hero, feature_cards, testimonials, cta, dynamic_pricing_table, gallery,
                        video, text_image, stats_counter, newsletter, accordion, contact_form,
                        team_members, social_proof, rich_text_divider, image, blog_posts_grid,
                        media_carousel, map, timeline.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Destaques Arquiteturais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3 border rounded-lg bg-card space-y-1">
                  <span className="font-bold text-primary">
                    Motor Declarativo (builder-config.ts)
                  </span>
                  <p className="text-muted-foreground">
                    Cada elemento define seções e listas repetíveis. Seção "Identificação"
                    (anchorId) primeira e "Animação" última em todos os 20 elementos.
                  </p>
                </div>
                <div className="p-3 border rounded-lg bg-card space-y-1">
                  <span className="font-bold text-primary">Renderer Unificado WYSIWYG</span>
                  <p className="text-muted-foreground">
                    O mesmo <code className="font-mono">BlockRenderer</code> renderiza os blocos no
                    site público e dentro dos cards de preview do Canvas administrativo em modo
                    pointer-events-none.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
