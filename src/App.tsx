import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { useEffect } from 'react'
import { Toaster } from '@/components/ui/toaster'
import { Toaster as Sonner } from '@/components/ui/sonner'
import { TooltipProvider } from '@/components/ui/tooltip'
import Layout from './components/Layout'
import AuthLayout from './components/AuthLayout'
import Index from './pages/Index'
import BlogPost from './pages/blog/BlogPost'
import AdminBlogList from './pages/admin/blog/AdminBlogList'
import AdminBlogForm from './pages/admin/blog/AdminBlogForm'
import Profile from './pages/Profile'
import AthleteProfile from './pages/athlete/AthleteProfile'
import NotFound from './pages/NotFound'
import Login from './pages/Login'
import Register from './pages/Register'
import RegisterClub from './pages/RegisterClub'
import EmailConfirmation from './pages/EmailConfirmation'
import ForgotPassword from './pages/ForgotPassword'
import ResetPassword from './pages/ResetPassword'
import Cart from './pages/store/Cart'
import Checkout from './pages/store/Checkout'
import Orders from './pages/store/Orders'
import AdminGallery from './pages/admin/gallery/AdminGallery'
import AdminDashboard from './pages/admin/dashboard/AdminDashboard'
import AdminPageList from './pages/admin/pages/AdminPageList'
import AdminPageForm from './pages/admin/pages/AdminPageForm'
import PublicPage from './pages/PublicPage'
import ClubDashboard from './pages/club/dashboard/ClubDashboard'
import AdminLayout from './components/admin/AdminLayout'
import AdminMaintenance from './pages/admin/settings/AdminMaintenance'
import AdminUsers from './pages/admin/business/AdminUsers'
import AdminAthleteAttributes from './pages/admin/business/AdminAthleteAttributes'
import AdminAthleteEvaluations from './pages/admin/business/AdminAthleteEvaluations'
import AdminAthleteCategories from './pages/admin/business/AdminAthleteCategories'
import AdminCourses from './pages/admin/business/AdminCourses'
import AdminTournaments from './pages/admin/business/AdminTournaments'
import AdminRanking from './pages/admin/business/AdminRanking'
import AdminRules from './pages/admin/business/AdminRules'
import AdminChartOfAccounts from './pages/admin/financial/AdminChartOfAccounts'
import AdminFinancialCategories from './pages/admin/financial/AdminFinancialCategories'
import AdminFinancialPayments from './pages/admin/financial/AdminFinancialPayments'
import AdminFinancialPartners from './pages/admin/financial/AdminFinancialPartners'
import AdminFinancialSettings from './pages/admin/financial/AdminFinancialSettings'
import AdminBillingLogs from './pages/admin/financial/AdminBillingLogs'
import AdminRegistrationPayments from './pages/admin/financial/AdminRegistrationPayments'
import AdminFinancialDashboard from './pages/admin/financial/AdminFinancialDashboard'
import AdminStripeConfig from './pages/admin/financial/AdminStripeConfig'
import AdminStripePayments from './pages/admin/financial/AdminStripePayments'
import AdminEcommerceGroups from './pages/admin/ecommerce/AdminEcommerceGroups'
import AdminEcommerceProducts from './pages/admin/ecommerce/AdminEcommerceProducts'
import AdminStoreEditor from './pages/admin/ecommerce/AdminStoreEditor'
import AdminAbandonedCarts from './pages/admin/ecommerce/AdminAbandonedCarts'
import AdminCheckoutConfig from './pages/admin/ecommerce/AdminCheckoutConfig'
import AdminOrders from './pages/admin/ecommerce/AdminOrders'
import AdminLogistics from './pages/admin/ecommerce/AdminLogistics'
import AdminAthleteScouting from './pages/admin/business/AdminAthleteScouting'
import AdminPlanServices from './pages/admin/settings/AdminPlanServices'
import AdminSlaTypes from './pages/admin/settings/AdminSlaTypes'
import AdminSystemData from './pages/admin/settings/AdminSystemData'
import AdminMedia from './pages/admin/settings/AdminMedia'
import AdminAnalytics from './pages/admin/settings/AdminAnalytics'
import AdminPublishLogs from './pages/admin/settings/AdminPublishLogs'
import AdminWhatsApp from './pages/admin/whatsapp/AdminWhatsApp'
import AdminEmail from './pages/admin/email/AdminEmail'
import AdminQuotes from './pages/admin/quotes/AdminQuotes'
import AdminServices from './pages/admin/services/AdminServices'
import AdminAppointments from './pages/admin/appointments/AdminAppointments'
import AdminPedidosList from './pages/admin/commercial/AdminPedidosList'
import AdminPedidoForm from './pages/admin/commercial/AdminPedidoForm'
import AdminPedidoView from './pages/admin/commercial/AdminPedidoView'
import AdminContratosList from './pages/admin/commercial/AdminContratosList'
import AdminContratoForm from './pages/admin/commercial/AdminContratoForm'
import AdminContratoView from './pages/admin/commercial/AdminContratoView'
import AdminCommercialDashboard from './pages/admin/commercial/AdminCommercialDashboard'
import QuoteForm from './pages/admin/quotes/QuoteForm'
import QuoteView from './pages/admin/quotes/QuoteView'
import StaffDashboard from './pages/staff/dashboard/StaffDashboard'
import ClientQuotes from './pages/client/quotes/ClientQuotes'
import ClientDashboard from './pages/client/dashboard/ClientDashboard'
import Scheduling from './pages/Scheduling'
import PublicScheduling from './pages/PublicScheduling'
import PublicSchedulingCancel from './pages/PublicSchedulingCancel'
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
import { SidebarProvider } from '@/components/ui/sidebar'

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
            <TooltipProvider>
              <Toaster />
              <Sonner />
              <AccessibilityWidget />
              <Analytics />
              <Routes>
                {/* Auth Routes - Evaluated first to ensure static paths take precedence */}
                <Route element={<AuthLayout />}>
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/register-club" element={<RegisterClub />} />
                  <Route path="/email-confirmation" element={<EmailConfirmation />} />
                  <Route path="/forgot-password" element={<ForgotPassword />} />
                  <Route path="/reset-password" element={<ResetPassword />} />
                </Route>

                {/* Admin Routes - Evaluated second to guarantee static paths precedence */}
                <Route
                  element={
                    <RoleGuard allowedRoles={['admin', 'master']}>
                      <SidebarProvider>
                        <AdminLayout />
                      </SidebarProvider>
                    </RoleGuard>
                  }
                >
                  {' '}
                  <Route path="/admin/quotes" element={<AdminQuotes />} />
                  <Route path="/admin/quotes/new" element={<QuoteForm />} />
                  <Route path="/admin/quotes/:id/edit" element={<QuoteForm />} />
                  <Route path="/admin/quotes/:id" element={<QuoteView />} />
                  <Route
                    path="/admin/commercial/dashboard"
                    element={<AdminCommercialDashboard />}
                  />
                  <Route path="/admin/commercial/pedidos" element={<AdminPedidosList />} />
                  <Route path="/admin/commercial/pedidos/new" element={<AdminPedidoForm />} />
                  <Route path="/admin/commercial/pedidos/:id/edit" element={<AdminPedidoForm />} />
                  <Route path="/admin/commercial/pedidos/:id" element={<AdminPedidoView />} />
                  <Route path="/admin/commercial/contratos" element={<AdminContratosList />} />
                  <Route path="/admin/commercial/contratos/new" element={<AdminContratoForm />} />
                  <Route
                    path="/admin/commercial/contratos/:id/edit"
                    element={<AdminContratoForm />}
                  />
                  <Route path="/admin/commercial/contratos/:id" element={<AdminContratoView />} />
                  <Route path="/admin/services" element={<AdminServices />} />
                  <Route path="/admin/whatsapp" element={<AdminWhatsApp />} />
                  <Route path="/admin/email" element={<AdminEmail />} />
                  <Route path="/admin/appointments" element={<AdminAppointments />} />
                  <Route path="/admin/dashboard" element={<AdminDashboard />} />
                  <Route path="/admin/pages" element={<AdminPageList />} />
                  <Route path="/admin/pages/new" element={<AdminPageForm />} />
                  <Route path="/admin/pages/:id/edit" element={<AdminPageForm />} />
                  <Route path="/admin/blog" element={<AdminBlogList />} />
                  <Route path="/admin/blog/new" element={<AdminBlogForm />} />
                  <Route path="/admin/blog/:id/edit" element={<AdminBlogForm />} />
                  <Route path="/admin/gallery" element={<AdminGallery />} />
                  <Route path="/admin/settings/maintenance" element={<AdminMaintenance />} />
                  <Route path="/admin/settings/system-data" element={<AdminSystemData />} />
                  <Route path="/admin/settings/plan-services" element={<AdminPlanServices />} />
                  <Route path="/admin/settings/sla-types" element={<AdminSlaTypes />} />
                  <Route path="/admin/settings/media" element={<AdminMedia />} />
                  <Route path="/admin/settings/analytics" element={<AdminAnalytics />} />
                  <Route path="/admin/settings/publish-logs" element={<AdminPublishLogs />} />
                  <Route path="/admin/users" element={<AdminUsers />} />
                  <Route path="/admin/athlete-attributes" element={<AdminAthleteAttributes />} />
                  <Route path="/admin/athlete-evaluations" element={<AdminAthleteEvaluations />} />
                  <Route path="/admin/athlete-scouting" element={<AdminAthleteScouting />} />
                  <Route path="/admin/athlete-scouting/:id" element={<AdminAthleteScouting />} />
                  <Route path="/admin/athlete-categories" element={<AdminAthleteCategories />} />
                  <Route path="/admin/courses" element={<AdminCourses />} />
                  <Route path="/admin/tournaments" element={<AdminTournaments />} />
                  <Route path="/admin/ranking" element={<AdminRanking />} />
                  <Route path="/admin/rules" element={<AdminRules />} />
                  <Route
                    path="/admin/financial/categories"
                    element={<AdminFinancialCategories />}
                  />
                  <Route
                    path="/admin/financial/chart-of-accounts"
                    element={<AdminChartOfAccounts />}
                  />
                  <Route path="/admin/financial/payments" element={<AdminFinancialPayments />} />
                  <Route path="/admin/financial/partners" element={<AdminFinancialPartners />} />
                  <Route path="/admin/financial/settings" element={<AdminFinancialSettings />} />
                  <Route path="/admin/financial/billing-logs" element={<AdminBillingLogs />} />
                  <Route
                    path="/admin/financial/registration-payments"
                    element={<AdminRegistrationPayments />}
                  />
                  <Route path="/admin/financial/dashboard" element={<AdminFinancialDashboard />} />
                  <Route path="/admin/financial/stripe-config" element={<AdminStripeConfig />} />
                  <Route
                    path="/admin/financial/stripe-payments"
                    element={<AdminStripePayments />}
                  />
                  <Route path="/admin/ecommerce/groups" element={<AdminEcommerceGroups />} />
                  <Route path="/admin/ecommerce/products" element={<AdminEcommerceProducts />} />
                  <Route path="/admin/ecommerce/store-editor" element={<AdminStoreEditor />} />
                  <Route
                    path="/admin/ecommerce/abandoned-carts"
                    element={<AdminAbandonedCarts />}
                  />
                  <Route
                    path="/admin/ecommerce/checkout-config"
                    element={<AdminCheckoutConfig />}
                  />
                  <Route path="/admin/ecommerce/orders" element={<AdminOrders />} />
                  <Route path="/admin/ecommerce/logistics" element={<AdminLogistics />} />
                </Route>

                {/* Public and Dynamic Routes - Placed last so the catch-all dynamic route does not intercept static ones */}
                <Route
                  element={
                    <MaintenanceGuard>
                      <Layout />
                    </MaintenanceGuard>
                  }
                >
                  <Route path="/" element={<Index />} />
                  <Route path="/blog/:id" element={<BlogPost />} />

                  <Route path="/profile" element={<Profile />} />
                  <Route path="/athlete/:id" element={<AthleteProfile />} />
                  <Route path="/cart" element={<Cart />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/orders" element={<Orders />} />
                  <Route
                    path="/club/dashboard"
                    element={
                      <RoleGuard allowedRoles={['club', 'admin', 'master']}>
                        <ClubDashboard />
                      </RoleGuard>
                    }
                  />

                  <Route
                    path="/staff/dashboard"
                    element={
                      <RoleGuard allowedRoles={['staff', 'admin', 'master']}>
                        <StaffDashboard />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/client/quotes"
                    element={
                      <RoleGuard allowedRoles={['client', 'admin', 'master']}>
                        <ClientQuotes />
                      </RoleGuard>
                    }
                  />
                  <Route
                    path="/client/dashboard"
                    element={
                      <RoleGuard allowedRoles={['client', 'admin', 'master']}>
                        <ClientDashboard />
                      </RoleGuard>
                    }
                  />
                  <Route path="/scheduling" element={<Scheduling />} />
                  <Route path="/agendar/:id" element={<PublicScheduling />} />
                  <Route path="/agendar/cancelar/:id" element={<PublicSchedulingCancel />} />

                  <Route path="/quote/approval/:id" element={<QuoteApprovalPortal />} />

                  {/* Catch-all dynamic routing evaluated only if everything above fails */}
                  <Route path="/:slug" element={<PublicPage />} />
                </Route>

                <Route path="*" element={<NotFound />} />
              </Routes>
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
