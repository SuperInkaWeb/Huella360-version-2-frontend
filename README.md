# Huella360 - Frontend Marketplace & SaaS Veterinario

Huella360 es una plataforma integral diseñada para digitalizar la gestión veterinaria y conectar a clínicas, profesionales y dueños de mascotas a través de un ecosistema digital moderno.

## 🚀 Tecnologías Principales

- **Framework**: React 19 con TypeScript.
- **Build Tool**: Vite.
- **Estilos**: Tailwind CSS 4 (Custom Themes).
- **Estado y Datos**: TanStack React Query v5, Context API.
- **Formularios**: React Hook Form + Zod.
- **Comunicación**: Axios (REST), StompJS/SockJS (WebSockets).
- **UI/UX**: Lucide Icons, Recharts, Leaflet, SweetAlert2, React Hot Toast.

## 📦 Instalación

1. Clona el repositorio.
2. Instala las dependencias:
   ```bash
   npm install
   ```
3. Crea un archivo `.env` basado en `.env.example` y configura:
   - `VITE_API_URL`: URL base de tu backend.
   - `VITE_MP_PUBLIC_KEY`: Clave pública de Mercado Pago.
   - `VITE_MP_CLIENT_ID`: ID de cliente de Mercado Pago (para OAuth).
4. Inicia el servidor de desarrollo:
   ```bash
   npm run dev
   ```

## 🏗️ Estructura del Proyecto

El proyecto utiliza una arquitectura **Feature-First**:

- `src/features/`: Módulos de negocio (auth, marketplace, dashboard, etc.).
- `src/shared/`: Componentes, hooks y utilidades compartidas.
- `src/components/`: Layouts y componentes UI globales.
- `src/pages/`: Páginas estáticas y públicas.

## 👥 Roles del Sistema

- **Admin**: Gestión global de la plataforma.
- **Empresa**: Gestión de servicios, productos y suscripción SaaS.
- **Veterinario**: Gestión de citas y pacientes.
- **Cliente**: Marketplace y cuidado de mascotas.
- **Repartidor**: Gestión de logística y entregas.

## 📚 Documentación Adicional

Para más detalles, consulta los archivos en la carpeta `/docs`:

1. [Arquitectura y Flujos](./docs/ARCHITECTURE.md)
2. [Funcionalidades por Rol](./docs/FEATURES.md)
3. [Stack Técnico Detallado](./docs/TECHNICAL_STACK.md)
4. [Manual de Usuario](./docs/USER_MANUAL.md)

---

Desarrollado con ❤️ para el ecosistema veterinario.
