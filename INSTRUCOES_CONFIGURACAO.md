# Como configurar os serviços do Google

Para que as integrações funcionem perfeitamente, siga os passos abaixo no painel administrativo do seu sistema:

## 1. Google Analytics

1. Acesse o menu **Configurações** > **Analytics e Performance**.
2. Na aba **Google Analytics**, insira o seu "Measurement ID" (que começa com `G-XXXXX`).
3. Selecione quais métricas deseja exibir no painel.
4. Clique em **Salvar Preferências**.
   _Nota: A partir de agora, o sistema injeta automaticamente a tag do Analytics em todas as páginas públicas de forma segura e em toda a jornada do usuário._

## 2. Google Maps

1. Acesse o menu **Configurações** > **Dados do Sistema**.
2. Vá até a aba **Integrações**.
3. Na seção **Google Maps**, insira sua **API Key** gerada no Google Cloud Console (necessita das APIs `Maps Embed API` e `Maps JavaScript API` ativadas no Console do Google).
4. Clique em **Salvar Configurações de Integração**.
   _Nota: O componente de mapa nas páginas usará automaticamente esta chave para renderizar mapas dinâmicos e avançados em vez da visualização básica gratuita._

## 3. reCAPTCHA

1. Acesse o menu **Configurações** > **Dados do Sistema**.
2. Vá até a aba **Integrações**.
3. Na seção **reCaptcha (Segurança)**, insira:
   - **Site Key**: A chave pública do reCAPTCHA v3.
   - **Secret Key**: A chave privada do reCAPTCHA v3.
4. Clique em **Salvar Configurações de Integração**.
   _Nota: A validação agora é feita no servidor através da nova Edge Function segura (`verify-recaptcha`), evitando a exposição da chave privada._

## 4. Google Ads

A sincronização com o Google Ads ocorre automaticamente através da Edge Function `sync-google-ads`. Caso necessite utilizar credenciais reais no futuro, certifique-se de configurar a variável de ambiente `GOOGLE_ADS_REFRESH_TOKEN` nas "Secrets" do Supabase. No momento, o sistema processa métricas sincronizadas na aba **Google Ads** dentro de Configurações > Analytics.
