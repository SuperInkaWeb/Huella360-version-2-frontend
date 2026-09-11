import { Suspense, lazy } from "react";
import type { ComponentType } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { ShoppingBag, BarChart3, Loader2 } from "lucide-react";

// Components
import { Header } from "./components/layouts/Header";
import { Footer } from "./components/layouts/Footer";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { RequiresProfile } from "./components/RequiresProfile";
import { AuthRedirector } from "./components/AuthRedirector";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { CartProvider } from "./features/marketplace/context/CartContext";
import { CartSidebar } from "./features/marketplace/components/CartSidebar";
import { AuthProvider } from "./features/auth/context/AuthContext";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Module = { default: ComponentType<any> } | Record<string, ComponentType<any>>;
const lazyPage = (factory: () => Promise<Module>, name: string) =>
  lazy(() => factory().then((m) => ({ default: (m as Record<string, ComponentType>)[name] || m.default })));

// Lazy Pages
const Home = lazyPage(() => import("./pages/Home"), "Home");
const SobreNosotros = lazyPage(() => import("./pages/SobreNosotros"), "SobreNosotros");
const Empleos = lazyPage(() => import("./pages/Empleos"), "Empleos");
const Blog = lazyPage(() => import("./pages/Blog"), "Blog");
const Contacto = lazyPage(() => import("./pages/Contacto"), "Contacto");
const Privacidad = lazyPage(() => import("./pages/Privacidad"), "Privacidad");
const Terminos = lazyPage(() => import("./pages/Terminos"), "Terminos");
const LibroReclamaciones = lazyPage(() => import("./pages/LibroReclamaciones"), "LibroReclamaciones");
const Devoluciones = lazyPage(() => import("./pages/Devoluciones"), "Devoluciones");
const Cookies = lazyPage(() => import("./pages/Cookies"), "Cookies");

// Feature Pages
const Marketplace = lazyPage(() => import("./features/marketplace/pages/Marketplace"), "Marketplace");
const ProductDetails = lazyPage(() => import("./features/marketplace/pages/ProductDetails"), "ProductDetails");
const CheckoutPage = lazyPage(() => import("./features/marketplace/pages/CheckoutPage"), "CheckoutPage");
const PaymentSuccessPage = lazyPage(() => import("./features/marketplace/pages/PaymentSuccessPage"), "PaymentSuccessPage");
const CompanyProfile = lazyPage(() => import("./features/marketplace/pages/CompanyProfile"), "CompanyProfile");
const CompaniesPage = lazyPage(() => import("./features/marketplace/pages/CompaniesPage"), "CompaniesPage");

// Auth Pages
const Login = lazyPage(() => import("./features/auth/pages/Login"), "Login");
const Register = lazyPage(() => import("./features/auth/pages/Register"), "Register");
const ForgotPassword = lazyPage(() => import("./features/auth/pages/ForgotPassword"), "ForgotPassword");
const ResetPassword = lazyPage(() => import("./features/auth/pages/ResetPassword"), "ResetPassword");
const VerifyEmail = lazyPage(() => import("./features/auth/pages/VerifyEmail"), "VerifyEmail");
const RoleSelectionPage = lazyPage(() => import("./features/auth/pages/RoleSelectionPage"), "RoleSelectionPage");
const ClienteProfilePage = lazyPage(() => import("./features/auth/pages/profiles/ClienteProfilePage"), "ClienteProfilePage");
const VeterinarioProfilePage = lazyPage(() => import("./features/auth/pages/profiles/VeterinarioProfilePage"), "VeterinarioProfilePage");
const EmpresaProfilePage = lazyPage(() => import("./features/auth/pages/profiles/EmpresaProfilePage"), "EmpresaProfilePage");
const RepartidorProfilePage = lazyPage(() => import("./features/auth/pages/profiles/RepartidorProfilePage"), "RepartidorProfilePage");

// Admin Pages
const AdminPortal = lazyPage(() => import("./features/dashboard/admin/pages/AdminPortal"), "AdminPortal");
const Dashboard = lazyPage(() => import("./features/dashboard/admin/pages/Dashboard"), "Dashboard");
const EmpresasPage = lazyPage(() => import("./features/dashboard/admin/pages/EmpresasPage"), "EmpresasPage");
const UsuariosPage = lazyPage(() => import("./features/dashboard/admin/pages/UsuariosPage"), "UsuariosPage");
const CategoriasPage = lazyPage(() => import("./features/dashboard/admin/pages/CategoriasPage"), "CategoriasPage");
const VeterinariosPage = lazyPage(() => import("./features/dashboard/admin/pages/VeterinariosPage"), "VeterinariosPage");
const SubscriptionAdminPage = lazyPage(() => import("./features/dashboard/admin/pages/SubscriptionAdminPage"), "SubscriptionAdminPage");
const AdminComingSoon = lazyPage(() => import("./features/dashboard/admin/components/AdminComingSoon"), "AdminComingSoon");
const PointsConfigAdmin = lazyPage(() => import("./features/dashboard/gamification/components/admin/PointsConfigAdmin"), "PointsConfigAdmin");

// Empresa Pages
const DashboardEmpresa = lazyPage(() => import("./features/dashboard/empresa/pages/DashboardEmpresa"), "DashboardEmpresa");
const DashboardHome = lazyPage(() => import("./features/dashboard/empresa/components/layouts/DashboardHome"), "DashboardHome");
const ServiciosPage = lazyPage(() => import("./features/dashboard/empresa/pages/ServiciosPage"), "ServiciosPage");
const ProductosPage = lazyPage(() => import("./features/dashboard/empresa/pages/ProductosPage"), "ProductosPage");
const EquipoPage = lazyPage(() => import("./features/dashboard/empresa/pages/EquipoPage"), "EquipoPage");
const MySubscriptionPage = lazyPage(() => import("./features/dashboard/empresa/pages/MySubscriptionPage"), "MySubscriptionPage");
const FacturacionPage = lazyPage(() => import("./features/dashboard/empresa/pages/FacturacionPage"), "FacturacionPage");
const ClientesPage = lazyPage(() => import("./features/dashboard/empresa/pages/ClientesPage"), "ClientesPage");
const TalentoPage = lazyPage(() => import("./features/dashboard/empresa/pages/TalentoPage"), "TalentoPage");
const EmpresaPacientesPage = lazyPage(() => import("./features/dashboard/empresa/pages/PacientesPage"), "PacientesPage");
const EmpresaCitasPage = lazyPage(() => import("./features/dashboard/empresa/pages/EmpresaCitasPage"), "EmpresaCitasPage");
const EmpresaConfigPage = lazyPage(() => import("./features/dashboard/empresa/pages/EmpresaConfigPage"), "EmpresaConfigPage");
const OAuthCallbackPage = lazyPage(() => import("./features/dashboard/empresa/pages/OAuthCallbackPage"), "OAuthCallbackPage");
const PaymentSuccessPageEmpresa = lazyPage(() => import("./features/dashboard/empresa/pages/PaymentSuccessPage"), "PaymentSuccessPage");
const CompanyRewardsManagement = lazyPage(() => import("./features/dashboard/gamification/components/company/CompanyRewardsManagement"), "CompanyRewardsManagement");

// Cliente Pages
const DashboardCliente = lazyPage(() => import("./features/dashboard/cliente/components/layouts/DashboardCliente"), "DashboardCliente");
const MascotasPage = lazyPage(() => import("./features/dashboard/cliente/pages/MascotasPage"), "MascotasPage");
const ClienteDashboardHome = lazyPage(() => import("./features/dashboard/cliente/pages/ClienteDashboardHome"), "ClienteDashboardHome");
const MisCompras = lazyPage(() => import("./features/dashboard/cliente/components/MisCompras"), "MisCompras");
const TrackingPage = lazyPage(() => import("./features/dashboard/cliente/pages/TrackingPage"), "TrackingPage");
const ClienteConfigPage = lazyPage(() => import("./features/dashboard/cliente/pages/ClienteConfigPage"), "ClienteConfigPage");
const ClienteSubscriptionPage = lazyPage(() => import("./features/dashboard/cliente/pages/ClienteSubscriptionPage"), "ClienteSubscriptionPage");
const ClientePaymentSuccessPage = lazyPage(() => import("./features/dashboard/cliente/pages/ClientePaymentSuccessPage"), "ClientePaymentSuccessPage");
const ClienteMisServiciosPage = lazyPage(() => import("./features/dashboard/cliente/pages/MisServiciosPage"), "MisServiciosPage");
const MisCitasPage = lazyPage(() => import("./features/dashboard/cliente/pages/MisCitasPage"), "MisCitasPage");
const MisSolicitudesPage = lazyPage(() => import("./features/dashboard/cliente/pages/MisSolicitudesPage"), "MisSolicitudesPage");
const ClientPointsDashboard = lazyPage(() => import("./features/dashboard/gamification/components/client/ClientPointsDashboard"), "ClientPointsDashboard");

// Shared / Other
const AdopcionesPage = lazyPage(() => import("./features/dashboard/shared/adopciones/pages/AdopcionesPage"), "AdopcionesPage");
const MisAdopcionesPage = lazyPage(() => import("./features/dashboard/shared/adopciones/pages/MisAdopcionesPage"), "MisAdopcionesPage");

// Veterinario Pages
const DashboardVeterinario = lazyPage(() => import("./features/dashboard/veterinario/pages/DashboardVeterinario"), "DashboardVeterinario");
const VetHomePage = lazyPage(() => import("./features/dashboard/veterinario/pages/VetHomePage"), "VetHomePage");
const VetServiciosPage = lazyPage(() => import("./features/dashboard/veterinario/pages/VetServiciosPage"), "VetServiciosPage");
const InvitacionesPage = lazyPage(() => import("./features/dashboard/veterinario/pages/InvitacionesPage"), "InvitacionesPage");
const VetConfiguracionPage = lazyPage(() => import("./features/dashboard/veterinario/pages/VetConfiguracionPage"), "VetConfiguracionPage");
const VetCitasPage = lazyPage(() => import("./features/dashboard/veterinario/pages/VetCitasPage"), "VetCitasPage");
const VetPacientesPage = lazyPage(() => import("./features/dashboard/veterinario/pages/VetPacientesPage"), "VetPacientesPage");
const TeleconsultasVetPage = lazyPage(() => import("./features/dashboard/veterinario/pages/TeleconsultasVetPage"), "TeleconsultasVetPage");
const VetSubscriptionPage = lazyPage(() => import("./features/dashboard/veterinario/pages/VetSubscriptionPage"), "VetSubscriptionPage");
const VetPaymentSuccessPage = lazyPage(() => import("./features/dashboard/veterinario/pages/VetPaymentSuccessPage"), "VetPaymentSuccessPage");

// NEW: Client Feature Pages
const MascotaDetailPage = lazyPage(() => import("./features/dashboard/cliente/pages/MascotaDetailPage"), "MascotaDetailPage");
const RecordatoriosPage = lazyPage(() => import("./features/dashboard/cliente/pages/RecordatoriosPage"), "RecordatoriosPage");
const ReferralsPage = lazyPage(() => import("./features/dashboard/cliente/pages/ReferralsPage"), "ReferralsPage");
const TeleconsultasClientePage = lazyPage(() => import("./features/dashboard/cliente/pages/TeleconsultasClientePage"), "TeleconsultasClientePage");
const MisChatsPage = lazyPage(() => import("./features/dashboard/cliente/pages/MisChatsPage"), "MisChatsPage");
const EmpresaChatsPage = lazyPage(() => import("./features/dashboard/empresa/pages/EmpresaChatsPage"), "EmpresaChatsPage");

// NEW: Empresa Feature Pages
const LeadsPage = lazyPage(() => import("./features/dashboard/empresa/pages/LeadsPage"), "LeadsPage");

// Repartidor Pages
const RepartidorDashboard = lazyPage(() => import("./features/dashboard/repartidor/components/RepartidorDashboard"), "RepartidorDashboard");

const LoadingFallback = () => (
  <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
    <Loader2 className="w-10 h-10 animate-spin text-primary-600" />
    <p className="text-slate-500 animate-pulse font-medium">Cargando...</p>
  </div>
);

import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Auth0Provider } from "@auth0/auth0-react";

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {

  const domain = import.meta.env.VITE_AUTH0_DOMAIN;
  const clientId = import.meta.env.VITE_AUTH0_CLIENT_ID;
  const audience = import.meta.env.VITE_AUTH0_AUDIENCE;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: window.location.origin,
        audience: audience,
      }}
      cacheLocation="localstorage"
    >
      <AuthProvider>
        <Router>
          <ScrollToTop />
          <AuthRedirector />
          <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              {/* Rutas publicas: Auth */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/auth/forgot-password" element={<ForgotPassword />} />
              <Route path="/auth/reset-password" element={<ResetPassword />} />
              <Route path="/auth/verify-email" element={<VerifyEmail />} />
              <Route path="/register/rol" element={<RoleSelectionPage />} />

              {/* Formilarios de Perfil (Requieren token del rol, pero perfilCompleto=false) */}
              <Route element={<ProtectedRoute allowedRoles={["CLIENTE"]} />}>
                <Route path="/register/perfil/cliente" element={<ClienteProfilePage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["VETERINARIO"]} />}>
                <Route path="/register/perfil/veterinario" element={<VeterinarioProfilePage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["EMPRESA"]} />}>
                <Route path="/register/perfil/empresa" element={<EmpresaProfilePage />} />
              </Route>

              <Route element={<ProtectedRoute allowedRoles={["REPARTIDOR"]} />}>
                <Route path="/register/perfil/repartidor" element={<RepartidorProfilePage />} />
              </Route>

              {/* Rutas protegidas: Admin (Requiere Perfil Completo) */}
              <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
                <Route element={<RequiresProfile />}>
                  <Route path="/portal/admin" element={<AdminPortal />}>
                    <Route index element={<Dashboard />} />
                    <Route path="empresas" element={<EmpresasPage />} />
                    <Route path="usuarios" element={<UsuariosPage />} />
                    <Route path="categorias" element={<CategoriasPage />} />
                    <Route path="veterinarios" element={<VeterinariosPage />} />
                    <Route path="marketplace" element={<AdminComingSoon {...({ title: "Marketplace", description: "Control global de productos, servicios y transacciones.", icon: ShoppingBag } as any)} />} />
                    <Route path="suscripciones" element={<SubscriptionAdminPage />} />
                    <Route path="gamificacion" element={<PointsConfigAdmin />} />
                    <Route path="reportes" element={<AdminComingSoon {...({ title: "Reportes", description: "Análisis avanzado de datos e inteligencia de negocio.", icon: BarChart3 } as any)} />} />
                  </Route>
                </Route>
              </Route>

              {/* Rutas protegidas: Empresa (Requiere Perfil Completo) */}
              <Route element={<ProtectedRoute allowedRoles={["EMPRESA"]} />}>
                <Route element={<RequiresProfile />}>
                  <Route path="/portal/empresa" element={<DashboardEmpresa />}>
                    <Route index element={<DashboardHome />} />
                    <Route path="servicios" element={<ServiciosPage />} />
                    <Route path="productos" element={<ProductosPage />} />
                    <Route path="equipo" element={<EquipoPage />} />
                    <Route path="leads" element={<LeadsPage />} />
                    <Route path="suscripcion" element={<MySubscriptionPage />} />
                    <Route path="facturacion" element={<FacturacionPage />} />
                    <Route path="clientes" element={<ClientesPage />} />
                    <Route path="chats" element={<EmpresaChatsPage />} />
                    <Route path="adopciones" element={<AdopcionesPage />} />
                    <Route path="mis-adopciones" element={<MisAdopcionesPage />} />
                    <Route path="configuracion" element={<EmpresaConfigPage />} />
                    <Route path="talento" element={<TalentoPage />} />
                    <Route path="pacientes" element={<EmpresaPacientesPage />} />
                    <Route path="citas" element={<EmpresaCitasPage />} />
                    <Route path="recompensas" element={<CompanyRewardsManagement />} />
                    <Route path="oauth/mercadopago" element={<OAuthCallbackPage />} />
                    <Route path="pago-exitoso" element={<PaymentSuccessPageEmpresa />} />
                  </Route>
                </Route>
              </Route>

              {/* Rutas protegidas: Veterinario (Requiere Perfil Completo) */}
              <Route element={<ProtectedRoute allowedRoles={["VETERINARIO"]} />}>
                <Route element={<RequiresProfile />}>
                  <Route path="/portal/veterinario" element={<DashboardVeterinario />}>
                    <Route index element={<VetHomePage />} />
                    <Route path="citas" element={<VetCitasPage />} />
                    <Route path="pacientes" element={<VetPacientesPage />} />
                    <Route path="servicios" element={<VetServiciosPage />} />
                    <Route path="teleconsultas" element={<TeleconsultasVetPage />} />
                    <Route path="invitaciones" element={<InvitacionesPage />} />
                    <Route path="suscripcion" element={<VetSubscriptionPage />} />
                    <Route path="pago-exitoso" element={<VetPaymentSuccessPage />} />
                    <Route path="configuracion" element={<VetConfiguracionPage />} />
                  </Route>
                </Route>
              </Route>

              {/* Rutas protegidas: CLIENTE (Requiere Perfil Completo) */}
              <Route element={<ProtectedRoute allowedRoles={["CLIENTE"]} />}>
                <Route element={<RequiresProfile />}>
                  <Route path="/portal/cliente" element={<DashboardCliente />}>
<Route index element={<ClienteDashboardHome />} />
<Route path="mascotas" element={<MascotasPage />} />
                    <Route path="mascota/:id" element={<MascotaDetailPage />} />
                    <Route path="adopciones" element={<AdopcionesPage />} />
                    <Route path="mis-adopciones" element={<MisAdopcionesPage />} />
                    <Route path="mis-solicitudes" element={<MisSolicitudesPage />} />
                    <Route path="servicios" element={<ClienteMisServiciosPage />} />
                    <Route path="citas" element={<MisCitasPage />} />
                    <Route path="teleconsultas" element={<TeleconsultasClientePage />} />
                    <Route path="chats" element={<MisChatsPage />} />
                    <Route path="recordatorios" element={<RecordatoriosPage />} />
                    <Route path="referidos" element={<ReferralsPage />} />
                    <Route path="configuracion" element={<ClienteConfigPage />} />
                    <Route path="compras" element={<MisCompras />} />
                    <Route path="puntos" element={<ClientPointsDashboard />} />
                    <Route path="tracking/:ordenId" element={<TrackingPage />} />
                    <Route path="suscripcion" element={<ClienteSubscriptionPage />} />
                    <Route path="pago-exitoso" element={<ClientePaymentSuccessPage />} />
                  </Route>
                </Route>
              </Route>

              {/* Rutas protegidas: REPARTIDOR */}
              <Route element={<ProtectedRoute allowedRoles={["REPARTIDOR"]} />}>
                <Route element={<RequiresProfile />}>
                  <Route path="/portal/repartidor" element={<RepartidorDashboard />} />
                </Route>
              </Route>

              {/* Rutas públicas con Layout (Header + Footer) */}
              <Route
                path="*"
                element={
                  <CartProvider>
                    <div className="min-h-screen flex flex-col bg-background-light">
                      <Header />
                      <main className="flex-1 flex flex-col items-center w-full">
                        <Routes>
                          <Route path="/" element={<Home />} />
                          <Route path="/home" element={<Navigate to="/" replace />} />
                          <Route path="/sobre-nosotros" element={<SobreNosotros />} />
                          <Route path="/empleos" element={<Empleos />} />
                          <Route path="/blog" element={<Blog />} />
                          <Route path="/contacto" element={<Contacto />} />
                          <Route path="/privacidad" element={<Privacidad />} />
                          <Route path="/terminos" element={<Terminos />} />
                          <Route path="/libro-reclamaciones" element={<LibroReclamaciones />} />
                          <Route path="/devoluciones" element={<Devoluciones />} />
                          <Route path="/cookies" element={<Cookies />} />

                          <Route
                            path="/marketplace/*"
                            element={
                              <Routes>
                                <Route index element={<Marketplace />} />
                                <Route path="product/:id" element={<ProductDetails />} />
                                <Route path="checkout" element={<CheckoutPage />} />
                                <Route path="success" element={<PaymentSuccessPage />} />
                              </Routes>
                            }
                          />

                          <Route path="/empresas" element={<CompaniesPage />} />
                          <Route path="/empresa/:id" element={<CompanyProfile />} />

                          <Route
                            path="*"
                            element={
                              <div className="p-20 text-center text-slate-500">
                                404 — Página no encontrada
                              </div>
                            }
                          />
                        </Routes>
                      </main>
                      <Footer />
                      <CartSidebar />
                    </div>
                  </CartProvider>
                }
              />
            </Routes>
          </Suspense>
          </ErrorBoundary>
        </Router>
      </AuthProvider>
    </Auth0Provider>
  );
}

export default App;
