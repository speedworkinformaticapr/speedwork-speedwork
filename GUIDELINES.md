# Speedwork Platform Guidelines

## 1. UI/UX Standard Mapping

### Color Palette

- **Primary Color:** Green (`hsl(142 64% 30%)`).
- **Authentication Screens:** Use tech-gradients to provide a modern, dynamic feel.

### Typography

- **Headings:** _Poppins_
- **Body Text:** _Inter_

### Themes & Dark Mode

- Full support for **Dark Mode**.
- Custom themes supported: `dark-tech`, `neon`, and `skip`.

### Layouts

- **AuthLayout:** Centered or split-screen layouts optimized for authentication flows with tech-gradient backgrounds.
- **AdminLayout:** Utilizes a sidebar (`SidebarProvider` from Shadcn UI) for navigating administrative modules.
- **PublicLayout:** Clean, accessible layout for public pages, including headers, footers, and floating accessibility widgets.

## 2. Access Level Architecture & Security

### Roles

The system operates with multiple roles to govern access:

- **`master`:** Ultimate access to all features, including system data and tenant-wide settings.
- **`admin`:** Administrative access within a tenant.
- **`club`:** Access to club-specific management, sporting events, and club athletes.
- **`athlete`:** Access to personal sporting profile, event registration, and financial history.
- **`client`:** Access to commercial interactions, quotes, and service scheduling.
- **`staff`:** Operational access for specific business processes.
- **`user`:** Default base role for authenticated individuals before specific assignments.

### Route Protection (RoleGuard)

- The application uses a `RoleGuard` component to protect routes based on the user's role.
- If a user attempts to access a route they don't have permission for, but possesses multiple roles, they will be prompted to switch to the appropriate role. Otherwise, they are redirected to an unauthorized or fallback page.

### Multi-Tenancy

- **Logical Data Isolation:** The platform uses a `tenant_id` column (UUID) on major configurable tables (like `system_data`, `billing_configuration`, `stripe_config`, `asaas_config`) to ensure logical separation between different organizational environments within the same database.

## 3. Business Rule Specification

### Registration Flows

- **Athlete Registration:** Requires CPF validation.
- **Club Registration:** Requires CNPJ validation.

### Commercial & Financial Flow

- **Budget to Financial Entry:**
  - Budgets (Quotes/Orçamentos) are created with mandatory fields: **Vehicle Plate, KM, Brand, and Model**.
  - Once a Budget is Approved, it automatically converts/generates the respective Financial Entries (Lancamentos Financeiros/Charges) via database triggers.
- **Financial Automation:**
  - **Edge Functions:** Supabase Edge Functions manage asynchronous financial tasks such as auto-generating billing (`generate-affiliation-billing`), sending billing reminders (`cron-billing-reminders`), and processing webhooks (`stripe-webhook`, `webhook-asaas`, `webhook-asaas-manual`).
  - **Gateway Integrations:** The system supports both Stripe and Asaas for credit card and Pix payments.

### Sporting Flow

- **Event Registration:** Evaluates the athlete's handicap and eligibility criteria before confirming registration.
- **Scouting System:** Evaluates athlete attributes, logs values, and calculates statistics (mean, median, standard deviation) utilizing the `calculate-athlete-statistics` Edge Function to compare performance.

## 4. System Configuration Reference

### System Data (`system_data` table)

This table acts as the global settings registry for the platform (or tenant), managing:

- **Branding:** `logo_url`, `browser_icon_url`, `platform_name`, `slogan`.
- **UI Adjustments:** `bg_opacity`, `menu_logo_size`, `dark_mode`, `active_theme`.
- **Business Details:** `cnpj`, `razao_social`, `address_*`, `phone`, `email`, `business_hours`.
- **Application Preferences:** `records_per_page` (default is 50), `scheduling_interval_minutes`, `session_lifetime`.
- **Security:** `two_factor_auth` (boolean), `two_factor_method` (e.g., email).
- **Integrations:** Stored as JSON (`integrations` column) containing API keys for Stripe, Asaas, OpenAI, reCAPTCHA, Google Maps, SMTP/Resend, Evolution API, Twilio, etc.

## 5. Technical Mapping

- **Frontend Stack:** React, Vite, TypeScript.
- **Routing:** React Router DOM (Declarative Routing).
- **Styling:** Tailwind CSS integrated with Shadcn UI for beautiful, accessible, and consistent components.
- **Icons:** Lucide React (`lucide-react`).
- **Backend & Database:** Supabase (PostgreSQL).
- **Database Logic:** Heavy reliance on PostgreSQL features:
  - **RLS (Row Level Security):** Ensures users can only query and mutate data they own or are authorized to see.
  - **Triggers & Functions:** Handles side-effects synchronously, such as generating financial charges upon quote approval (`handle_orcamento_financial_master`, `handle_orcamento_financeiro`), keeping profile data synchronized (`sync_profile_to_usuarios`, `sync_usuarios_to_profiles`), and updating audit logs.
