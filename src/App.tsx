import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { useEffect, lazy } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import AuthLayout from './components/AuthLayout'
import Index from './pages/Index'
import BlogPost from './pages/blog/BlogPost'
import Profile from './pages/Profile'
import AthleteProfile from './pages/athlete/AthleteProfile'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterClub from './pages/RegisterClub'
import EmailConfirmation from './pages/EmailConfirmation'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import MfaVerify from './pages/MfaVerify'
import Forbidden from './pages/Forbidden'
import Cart from './pages/store/Cart'
import Checkout from './pages/store/Checkout'
import Orders from './pages/store/Orders'
import PublicPage from './pages/PublicPage'
import ClubDashboard from './pages/club/dashboard/ClubDashboard'
import AdminLayout from './components/admin/AdminLayout'
import StaffDashboard from './pages/staff/dashboard/StaffDashboard'
import ClientQuotes from './pages/client/quotes/ClientQuotes'
import ClientDashboard from './pages/client/dashboard/ClientDashboard'
import Scheduling from './pages/Scheduling'
import PublicScheduling from './pages/PublicScheduling'
import PublicSchedulingCancel from './pages/PublicSchedulingCancel'
import PublicEvaluation from './pages/evaluation/PublicEvaluation'
import QuoteApprovalPortal from './pages/client/quotes/QuoteApprovalPortal'
import { AuthProvider } from './hooks/use-auth'
import { TranslationProvider } from './hooks/use-translation'
import { SystemDataProvider } from './hooks/use-system-data'
import { MaintenanceGuard } from './components/MaintenanceGuard'
import { AccessibilityWidget } from './components/AccessibilityWidget'
import { ThemeProvider } from './components/theme-provider'
import { FloatingWidgets } from './components/FloatingWidgets'
import { CookieConsent } from './components/CookieConsent'
import { RoleGuard } from './components/RoleGuard'
import { Analytics } from './components/Analytics'
import { ScrollToTop } from './components/ScrollToTop'
import { SidebarProvider } from '@/components/ui/sidebar'

const AdminBlogList = lazy(() => import('./pages/admin/blog/AdminBlogList'))
const AdminBlogForm = lazy(() => import('./pages/admin/blog/AdminBlogForm'))
const AdminGallery = lazy(() => import('./pages/admin/gallery/AdminGallery'))
const AdminDashboard = lazy(() => import('./pages/admin/dashboard/AdminDashboard'))
const AdminPageList = lazy(() => import('./pages/admin/pages/AdminPageList'))
const AdminPageForm = lazy(() => import('./pages/admin/pages/AdminPageForm'))
const AdminMaintenance = lazy(() => import('./pages/admin/settings/AdminMaintenance'))
const AdminUsers = lazy(() => import('./pages/admin/business/AdminUsers'))
const AdminProfileForm = lazy(() => import('./pages/admin/business/AdminProfileForm'))
const AdminChartOfAccounts = lazy(() => import('./pages/admin/financial/AdminChartOfAccounts'))
const AdminFinancialCategories = lazy(
  () => import('./pages/admin/financial/AdminFinancialCategories'),
)
const AdminFinancialPayments = lazy(() => import('./pages/admin/financial/AdminFinancialPayments'))
const AdminFinancialPaymentForm = lazy(
  () => import('./pages/admin/financial/AdminFinancialPaymentForm'),
)
const AdminFinancialPartners = lazy(() => import('./pages/admin/financial/AdminFinancialPartners'))
const AdminFinancialSettings = lazy(() => import('./pages/admin/financial/AdminFinancialSettings'))
const AdminBillingLogs = lazy(() => import('./pages/admin/financial/AdminBillingLogs'))
const AdminRegistrationPayments = lazy(
  () => import('./pages/admin/financial/AdminRegistrationPayments'),
)
const AdminFinancialDashboard = lazy(
  () => import('./pages/admin/financial/AdminFinancialDashboard'),
)
const AdminStripeConfig = lazy(() => import('./pages/admin/financial/AdminStripeConfig'))
const AdminStripePayments = lazy(() => import('./pages/admin/financial/AdminStripePayments'))
const AdminEcommerceGroups = lazy(() => import('./pages/admin/ecommerce/AdminEcommerceGroups'))
const AdminEcommerceProducts = lazy(() => import('./pages/admin/ecommerce/AdminEcommerceProducts'))
const AdminStoreEditor = lazy(() => import('./pages/admin/ecommerce/AdminStoreEditor'))
const AdminAbandonedCarts = lazy(() => import('./pages/admin/ecommerce/AdminAbandonedCarts'))
const AdminCheckoutConfig = lazy(() => import('./pages/admin/ecommerce/AdminCheckoutConfig'))
const AdminOrders = lazy(() => import('./pages/admin/ecommerce/AdminOrders'))
const AdminLogistics = lazy(() => import('./pages/admin/ecommerce/AdminLogistics'))
const AdminPlanServices = lazy(() => import('./pages/admin/settings/AdminPlanServices'))
const CustomerFeedbackDashboard = lazy(
  () => import('./pages/admin/feedback/CustomerFeedbackDashboard'),
)
const AdminSlaTypes = lazy(() => import('./pages/admin/settings/AdminSlaTypes'))
const AdminSystemData = lazy(() => import('./pages/admin/settings/AdminSystemData'))
const AdminMenuConfig = lazy(() => import('./pages/admin/settings/AdminMenuConfig'))
const AdminMedia = lazy(() => import('./pages/admin/settings/AdminMedia'))
const SupportTickets = lazy(() => import('./pages/admin/support/SupportTickets'))
const SupportSlaConfig = lazy(() => import('./pages/admin/support/SupportSlaConfig'))
const AdminAnalytics = lazy(() => import('./pages/admin/settings/AdminAnalytics'))
const AdminPublishLogs = lazy(() => import('./pages/admin/settings/AdminPublishLogs'))
const AdminWhatsApp = lazy(() => import('./pages/admin/whatsapp/AdminWhatsApp'))
const AdminEmail = lazy(() => import('./pages/admin/email/AdminEmail'))
const AdminQuotes = lazy(() => import('./pages/admin/quotes/AdminQuotes'))
const AdminServices = lazy(() => import('./pages/admin/services/AdminServices'))
const AdminAppointments = lazy(
  () => import('./pages/admin/commercial/appointments/AdminAppointments'),
)
const AdminPedidosList = lazy(() => import('./pages/admin/commercial/AdminPedidosList'))
const AdminPedidoForm = lazy(() => import('./pages/admin/commercial/AdminPedidoForm'))
const AdminPedidoView = lazy(() => import('./pages/admin/commercial/AdminPedidoView'))
const AdminContratosList = lazy(() => import('./pages/admin/commercial/AdminContratosList'))
const AdminContratoForm = lazy(() => import('./pages/admin/commercial/AdminContratoForm'))
const AdminContratoView = lazy(() => import('./pages/admin/commercial/AdminContratoView'))
const AdminCommercialDashboard = lazy(
  () => import('./pages/admin/commercial/AdminCommercialDashboard'),
)
const AdminContractsDashboard = lazy(() => import('./pages/admin/contracts/ContractsDashboard'))
const AdminContractWizard = lazy(() => import('./pages/admin/contracts/ContractWizard'))
const AdminTemplateList = lazy(() => import('./pages/admin/contracts/TemplateList'))
const AdminTemplateForm = lazy(() => import('./pages/admin/contracts/TemplateForm'))
const AdminClausesList = lazy(() => import('./pages/admin/contracts/ClausesList'))
const AdminClauseForm = lazy(() => import('./pages/admin/contracts/ClauseForm'))
const AdminEntitiesList = lazy(() => import('./pages/admin/contracts/EntitiesList'))
const AdminContractReports = lazy(() => import('./pages/admin/contracts/Reports'))
const AdminContractView = lazy(() => import('./pages/admin/contracts/ContractView'))
const AdminAddendumsList = lazy(() => import('./pages/admin/contracts/AddendumsList'))
const AdminAddendumForm = lazy(() => import('./pages/admin/contracts/AddendumForm'))
const QuoteForm = lazy(() => import('./pages/admin/quotes/QuoteForm'))
const QuoteView = lazy(() => import('./pages/admin/quotes/QuoteView'))
const AdminLeads = lazy(() => import('./pages/admin/commercial/AdminLeads'))
const AdminPipeline = lazy(() => import('./pages/admin/commercial/AdminPipeline'))
const AdminActivities = lazy(() => import('./pages/admin/commercial/AdminActivities'))
const AdminDiagnosticForm = lazy(() => import('./pages/admin/commercial/AdminDiagnosticForm'))
const AdminLeadDetail = lazy(() => import('./pages/admin/commercial/AdminLeadDetail'))
const AdminEvaluations = lazy(() => import('./pages/admin/commercial/AdminEvaluations'))
const AdminEvaluationDetail = lazy(() => import('./pages/admin/commercial/AdminEvaluationDetail'))

function ScrollToHash() {
  const location = useLocation()

  useEffect(() => {
    if (location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '')
        const element = document.getElementById(id)
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' })
        }
      }, 100)
    }
  }, [location])

  useEffect(() => {
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest('a')

      if (anchor && anchor.hash && anchor.hash !== '#') {
        const isSamePage = anchor.pathname === window.location.pathname

        if (isSamePage) {
          const id = anchor.hash.replace('#', '')
          const element = document.getElementById(id)

          if (element) {
            e.preventDefault()
            element.scrollIntoView({ behavior: 'smooth' })
            window.history.pushState(null, '', anchor.hash)
          }
        }
      }
    }

    document.addEventListener('click', handleAnchorClick, true)
    return () => document.removeEventListener('click', handleAnchorClick, true)
  }, [])

  return null
}

const App = () => (
  <AuthProvider>
    <TranslationProvider>
      <SystemDataProvider>
        <ThemeProvider>
          <BrowserRouter>
            <ScrollToHash />
            <ScrollToTop />
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AccessibilityWidget />
              <Analytics />
              <MaintenanceGuard>
                <Routes>
                  {/* Auth Routes - Evaluated first to ensure static paths take precedence */}
                  <Route element={<AuthLayout />}>
                    <Route path="login" element={<Login />} />
                    <Route path="register" element={<Register />} />
                    <Route path="register-club" element={<RegisterClub />} />
                    <Route path="email-confirmation" element={<EmailConfirmation />} />
                    <Route path="forgot-password" element={<ForgotPassword />} />
                    <Route path="reset-password" element={<ResetPassword />} />
                  </Route>

                  {/* MFA Verification Route */}
                  <Route path="mfa-verify" element={<MfaVerify />} />

                  {/* Admin Routes - Evaluated second to guarantee static paths precedence */}
                  <Route
                    path="admin"
                    element={
                      <RoleGuard allowedRoles={['admin', 'master']}>
                        <SidebarProvider
                          defaultOpen={localStorage.getItem('sidebar_open') !== 'false'}
                        >
                          <AdminLayout />
                        </SidebarProvider>
                      </RoleGuard>
                    }
                  >
                    <Route path="commercial/quotes" element={<AdminQuotes />} />
                    <Route path="commercial/quotes/new" element={<QuoteForm />} />
                    <Route path="commercial/quotes/:id/edit" element={<QuoteForm />} />
                    <Route path="commercial/quotes/:id" element={<QuoteView />} />
                    <Route path="support/tickets" element={<SupportTickets />} />
                    <Route path="support/sla" element={<SupportSlaConfig />} />
                    <Route path="commercial/dashboard" element={<AdminCommercialDashboard />} />
                    <Route path="commercial/orders" element={<AdminPedidosList />} />
                    <Route path="commercial/orders/new" element={<AdminPedidoForm />} />
                    <Route path="commercial/orders/:id/edit" element={<AdminPedidoForm />} />
                    <Route path="commercial/orders/:id" element={<AdminPedidoView />} />
                    <Route path="commercial/contracts" element={<AdminContratosList />} />
                    <Route path="commercial/contracts/new" element={<AdminContratoForm />} />
                    <Route path="commercial/contracts/:id/edit" element={<AdminContratoForm />} />
                    <Route path="commercial/contracts/:id" element={<AdminContratoView />} />
                    <Route
                      path="contracts"
                      element={<Navigate to="/admin/contracts/dashboard" replace />}
                    />
                    <Route path="contracts/dashboard" element={<AdminContractsDashboard />} />
                    <Route path="contracts/wizard" element={<AdminContractWizard />} />
                    <Route path="contracts/templates" element={<AdminTemplateList />} />
                    <Route path="contracts/templates/new" element={<AdminTemplateForm />} />
                    <Route path="contracts/templates/:id/edit" element={<AdminTemplateForm />} />
                    <Route path="contracts/clauses" element={<AdminClausesList />} />
                    <Route path="contracts/clauses/new" element={<AdminClauseForm />} />
                    <Route path="contracts/clauses/:id/edit" element={<AdminClauseForm />} />
                    <Route path="contracts/addendums" element={<AdminAddendumsList />} />
                    <Route path="contracts/addendums/new" element={<AdminAddendumForm />} />
                    <Route path="contracts/addendums/:id/edit" element={<AdminAddendumForm />} />
                    <Route path="contracts/entities" element={<AdminEntitiesList />} />
                    <Route path="contracts/reports" element={<AdminContractReports />} />
                    <Route path="contracts/:id" element={<AdminContractView />} />
                    <Route path="services" element={<AdminServices />} />
                    <Route path="whatsapp" element={<AdminWhatsApp />} />
                    <Route path="email" element={<AdminEmail />} />
                    <Route path="commercial/appointments" element={<AdminAppointments />} />
                    <Route path="commercial/leads" element={<AdminLeads />} />
                    <Route path="commercial/leads/:id" element={<AdminLeadDetail />} />
                    <Route path="commercial/pipeline" element={<AdminPipeline />} />
                    <Route path="commercial/activities" element={<AdminActivities />} />
                    <Route path="commercial/diagnostic-form" element={<AdminDiagnosticForm />} />
                    <Route path="commercial/evaluations" element={<AdminEvaluations />} />
                    <Route path="commercial/evaluations/:id" element={<AdminEvaluationDetail />} />
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="settings/pages" element={<AdminPageList />} />
                    <Route path="settings/pages/new" element={<AdminPageForm />} />
                    <Route path="settings/pages/:id/edit" element={<AdminPageForm />} />
                    <Route path="pages" element={<AdminPageList />} />
                    <Route path="pages/new" element={<AdminPageForm />} />
                    <Route path="pages/:id/edit" element={<AdminPageForm />} />
                    <Route path="settings/blog" element={<AdminBlogList />} />
                    <Route path="settings/blog/new" element={<AdminBlogForm />} />
                    <Route path="settings/blog/:id/edit" element={<AdminBlogForm />} />
                    <Route path="gallery" element={<AdminGallery />} />
                    <Route path="settings/maintenance" element={<AdminMaintenance />} />
                    <Route path="settings/system" element={<AdminSystemData />} />
                    <Route path="settings/menu" element={<AdminMenuConfig />} />
                    <Route path="settings/plan-services" element={<AdminPlanServices />} />
                    <Route path="settings/sla-types" element={<AdminSlaTypes />} />
                    <Route path="settings/media" element={<AdminMedia />} />
                    <Route path="settings/analytics" element={<AdminAnalytics />} />
                    <Route path="settings/publish-logs" element={<AdminPublishLogs />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="users/new" element={<AdminProfileForm />} />
                    <Route path="users/:id/edit" element={<AdminProfileForm />} />
                    {/* Keep legacy routes temporarily to avoid breaking any external bookmarks or unpatched layout links */}
                    <Route path="business/profiles" element={<AdminUsers />} />
                    <Route path="business/profiles/new" element={<AdminProfileForm />} />
                    <Route path="business/profiles/:id/edit" element={<AdminProfileForm />} />
                    <Route path="feedback/dashboard" element={<CustomerFeedbackDashboard />} />
                    <Route path="financial/categories" element={<AdminFinancialCategories />} />
                    <Route path="financial/accounts" element={<AdminChartOfAccounts />} />
                    <Route path="financial/payments" element={<AdminFinancialPayments />} />
                    <Route path="financial/payments/new" element={<AdminFinancialPaymentForm />} />
                    <Route
                      path="financial/payments/:id/edit"
                      element={<AdminFinancialPaymentForm />}
                    />
                    <Route path="financial/partners" element={<AdminFinancialPartners />} />
                    <Route path="financial/settings" element={<AdminStripeConfig />} />
                    <Route path="financial/general-settings" element={<AdminFinancialSettings />} />
                    <Route path="financial/billing-logs" element={<AdminBillingLogs />} />
                    <Route
                      path="financial/registration-payments"
                      element={<AdminRegistrationPayments />}
                    />
                    <Route path="financial/dashboard" element={<AdminFinancialDashboard />} />
                    <Route path="financial/stripe-payments" element={<AdminStripePayments />} />
                    <Route path="ecommerce/groups" element={<AdminEcommerceGroups />} />
                    <Route path="ecommerce/products" element={<AdminEcommerceProducts />} />
                    <Route path="ecommerce/store" element={<AdminStoreEditor />} />
                    <Route path="ecommerce/abandoned-carts" element={<AdminAbandonedCarts />} />
                    <Route path="ecommerce/checkout-config" element={<AdminCheckoutConfig />} />
                    <Route path="ecommerce/orders" element={<AdminOrders />} />
                    <Route path="ecommerce/logistics" element={<AdminLogistics />} />
                  </Route>

                  {/* Public and Dynamic Routes - Placed last so the catch-all dynamic route does not intercept static ones */}
                  <Route element={<Layout />}>
                    <Route index element={<Index />} />
                    <Route path="blog/:id" element={<BlogPost />} />

                    <Route path="profile" element={<Profile />} />
                    <Route path="athlete/:id" element={<AthleteProfile />} />
                    <Route path="cart" element={<Cart />} />
                    <Route path="checkout" element={<Checkout />} />
                    <Route path="orders" element={<Orders />} />
                    <Route
                      path="club/dashboard"
                      element={
                        <RoleGuard allowedRoles={['club', 'admin', 'master']}>
                          <ClubDashboard />
                        </RoleGuard>
                      }
                    />

                    <Route
                      path="staff/dashboard"
                      element={
                        <RoleGuard allowedRoles={['staff', 'admin', 'master']}>
                          <StaffDashboard />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="client/quotes"
                      element={
                        <RoleGuard allowedRoles={['client', 'admin', 'master']}>
                          <ClientQuotes />
                        </RoleGuard>
                      }
                    />
                    <Route
                      path="client/dashboard"
                      element={
                        <RoleGuard allowedRoles={['client', 'admin', 'master']}>
                          <ClientDashboard />
                        </RoleGuard>
                      }
                    />
                    <Route path="scheduling" element={<Scheduling />} />
                    <Route path="agendar/:id" element={<PublicScheduling />} />
                    <Route path="agendar/cancelar/:id" element={<PublicSchedulingCancel />} />

                    <Route path="quote/approval/:id" element={<QuoteApprovalPortal />} />
                    <Route path="avaliar" element={<PublicEvaluation />} />
                    <Route path="avaliar/:serviceSlug" element={<PublicEvaluation />} />

                    {/* Catch-all dynamic routing evaluated only if everything above fails */}
                    <Route path=":slug" element={<PublicPage />} />
                  </Route>

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </MaintenanceGuard>
              <FloatingWidgets />
              <CookieConsent />
            </TooltipProvider>
          </BrowserRouter>
        </ThemeProvider>
      </SystemDataProvider>
    </TranslationProvider>
  </AuthProvider>
)

export default App
