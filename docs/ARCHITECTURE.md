# Arquitectura y Flujos Técnicos

Este documento describe la estructura interna y los patrones de diseño aplicados en el frontend de Huella360.

## 1. Patrón de Organización: Feature-First

El código se organiza en "features" (funcionalidades), lo que permite que cada módulo sea autónomo y fácil de mantener.

```text
src/features/
├── auth/           # Login, Registro, Recuperación de contraseña
├── marketplace/    # Catálogo, Carrito, Checkout, Pagos
├── dashboard/      # Paneles de control específicos por rol
│   ├── admin/
│   ├── empresa/
│   ├── cliente/
│   ├── veterinario/
│   └── repartidor/
└── catalog/        # Lógica compartida de productos y servicios
```

## 2. Flujo de Autenticación

El sistema utiliza JWT (JSON Web Tokens) almacenados en `localStorage`.

- **Provider**: `AuthContext.tsx` maneja el estado global del usuario (token, rol, id de empresa, nombre).
- **Protección**: Las rutas se protegen mediante `ProtectedRoute.ts`, que verifica tanto la autenticación como el rol del usuario.
- **Perfil Incompleto**: Se implementó una capa `RequiresProfile.tsx` que redirige a los usuarios que no han completado su perfil (registro fase 2) a los formularios correspondientes.
- **Sesión**: Un interceptor de Axios detecta errores 401/403, limpia el almacenamiento local y redirige al login.

## 3. Manejo de Datos y API

- **Cliente API**: Centralizado en `src/shared/http/api.ts`.
- **Servicios**: Cada feature tiene una carpeta `services/` con objetos que encapsulan las llamadas a la API (ej. `marketplaceService.ts`).
- **Hooks**: Se utiliza `useQuery` y `useMutation` de TanStack Query para gestionar el estado asíncrono, caché y reintentos automáticos.

## 4. Estilos y Temas

- **Tailwind 4**: Utiliza variables CSS nativas para el tema.
- **Dark Mode**: Gestionado mediante un atributo `data-theme` en el documento y el hook `useTheme.ts`.
- **Responsive**: Diseño "mobile-first" utilizando las utilidades de grid y flexbox de Tailwind.

## 5. Integración de Pagos (MercadoPago)

- **Checkout**: El frontend genera un link de pago llamando al backend.
- **Webhooks/Callback**: El sistema maneja rutas de retorno (`/success`, `/failure`) para sincronizar el estado del pago con la plataforma.
