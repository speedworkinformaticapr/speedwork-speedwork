DO $$
BEGIN
  UPDATE public.system_data
  SET admin_menu_config = '[
    {"id": "comercial", "label": "Comercial", "icon": "Briefcase", "items": [
      {"id": "com-dashboard", "label": "Dashboard", "path": "/admin/commercial/dashboard"},
      {"id": "com-pedidos", "label": "Pedidos", "path": "/admin/commercial/pedidos"},
      {"id": "com-orcamentos", "label": "Orçamentos", "path": "/admin/quotes"},
      {"id": "com-contratos", "label": "Contratos", "path": "/admin/commercial/contratos"}
    ]},
    {"id": "gestao-esportiva", "label": "Gestão Esportiva", "icon": "Trophy", "items": [
      {"id": "esp-atletas", "label": "Atletas", "path": "/admin/users"},
      {"id": "esp-atributos", "label": "Atributos", "path": "/admin/athlete-attributes"},
      {"id": "esp-avaliacoes", "label": "Avaliações", "path": "/admin/athlete-evaluations"},
      {"id": "esp-categorias", "label": "Categorias", "path": "/admin/athlete-categories"},
      {"id": "esp-torneios", "label": "Torneios", "path": "/admin/tournaments"},
      {"id": "esp-cursos", "label": "Cursos", "path": "/admin/courses"},
      {"id": "esp-ranking", "label": "Ranking", "path": "/admin/ranking"},
      {"id": "esp-regras", "label": "Regras", "path": "/admin/rules"}
    ]},
    {"id": "financeiro", "label": "Financeiro", "icon": "DollarSign", "items": [
      {"id": "fin-dashboard", "label": "Dashboard", "path": "/admin/financial/dashboard"},
      {"id": "fin-plano-contas", "label": "Plano de Contas", "path": "/admin/financial/chart-of-accounts"},
      {"id": "fin-categorias", "label": "Categorias", "path": "/admin/financial/categories"},
      {"id": "fin-pagamentos", "label": "Pagamentos", "path": "/admin/financial/payments"},
      {"id": "fin-parceiros", "label": "Parceiros", "path": "/admin/financial/partners"},
      {"id": "fin-stripe", "label": "Configurações Stripe", "path": "/admin/financial/stripe-config"}
    ]},
    {"id": "ecommerce", "label": "E-commerce", "icon": "ShoppingCart", "items": [
      {"id": "eco-loja", "label": "Loja", "path": "/admin/ecommerce/store-editor"},
      {"id": "eco-produtos", "label": "Produtos", "path": "/admin/ecommerce/products"},
      {"id": "eco-grupos", "label": "Grupos", "path": "/admin/ecommerce/groups"},
      {"id": "eco-pedidos", "label": "Pedidos", "path": "/admin/ecommerce/orders"},
      {"id": "eco-abandonados", "label": "Carrinhos Abandonados", "path": "/admin/ecommerce/abandoned-carts"},
      {"id": "eco-logistica", "label": "Logística", "path": "/admin/ecommerce/logistics"}
    ]},
    {"id": "configuracoes", "label": "Configurações", "icon": "Settings", "items": [
      {"id": "cfg-sistema", "label": "Dados do Sistema", "path": "/admin/settings/system-data"},
      {"id": "cfg-menu", "label": "Gestão de Menus", "path": "/admin/settings/menu"},
      {"id": "cfg-manutencao", "label": "Manutenção", "path": "/admin/settings/maintenance"},
      {"id": "cfg-midias", "label": "Mídias", "path": "/admin/settings/media"},
      {"id": "cfg-blog", "label": "Blog", "path": "/admin/blog"},
      {"id": "cfg-paginas", "label": "Páginas", "path": "/admin/pages"}
    ]}
  ]'::jsonb
  WHERE admin_menu_config IS NULL OR jsonb_typeof(admin_menu_config) = 'null' OR jsonb_array_length(admin_menu_config) = 0;
END $$;
