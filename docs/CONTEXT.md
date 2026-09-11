# Contexto Completo — Huella360 Frontend

> Documento maestro del frontend. Autocontenido. Cualquier agente o desarrollador debe entender el proyecto solo con leer este archivo.

---

## 1. Visión del Proyecto

**Huella360** es el frontend de una plataforma SaaS integral para la gestión de veterinarias, marketplace de productos/servicios para mascotas, y próximamente **plataforma de interoperabilidad de salud animal** con IA y Big Data.

El frontend está construido con **React 19 + TypeScript + Vite** y sigue una arquitectura **Feature-First** con 5 portales de usuario según rol.

---

## 2. Stack Tecnológico

| Componente | Tecnología | Versión |
|------------|-----------|---------|
| Framework | React | 19.2.0 |
| Lenguaje | TypeScript | ~5.9.3 |
| Build Tool | Vite | 7.2.4 |
| SWC Plugin | @vitejs/plugin-react-swc | 4.2.2 |
| CSS | Tailwind CSS | 4.1.18 |
| Routing | react-router-dom | 7.13.0 |
| Server State | TanStack React Query | 5.90.21 |
| Auth | Auth0 (@auth0/auth0-react) | 2.17.0 |
| HTTP Client | Axios | 1.13.4 |
| Forms | React Hook Form + Zod | 7.71.1 / 4.3.6 |
| WebSocket | @stomp/stompjs + sockjs-client | 7.3.0 / 1.6.1 |
| Icons | Lucide React | 0.563.0 |
| Charts | Recharts | 3.7.0 |
| Maps | Leaflet + react-leaflet | 1.9.4 / 5.0.0 |
| Animations | Motion (Framer Motion) | 12.42.2 |
| Toasts | react-hot-toast | 2.6.0 |
| Modals | SweetAlert2 | 11.26.18 |
| Confetti | react-confetti | 6.4.0 |
| SEO | react-helmet-async | 3.0.0 |
| Error Tracking | @sentry/react | 10.65.0 |
| Date Utils | date-fns | 4.1.0 |
| Testing | Vitest + @testing-library/react | 3.2.4 / 16.3.0 |
| Linting | ESLint 9 + typescript-eslint | 9.39.1 |
| Package Manager | pnpm | (lockfile) |
| Deployment | Vercel | (vercel.json) |

---

## 3. Arquitectura

### 3.1 Estructura de Carpetas (Feature-First)

```
src/
├── main.tsx                    # Entry point
├── App.tsx                     # Root con todas las rutas
├── index.css                   # Tailwind + tema custom
├── types/                      # Tipos globales
│   └── mercadopago.d.ts
├── pages/                      # Páginas estáticas públicas (11)
├── sections/                   # Secciones homepage (9)
├── components/                 # Componentes compartidos
│   ├── ui/                     # Button.tsx, Input.tsx
│   ├── layouts/                # Header.tsx, Footer.tsx
│   ├── ProtectedRoute.tsx
│   ├── RequiresProfile.tsx
│   ├── AuthRedirector.tsx
│   ├── ErrorBoundary.tsx
│   ├── LogoutButton.tsx
│   ├── UserDropdown.tsx
│   └── Seo.tsx
├── shared/                     # Utilidades compartidas
│   ├── http/                   # API client (axios)
│   ├── types/                  # ApiResponse, PageResponse
│   ├── data/                   # peru-locations.ts
│   └── sentry.ts
└── features/                   # Módulos por feature
    ├── auth/                   # Autenticación
    ├── marketplace/            # Marketplace público
    ├── catalog/                # Categorías, productos, servicios
    ├── dashboard/              # Portales por rol
    │   ├── admin/              # Portal administrador
    │   ├── empresa/            # Portal empresa/veterinaria
    │   ├── cliente/            # Portal cliente/dueño
    │   ├── veterinario/        # Portal veterinario
    │   ├── repartidor/         # Portal repartidor
    │   ├── shared/             # Componentes compartidos entre roles
    │   └── gamification/       # Sistema de puntos y recompensas
    ├── health-card/            # Carnet de salud PDF
    ├── ia-alerts/              # Alertas IA
    └── teleconsulta/           # Consultas virtuales
```

### 3.2 Portales de Usuario

| Portal | Ruta Base | Rol | Funcionalidades |
|--------|-----------|-----|-----------------|
| Admin | `/portal/admin` | ADMIN | Stats, empresas, usuarios, veterinarios, categorías, suscripciones, gamificación |
| Empresa | `/portal/empresa` | EMPRESA | Dashboard, servicios, productos, equipo, leads, suscripciones, billing, adopciones, citas, pacientes, recompensas, config |
| Cliente | `/portal/cliente` | CLIENTE | Mascotas, adopciones, servicios, citas, teleconsultas, recordatorios, referidos, puntos, compras, tracking, suscripción, config |
| Veterinario | `/portal/veterinario` | VETERINARIO | Inicio, citas, pacientes, servicios, teleconsultas, invitaciones, suscripción, config |
| Repartidor | `/portal/repartidor` | REPARTIDOR | App móvil completa: pedidos, GPS tracking, OTP, foto, incidencias, historial, perfil |

---

## 4. Rutas y Páginas

### 4.1 Rutas Públicas

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/` | Home | Homepage con 9 secciones |
| `/sobre-nosotros` | SobreNosotros | Nosotros |
| `/empleos` | Empleos | Empleos |
| `/blog` | Blog | Blog (stub) |
| `/contacto` | Contacto | Contacto |
| `/privacidad` | Privacidad | Política privacidad |
| `/terminos` | Terminos | Términos |
| `/libro-reclamaciones` | LibroReclamaciones | Libro reclamaciones |
| `/devoluciones` | Devoluciones | Devoluciones |
| `/cookies` | Cookies | Cookies |
| `/marketplace` | Marketplace | Buscador productos |
| `/marketplace/product/:id` | ProductDetails | Detalle producto |
| `/marketplace/checkout` | CheckoutPage | Checkout |
| `/marketplace/success` | PaymentSuccessPage | Pago exitoso |
| `/empresas` | CompaniesPage | Listado empresas |
| `/empresa/:id` | CompanyProfile | Perfil empresa |

### 4.2 Rutas de Auth

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/login` | Login | Login |
| `/register` | Register | Registro |
| `/auth/forgot-password` | ForgotPassword | Olvidé contraseña |
| `/auth/reset-password` | ResetPassword | Reset contraseña |
| `/auth/verify-email` | VerifyEmail | Verificar email |
| `/register/rol` | RoleSelectionPage | Selección de rol |

### 4.3 Rutas de Perfil (Post-registro)

| Ruta | Componente | Rol |
|------|------------|-----|
| `/register/perfil/cliente` | ClienteProfilePage | CLIENTE |
| `/register/perfil/veterinario` | VeterinarioProfilePage | VETERINARIO |
| `/register/perfil/empresa` | EmpresaProfilePage | EMPRESA |
| `/register/perfil/repartidor` | RepartidorProfilePage | REPARTIDOR |

### 4.4 Portal Admin (`/portal/admin`)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/portal/admin` | Dashboard | Stats globales |
| `/portal/admin/empresas` | EmpresasPage | Gestión empresas |
| `/portal/admin/usuarios` | UsuariosPage | Gestión usuarios |
| `/portal/admin/categorias` | CategoriasPage | CRUD categorías |
| `/portal/admin/veterinarios` | VeterinariosPage | Gestión veterinarios |
| `/portal/admin/marketplace` | AdminComingSoon | Próximamente |
| `/portal/admin/suscripciones` | SubscriptionAdminPage | Admin suscripciones |
| `/portal/admin/gamificacion` | PointsConfigAdmin | Config puntos |
| `/portal/admin/reportes` | AdminComingSoon | Próximamente |

### 4.5 Portal Empresa (`/portal/empresa`)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/portal/empresa` | DashboardHome | KPIs + gráficos |
| `/portal/empresa/servicios` | ServiciosPage | CRUD servicios |
| `/portal/empresa/productos` | ProductosPage | CRUD productos |
| `/portal/empresa/equipo` | EquipoPage | Staff management |
| `/portal/empresa/leads` | LeadsPage | Leads comerciales |
| `/portal/empresa/suscripcion` | MySubscriptionPage | Mi suscripción |
| `/portal/empresa/facturacion` | FacturacionPage | Billing/órdenes |
| `/portal/empresa/adopciones` | AdopcionesPage | Adopciones públicas |
| `/portal/empresa/mis-adopciones` | MisAdopcionesPage | Mis adopciones |
| `/portal/empresa/configuracion` | EmpresaConfigPage | Config empresa |
| `/portal/empresa/talento` | TalentoPage | Talento |
| `/portal/empresa/pacientes` | PacientesPage | Pacientes (mascotas atendidas) |
| `/portal/empresa/citas` | EmpresaCitasPage | Citas médicas |
| `/portal/empresa/recompensas` | CompanyRewardsManagement | CRUD recompensas |
| `/portal/empresa/oauth/mercadopago` | OAuthCallbackPage | MP OAuth callback |
| `/portal/empresa/pago-exitoso` | PaymentSuccessSuccessPage | Pago exitoso |

### 4.6 Portal Veterinario (`/portal/veterinario`)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/portal/veterinario` | VetHomePage | Inicio |
| `/portal/veterinario/citas` | VetCitasPage | Citas |
| `/portal/veterinario/pacientes` | VetPacientesPage | Pacientes |
| `/portal/veterinario/servicios` | VetServiciosPage | Servicios |
| `/portal/veterinario/teleconsultas` | TeleconsultasVetPage | Teleconsultas |
| `/portal/veterinario/invitaciones` | InvitacionesPage | Invitaciones de empresas |
| `/portal/veterinario/suscripcion` | VetSubscriptionPage | Suscripción |
| `/portal/veterinario/pago-exitoso` | VetPaymentSuccessPage | Pago exitoso |
| `/portal/veterinario/configuracion` | VetConfiguracionPage | Config |

### 4.7 Portal Cliente (`/portal/cliente`)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/portal/cliente` | ClienteDashboardHome | Inicio |
| `/portal/cliente/mascotas` | MascotasPage | Mis mascotas |
| `/portal/cliente/mascota/:id` | MascotaDetailPage | Detalle mascota |
| `/portal/cliente/adopciones` | AdopcionesPage | Adopciones disponibles |
| `/portal/cliente/mis-adopciones` | MisAdopcionesPage | Mis adopciones publicadas |
| `/portal/cliente/mis-solicitudes` | MisSolicitudesPage | Mis solicitudes |
| `/portal/cliente/servicios` | ClienteMisServiciosPage | Servicios contratados |
| `/portal/cliente/citas` | MisCitasPage | Mis citas |
| `/portal/cliente/teleconsultas` | TeleconsultasClientePage | Teleconsultas |
| `/portal/cliente/recordatorios` | RecordatoriosPage | Recordatorios |
| `/portal/cliente/referidos` | ReferralsPage | Referidos |
| `/portal/cliente/configuracion` | ClienteConfigPage | Config |
| `/portal/cliente/compras` | MisCompras | Historial compras |
| `/portal/cliente/puntos` | ClientPointsDashboard | Puntos y recompensas |
| `/portal/cliente/tracking/:ordenId` | TrackingPage | Tracking delivery |
| `/portal/cliente/suscripcion` | ClienteSubscriptionPage | Suscripción |
| `/portal/cliente/pago-exitoso` | ClientePaymentSuccessPage | Pago exitoso |

### 4.8 Portal Repartidor (`/portal/repartidor`)

| Ruta | Componente | Descripción |
|------|------------|-------------|
| `/portal/repartidor` | RepartidorDashboard | App completa (GPS, pedidos, OTP, foto) |

---

## 5. Componentes Principales

### 5.1 Componentes Globales (`src/components/`)

| Componente | Archivo | Descripción |
|------------|---------|-------------|
| Button | `ui/Button.tsx` | Variantes: primary, secondary, outline, ghost, danger |
| Input | `ui/Input.tsx` | Input con label, error, helperText, forwardRef |
| Header | `layouts/Header.tsx` | Header público con navegación |
| Footer | `layouts/Footer.tsx` | Footer público |
| ProtectedRoute | `ProtectedRoute.tsx` | Guard: auth + role |
| RequiresProfile | `RequiresProfile.tsx` | Guard: perfil completo |
| AuthRedirector | `AuthRedirector.tsx` | Auto-redirect autenticados |
| ErrorBoundary | `ErrorBoundary.tsx` | Error boundary con retry |
| LogoutButton | `LogoutButton.tsx` | Logout con SweetAlert2 |
| UserDropdown | `UserDropdown.tsx` | Dropdown usuario |
| Seo | `Seo.tsx` | Meta tags dinámicos |

### 5.2 Componentes por Feature

| Feature | Componentes Principales |
|---------|------------------------|
| **Auth** | Login, Register, ForgotPassword, ResetPassword, VerifyEmail, RoleSelectionPage, 4 profile forms |
| **Marketplace** | CartSidebar, CompanyCard, MapView, MarketplaceSidebar, ProductCard |
| **Admin** | StatsGrid, ActivityTable, CategoryModal, CompanyDetailModal, UserDetailModal, VeterinarioDetailModal |
| **Empresa** | DashboardHome, InviteStaffModal, MapPicker, ProductFormModal, ServiceFormModal |
| **Cliente** | PetCard, PetFormModal, MisCompras, DeliveryMap, InvoiceModal, RatingModal |
| **Veterinario** | MedicalRecordModal, VetServiceModal |
| **Repartidor** | RepartidorDashboard (app completa, 684 líneas) |
| **Adopciones** | PublicarAdopcionModal, PostularAdopcionModal, GestionarSolicitudModal |
| **Citas** | AgendarCitaModal |
| **Gamification** | PointsConfigAdmin, ClientPointsDashboard, RewardsStore, CompanyRewardsManagement |
| **Health Card** | HealthCard (PDF) |
| **IA Alerts** | AlertasIA |
| **Teleconsulta** | ChatTeleconsulta |

---

## 6. Servicios API

### 6.1 HTTP Client (`src/shared/http/`)

**api.ts**: Instancia Axios con:
- Base URL: `VITE_API_URL` (http://localhost:8080/api/v1)
- Interceptor request: inyecta Bearer token (Auth0)
- Interceptor response: 401 → "Sesión expirada" + redirect login; 409 → conflict; 413 → file too large

**publicEndpoints.ts**: Lógica de endpoints públicos (siempre públicos, GET público, siempre protegidos)

### 6.2 Servicios por Feature

| Feature | Servicio | Métodos Principales |
|---------|----------|---------------------|
| Auth | `authService.ts` | login, register, changePassword, logoutAll, forgotPassword, resetPassword, verifyEmail |
| Auth | `profileService.ts` | createCliente/Veterinario/Empresa/RepartidorProfile, getProfile |
| Marketplace | `marketplaceService.ts` | searchProducts, getProductById, getCategories, getCompanies, createOrder, getPaymentLink |
| Admin | `adminService.ts` | getStats, getCompanies/Users/Veterinarios, toggleStatus, CRUD categories |
| Empresa | `serviceService.ts` | getMyServices, create/update/deleteService (multipart) |
| Empresa | `productService.ts` | getMyProducts, create/update/deleteProduct (multipart) |
| Empresa | `staffService.ts` | getMyStaff, inviteStaff, removeStaff |
| Empresa | `billingService.ts` | getMyOrders, generateCheckout |
| Empresa | `dashboardService.ts` | getMetrics |
| Empresa | `leadService.ts` | getMyLeads, countMyLeads, updateLeadStatus |
| Cliente | `petService.ts` | getMyPets, getPetById, create/update/deletePet (multipart) |
| Cliente | `deliveryService.ts` | getByOrden, cancelarDelivery, calificar |
| Cliente | `recordatorioService.ts` | getMyRecordatorios, create/deleteRecordatorio |
| Cliente | `referralService.ts` | getMyCode, getMyCount, applyCode |
| Veterinario | `vetService.ts` | getMyProfile/Services/Invitations, accept/rejectInvitation, CRUD services, getMyPatients, getMedicalHistory, addMedicalRecord |
| Repartidor | `repartidorService.ts` | getPerfil, actualizarPerfil/Ubicacion, cambiarDisponibilidad, getDeliveryActivo, confirmarOTP/Foto, getPedidosDisponibles, aceptarPedido, reportarIncidencia, getHistorial |
| Adopciones | `adoptionService.ts` | publishAdoption, getAvailable/MyAdoptions, applyForAdoption, getApplications, respondToApplication |
| Citas | `appointmentService.ts` | create, getMyCitas, getCitasByEmpresa, updateStatus |
| Suscripciones | `subscriptionService.ts` | getUsageMetrics, getPlans, getMySubscription, updatePlan, createCheckout |
| Gamification | `gamification.service.ts` | getPointsConfig, getClientDashboard, getActiveRewards, redeemReward, CRUD company rewards |
| Teleconsulta | `teleconsultaService.ts` | createConsulta, getMyConsultas, getMensajes, sendMessage, accept/start/finish/cancel |
| Health Card | `healthCardService.ts` | downloadHealthCard (Blob) |
| IA Alerts | `iaAlertsService.ts` | generateHealthAlerts |
| Categorías | `categoryService.ts` | getAllCategories, getSubcategories |

---

## 7. Estado

### 7.1 Context API (3 Contexts)

| Context | Archivo | Estado |
|---------|---------|--------|
| AuthContext | `auth/context/AuthContext.tsx` | isAuthenticated, role, userId, empresaId, nombre, perfilCompleto, login(), logout() |
| CartContext | `marketplace/context/CartContext.tsx` | items, isOpen, addToCart(), removeFromCart(), clearCart(), cartCount, cartTotal (persisted localStorage) |
| QueryClientProvider | `main.tsx` | Server state (React Query) |

### 7.2 localStorage

| Key | Contenido |
|-----|-----------|
| `token` | JWT token |
| `userRole` | Rol del usuario |
| `empresaId` | ID de empresa |
| `userNombre` | Nombre del usuario |
| `perfilCompleto` | Boolean perfil completado |
| `userId` | ID del usuario |
| `vetsaas_cart` | Carrito de compras |

### 7.3 WebSocket

| Conexión | Uso |
|----------|-----|
| STOMP `/api/v1/ws` | GPS tracking repartidor |
| `/user/queue/pedidos` | Asignación directa de pedidos |
| `/topic/pedidos-disponibles` | Pool público de pedidos |
| `/topic/pedidos-pool-update` | Actualización del pool |
| `/app/tracking/{deliveryId}/ubicacion` | Envío de posición GPS |

---

## 8. Autenticación

### Proveedor: Auth0

| Config | Valor |
|--------|-------|
| Domain | `dev-zg0aldkj2slve32o.us.auth0.com` |
| Client ID | `ukAJSpu8biox335y1u947vdzhqTEfY0m` |
| Audience | `https://api.vetsaastest.com` |
| Cache | localstorage |

### Flujo de Autenticación

```
1. Usuario hace login → Auth0 loginWithRedirect()
2. Auth0 redirige con tokens
3. AuthContext lee custom claims: role, empresaId, nombre
4. Sync con backend GET /users/me → obtiene backend role + userId
5. Verifica perfil completo (GET /clients/me, /companies/me, etc.)
6. Si perfil incompleto → redirect a formulario de perfil
7. Si perfil completo → redirect al portal según rol
```

### Guards de Ruta

| Guard | Lógica |
|-------|--------|
| ProtectedRoute | Verifica isAuthenticated + role en allowedRoles[] |
| RequiresProfile | Verifica perfilCompleto (segundo barrier) |
| AuthRedirector | Auto-redirect en cada navegación |

### Mapa de Redirects

```
ADMIN → /portal/admin
EMPRESA → /portal/empresa
CLIENTE → /portal/cliente
VETERINARIO → /portal/veterinario
REPARTIDOR → /portal/repartidor
```

---

## 9. Formularios

### React Hook Form + Zod

- **React Hook Form**: v7.71.1
- **@hookform/resolvers**: v5.2.2
- **Zod**: v4.3.6

### Formularios que usan React Hook Form

- 4 páginas de creación de perfil (Cliente, Veterinario, Empresa, Repartidor)
- Modales de creación/edición de productos
- Modales de creación/edición de servicios
- Modal de creación/edición de mascotas
- Modal de publicación de adopción
- Modal de agendamiento de citas

### Formularios SIN React Hook Form

- Página de Contacto (HTML form sin handler)
- RepartidorDashboard (useState para OTP)

---

## 10. UI / Design System

### No hay librería de componentes externa (MUI, Chadcn, etc.)

Se usa:
1. **Tailwind CSS 4** — Utility-first styling
2. **Componentes custom**: Button, Input (solo 2 base components)
3. **Lucide React** — Iconos
4. **Material Icons** — Algunos iconos legacy
5. **SweetAlert2** — Modales de confirmación
6. **React Hot Toast** — Toast notifications
7. **Recharts** — Gráficos
8. **Leaflet** — Mapas
9. **Motion** — Animaciones

### Tema Custom (`index.css`)

```css
--color-primary: #1FA698        (teal green)
--color-primary-dark: #1CA68D
--color-secondary: #3A4E8C      (dark blue)
--color-secondary-bold: #0511F2
--color-background: #F6F8F8
--color-surface: #FFFFFF
--font-sans: "Montserrat", sans-serif
```

### Animaciones Custom

- `float` — Flotación suave
- `scroll` — Scroll continuo
- `pulse-slow` — Pulso lento
- `glass-nav` — Efecto vidrio
- `card-hover` — Hover elevación

---

## 11. Variables de Entorno

| Variable | Valor (dev) | Propósito |
|----------|-------------|-----------|
| `VITE_API_URL` | `http://localhost:8080/api/v1` | Backend API URL |
| `VITE_WS_URL` | `http://localhost:8080` | WebSocket URL |
| `VITE_AUTH0_DOMAIN` | `dev-zg0aldkj2slve32o.us.auth0.com` | Auth0 tenant |
| `VITE_AUTH0_CLIENT_ID` | `ukAJSpu8biox335y1u947vdzhqTEfY0m` | Auth0 client |
| `VITE_AUTH0_AUDIENCE` | `https://api.vetsaastest.com` | Auth0 API audience |
| `VITE_MP_PUBLIC_KEY` | `APP_USR-6ce80471-...` | MercadoPago public key |
| `VITE_MP_CLIENT_ID` | `6464281463150818` | MercadoPago OAuth client |
| `VITE_SENTRY_DSN` | (empty) | Sentry DSN |

---

## 12. Estado Actual — Implementado vs Pendiente

### ✅ COMPLETADO

| Área | Estado |
|------|--------|
| Flujo Auth (Auth0) | ✅ Login, register, selección rol, formularios perfil, OAuth |
| Páginas públicas | ✅ Home (9 secciones), SobreNosotros, Empleos, Blog, Contacto, legales |
| Marketplace | ✅ Búsqueda productos, filtros, detalle, categorías, empresas, carrito, checkout, MercadoPago |
| Portal Admin | ✅ Stats, empresas/usuarios/vets, categorías, suscripciones, gamificación |
| Portal Empresa | ✅ KPIs, servicios, productos, equipo, leads, suscripciones, billing, adopciones, citas, pacientes, config |
| Portal Cliente | ✅ Mascotas, compras, tracking, suscripciones, citas, teleconsultas, recordatorios, referidos, puntos, config |
| Portal Veterinario | ✅ Perfil, servicios, pacientes, historial clínico, teleconsultas, invitaciones, suscripción, config |
| Portal Repartidor | ✅ App completa mobile: pedidos, GPS, OTP, foto, incidencias, historial, perfil |
| Teleconsulta | ✅ Chat con polling, integración Jitsi video |
| Adopciones | ✅ Publicar, buscar, postular, gestionar solicitudes |
| Gamification | ✅ Config puntos, dashboard cliente, tienda recompensas, CRUD empresa |
| Suscripciones/SaaS | ✅ Planes, checkout, métricas uso, MercadoPago |
| Citas | ✅ Crear, listar, actualizar estado |
| Delivery/Tracking | ✅ GPS real-time, OTP, foto, historial |
| Health Card | ✅ PDF descargable |
| IA Alerts | ✅ Generar alertas de salud |
| SEO | ✅ Meta tags dinámicos |
| Error Handling | ✅ ErrorBoundary, sesión expirada, toasts |
| Sentry | ✅ Init con DSN opcional |
| Testing | ⚠️ Vitest configurado, tests básicos existentes |

### ⚠️ STUBS / PLACEHOLDERS

| Feature | Estado | Notas |
|---------|--------|-------|
| Blog | Stub | Solo header, sin posts |
| Contacto | Sin backend | Formulario sin handler |
| Admin Marketplace | Coming Soon | Placeholder |
| Admin Reportes | Coming Soon | Placeholder |
| Repartidor wallet | UI placeholder | Sin implementación |

### ❌ NO IMPLEMENTADO

- Blog/CMS
- Newsletter subscription
- Multi-idioma (i18n)
- PWA / service worker
- WebSocket para teleconsulta (usa polling)
- Portal de laboratorios
- Portal de municipalidades
- Portal de farmacias
- Portal de aseguradoras
- Historial clínico unificado (compartido)
- Consentimiento de datos
- Dashboard epidemiológico
- Chatbot RAG
- Predicción de enfermedades
- Análisis de imágenes

---

## 13. Decisiones Técnicas Clave

1. **Feature-First architecture**: Cada módulo tiene su propio directorio con pages/components/services/types/hooks
2. **5 portales separados**: Un layout y sidebar por rol
3. **Auth0 como provider único**: Login social + email/password vía Auth0
4. **React Query para server state**: Cache invalidation, refetch, optimistic updates
5. **Context API para auth + cart**: No Redux/Zustand, solo 2 contextos + React Query
6. **Tailwind sin component library**: Todo custom, solo Button e Input como base
7. **SweetAlert2 para confirmaciones**: No modales custom para destructive actions
8. **Polling para teleconsulta**: 3s interval (pendiente migrar a WebSocket)
9. **STOMP para GPS**: WebSocket real-time solo para delivery tracking
10. **Vercel deployment**: SPA con security headers

---

## 14. Glossario

| Término | Definición |
|---------|-----------|
| Feature-First | Arquitectura donde el código se organiza por feature (dominio) no por capa |
| ProtectedRoute | Componente guard que protege rutas según auth + rol |
| RequiresProfile | Componente guard que verifica perfil completado |
| AuthRedirector | Componente que auto-redirige usuarios autenticados |
| Auth0 | Proveedor de autenticación (OAuth2 + JWT) |
| STOMP | Protocolo de mensajería sobre WebSocket |
| CartContext | Contexto de React para el carrito de compras |
| AuthContext | Contexto de React para el estado de autenticación |
| React Query | Librería para server state management (cache, refetch, etc.) |
