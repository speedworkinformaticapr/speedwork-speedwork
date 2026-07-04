DO $$
BEGIN
  UPDATE public.system_data
  SET admin_menu_config = '[
    {"id": "dashboard", "label": "Dashboard", "url": "/admin/dashboard", "icon": "LayoutDashboard"},
    {"id": "comercial", "label": "Comercial", "icon": "Briefcase", "submenus": [
      {"id": "comercial-dashboard", "label": "Dashboard Comercial", "url": "/admin/commercial/dashboard"},
      {"id": "leads", "label": "Leads", "url": "/admin/commercial/leads"},
      {"id": "pipeline", "label": "Pipeline (Kanban)", "url": "/admin/commercial/pipeline"},
      {"id": "activities", "label": "Atividades", "url": "/admin/commercial/activities"},
      {"id": "diagnostic-form", "label": "Diagnóstico", "url": "/admin/commercial/diagnostic-form"},
      {"id": "evaluations", "label": "Avaliações", "url": "/admin/commercial/evaluations"},
      {"id": "quotes", "label": "Orçamentos", "url": "/admin/commercial/quotes"},
      {"id": "pedidos", "label": "Pedidos", "url": "/admin/commercial/orders"},
      {"id": "appointments", "label": "Agendamentos", "url": "/admin/commercial/appointments"}
    ]},
    {"id": "contratos", "label": "Contratos", "icon": "FileText", "submenus": [
      {"id": "contracts-dashboard", "label": "Dashboard", "url": "/admin/contracts/dashboard"},
      {"id": "contracts-list", "label": "Contratos", "url": "/admin/commercial/contracts"},
      {"id": "contracts-wizard", "label": "Novo Contrato", "url": "/admin/contracts/wizard"},
      {"id": "contracts-templates", "label": "Modelos", "url": "/admin/contracts/templates"},
      {"id": "contracts-clauses", "label": "Biblioteca de Cláusulas", "url": "/admin/contracts/clauses"},
      {"id": "contracts-addendums", "label": "Aditivos", "url": "/admin/contracts/addendums"},
      {"id": "contracts-entities", "label": "Entidades", "url": "/admin/contracts/entities"},
      {"id": "contracts-reports", "label": "Relatórios", "url": "/admin/contracts/reports"}
    ]},
    {"id": "financeiro", "label": "Financeiro", "icon": "DollarSign", "submenus": [
      {"id": "financial-dashboard", "label": "Fluxo de Caixa", "url": "/admin/financial"},
      {"id": "chart-of-accounts", "label": "Plano de Contas", "url": "/admin/financial/accounts"},
      {"id": "categories", "label": "Categorias", "url": "/admin/financial/categories"},
      {"id": "partners", "label": "Parceiros", "url": "/admin/financial/partners"},
      {"id": "billing-logs", "label": "Logs de Faturamento", "url": "/admin/financial/billing-logs"},
      {"id": "stripe-config", "label": "Configurações de Pagamento", "url": "/admin/financial/settings"}
    ]},
    {"id": "ecommerce", "label": "E-commerce", "icon": "ShoppingCart", "submenus": [
      {"id": "ecommerce-groups", "label": "Grupos", "url": "/admin/ecommerce/groups"},
      {"id": "ecommerce-products", "label": "Produtos", "url": "/admin/ecommerce/products"},
      {"id": "ecommerce-store-editor", "label": "Editor da Loja", "url": "/admin/ecommerce/store"},
      {"id": "ecommerce-abandoned-carts", "label": "Carrinhos Abandonados", "url": "/admin/ecommerce/abandoned-carts"},
      {"id": "ecommerce-logistics", "label": "Logística", "url": "/admin/ecommerce/logistics"},
      {"id": "ecommerce-orders", "label": "Pedidos", "url": "/admin/ecommerce/orders"}
    ]},
    {"id": "esportes", "label": "Esportes", "icon": "Trophy", "submenus": [
      {"id": "athletes", "label": "Atletas", "url": "/admin/sports/athletes"}
    ]},
    {"id": "configuracoes", "label": "Configurações", "icon": "Settings", "submenus": [
      {"id": "system-data", "label": "Dados do Sistema", "url": "/admin/settings/system"},
      {"id": "users", "label": "Gestão de Usuários", "url": "/admin/users"},
      {"id": "media", "label": "Biblioteca de Mídias", "url": "/admin/settings/media"},
      {"id": "pages", "label": "Páginas", "url": "/admin/settings/pages"},
      {"id": "blog", "label": "Posts do Blog", "url": "/admin/settings/blog"},
      {"id": "maintenance", "label": "Página de Manutenção", "url": "/admin/settings/maintenance"},
      {"id": "menu-config", "label": "Gestão de Menus", "url": "/admin/settings/menu"},
      {"id": "plan-services", "label": "Planos/Serviços", "url": "/admin/settings/plan-services"},
      {"id": "sla-types", "label": "Tipos de SLA", "url": "/admin/settings/sla-types"},
      {"id": "analytics", "label": "Analytics", "url": "/admin/settings/analytics"},
      {"id": "feedback", "label": "Satisfação do Cliente", "url": "/admin/feedback/dashboard"},
      {"id": "sup-tickets", "label": "Tickets de Suporte", "url": "/admin/support/tickets"},
      {"id": "sup-sla", "label": "Configurações de SLA", "url": "/admin/support/sla"},
      {"id": "email-config", "label": "Configurações de E-mail", "url": "/admin/email"}
    ]}
  ]'::jsonb,
  updated_at = NOW()
  WHERE id = '00000000-0000-0000-0000-000000000001'::uuid;
END $$;
