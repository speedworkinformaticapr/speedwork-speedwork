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

### Standard Components & i18n

- **Data Tables:** All data lists MUST use a standardized `DataTable` component with built-in pagination and sorting to ensure consistency across modules.
- **Internationalization (i18n):** All user-facing text MUST be implemented using the `useTranslation` hook to provide comprehensive multi-language support.
- **Forms & Validation:** Mandate the use of `react-hook-form` coupled with `zod` for all form validations. This ensures strict data integrity for critical fields such as CPF, CNPJ, and Vehicle Plates.

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

### Multi-Tenancy & Row Level Security (RLS)

- **Logical Data Isolation:** The platform uses a `tenant_id` column (UUID) on major configurable tables (like `system_data`, `billing_configuration`, `stripe_config`, `asaas_config`) to ensure logical separation between different organizational environments within the same database.
- **Strict RLS Enforcement:** Every table MUST have active Row Level Security (RLS) policies. These policies must utilize the `tenant_id` (where applicable) and user ownership links (e.g., `user_id` or linked profiles) to guarantee strict multi-tenancy isolation and data security.

## 3. Business Rule Specification

### Registration Flows

- **Hybrid Registration Flow:** The system strictly differentiates between Athletes and Clubs during registration.
  - **Athlete Registration:** Requires mandatory CPF validation. Data is synchronized across the `profiles` and `athletes` tables.
  - **Club Registration:** Requires mandatory CNPJ validation. Data is synchronized across the `profiles` and `clubs` tables.

### Commercial & Financial Flow

- **Budget to Financial Entry:**
  - Budgets (Quotes/Orçamentos) are created with mandatory fields: **Vehicle Plate, KM, Brand, and Model**.
  - Once a Budget is Approved, it automatically converts/generates the respective Financial Entries (Lancamentos Financeiros/Charges) via database triggers.
- **Payment Cycle Logic & Automation:**
  - **Charge Generation & Webhooks:** Integration between the `financial_charges` table, Stripe (and Asaas), and Supabase Edge Functions handles the complete payment cycle. Charges are generated and tracked in `financial_charges`.
  - **Edge Functions:** Supabase Edge Functions (e.g., `process-stripe-payment`, `process-registration-payment`, `generate-affiliation-billing`, `cron-billing-reminders`) manage asynchronous financial tasks. Upon successful payment, webhooks (`stripe-webhook`, `webhook-asaas`) automatically update the `status` and `payment_date` in `financial_charges` and related entities without manual intervention.

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

## 5. Technical Mapping & Performance

- **Frontend Stack:** React, Vite, TypeScript.
- **Routing:** React Router DOM (Declarative Routing).
- **Styling:** Tailwind CSS integrated with Shadcn UI for beautiful, accessible, and consistent components.
- **Icons:** Lucide React (`lucide-react`).
- **Backend & Database:** Supabase (PostgreSQL).

### Performance Optimization

- **Search & Filter Debouncing:** It is mandatory to implement _debounce_ mechanisms on all search and filter inputs across the UI to minimize database overhead and prevent excessive API calls.
- **Offloading Complex Logic:** Complex data processing, such as calculation of athlete statistics or heavy billing generation routines, MUST be offloaded to Supabase Edge Functions to preserve database performance and keep the frontend responsive.
- **Database Indexing Strategy:** Composite indexes must be created on tables with high data volume to optimize query performance. Specifically, indexes are required on tables like `financial_charges` (e.g., on `status`, `due_date`, and `category`) and `audit_logs` (e.g., on `table_name` and `record_id`).

### Database Logic

- Heavy reliance on PostgreSQL features:
  - **Triggers & Functions:** Handles side-effects synchronously, such as generating financial charges upon quote approval (`handle_orcamento_financial_master`, `handle_orcamento_financeiro`), keeping profile data synchronized (`sync_profile_to_usuarios`, `sync_usuarios_to_profiles`), and updating audit logs.
