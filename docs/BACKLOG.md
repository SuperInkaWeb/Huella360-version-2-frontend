# Backlog Frontend — Huella360 Plataforma de Interoperabilidad

> Documento maestro del backlog frontend de transformación. Autocontenido.

---

## 1. Contexto y Objetivo

Huella360 frontend actualmente es un **marketplace veterinario SaaS** funcional con 5 portales de usuario. El objetivo es **transformarlo para soportar la plataforma de interoperabilidad de salud animal** con:

- Historial clínico unificado y compartible
- Consentimiento del dueño para compartir datos
- Portales para laboratorios, municipalidades, farmacias y aseguradoras
- IA completa: chatbot, predicción, análisis de imágenes
- Dashboard epidemiológico
- Alertas inteligentes

### De Marketplace a Plataforma

| Nivel Actual | Nivel Objetivo |
|---|---|
| 5 portales (admin, empresa, cliente, vet, repartidor) | 9 portales (+ lab, muni, farmacia, aseguradora) |
| Historial clínico básico (1 modal) | Historial completo con vacunas, alergias, cirugías, análisis |
| Sin compartición de datos | Consentimiento + compartir historial con token |
| IA con 1 endpoint (alertas simples) | Chatbot, predicción, análisis de imágenes, alertas epidemiológicas |
| Sin analytics | Dashboard epidemiológico con gráficas y tendencias |
| Sin integración externa | Portales para sistemas externos conectados |

---

## 2. Alcance del Frontend

### IN (Entra en la transformación)

**Fase 1 — Historial Clínico Unificado**
- Página de Historial Clínico completo de mascota (vacunas, alergias, cirugías, análisis)
- Modal/Form para registrar vacunas
- Modal/Form para registrar alergias
- Modal/Form para registrar cirugías
- Modal/Form para registrar análisis
- Sistema de consentimiento (crear, revocar, ver consentimientos)
- Compartir historial con token (vista pública para veterinarios externos)
- Vista del veterinario con historial compartido

**Fase 2 — Dashboard Epidemiológico**
- Dashboard epidemiológico en portal Admin
- Dashboard epidemiológico en portal Empresa (sus propias mascotas)
- Gráficas de tendencias por enfermedad/zona
- Mapa de calor de enfermedades
- Reportes PDF descargables

**Fase 3 — IA Completa**
- Chatbot veterinario (interfaz de chat con IA)
- Predicción de enfermedades (resultado con probabilidad)
- Análisis de imágenes (upload + resultado)
- Alertas IA mejoradas (tipos, severidad, acciones)

**Fase 4 — Portales Externos**
- Portal de Laboratorio (recibir órdenes, subir resultados)
- Portal de Municipalidad (dashboard epidemiológico, alertas)
- Portal de Farmacia (recetas, dispensación)
- Portal de Aseguradora (coberturas, reclamos)

### OUT (Post-transformación)

- App móvil nativa
- PWA
- Multi-idioma (i18n)
- Blog/CMS real
- Modo offline

---

## 3. Casos de Uso Clave (Frontend)

### 3.1 Veterinario — Ver Historial Completo de una Mascota

**Flujo:**
1. Veterinario escanea QR o busca mascota por DNI del dueño
2. Ve pestaña "Historial Clínico" con:
   - Perfil de salud (especie, raza, peso actual, alergias, condiciones crónicas)
   - Timeline de vacunas con próximo refuerzo
   - Lista de alergias con severidad
   - Cirugías realizadas
   - Análisis de laboratorio (con PDF descargable)
   - Registros clínicos anteriores
3. Si hay consentimiento activo → ve todo
4. Si no hay consentimiento → ve solo lo básico

### 3.2 Dueño — Gestionar Consentimientos

**Flujo:**
1. Dueño entra a "Mi Mascota" → pestaña "Consentimientos"
2. Ve lista de consentimientos activos
3. Crea nuevo consentimiento:
   - Selecciona destinatario (veterinario, laboratorio, etc.)
   - Selecciona alcance (completo, específico, limitado)
   - Define campos permitidos (checkboxes)
   - Define fecha de expiración
4. Puede revocar en cualquier momento
5. Ve historial de consentimientos

### 3.3 Admin — Dashboard Epidemiológico

**Flujo:**
1. Admin entra a "Portal Admin" → "Epidemiología"
2. Ve resumen: total mascotas, vacunación %, enfermedades top
3. Selecciona distrito y período
4. Ve gráficas: tendencia de enfermedades, mapa de calor
5. Ve alertas epidemiológicas activas
6. Puede descargar reporte PDF

### 3.4 Laboratorio — Portal de Resultados

**Flujo:**
1. Lab accede a su portal con API key
2. Ve órdenes de análisis recibidas
3. Sube resultados (JSON o PDF)
4. Resultados se envían al backend → historial clínico se actualiza

### 3.5 Chatbot IA

**Flujo:**
1. Usuario hace click en "Asistente IA" (floating button o página dedicada)
2. Ve interfaz de chat
3. Escribe pregunta: "¿Cada cuánto se vacuna un cachorro de moquillo?"
4. Selecciona mascota (opcional) para contexto del historial
5. IA responde con información basada en conocimiento veterinario + historial
6. Puede ver fuentes de la respuesta

---

## 4. Nuevo Design System / Componentes Requeridos

### 4.1 Componentes Base a Crear

| Componente | Descripción | Prioridad |
|------------|-------------|-----------|
| `Card` | Card reutilizable (ya existe en admin, estandarizar) | Alta |
| `Badge` | Badge con variantes (success, warning, danger, info) | Alta |
| `Timeline` | Timeline vertical para historial de eventos | Alta |
| `Tabs` | Sistema de pestañas | Alta |
| `Modal` | Modal reutilizable (ya usa SweetAlert2, considerar modal propio) | Media |
| `DataTable` | Tabla con paginación, filtros, sorting | Alta |
| `Chart` | Wrapper de Recharts preconfigurado | Media |
| `Map` | Wrapper de Leaflet reutilizable | Media |
| `FileUpload` | Upload de archivos con preview | Alta |
| `SearchInput` | Input de búsqueda con debounce | Alta |
| `EmptyState` | Estado vacío con icono y mensaje | Media |
| `LoadingSpinner` | Spinner de carga | Baja |
| `Alert` | Banner de alerta inline | Alta |
| `Avatar` | Avatar de usuario/mascota | Media |
| `ProgressBar` | Barra de progreso | Media |
| `Tooltip` | Tooltip hover | Baja |
| `Skeleton` | Skeleton loading | Media |

### 4.2 Componentes de Feature a Crear

| Feature | Componente | Descripción |
|---------|------------|-------------|
| Clinical History | `HealthProfileCard` | Card con perfil de salud de la mascota |
| Clinical History | `VaccinationTimeline` | Timeline de vacunas con próximo refuerzo |
| Clinical History | `AllergyList` | Lista de alergias con badge de severidad |
| Clinical History | `SurgeryList` | Lista de cirugías |
| Clinical History | `LabResultsList` | Lista de resultados de laboratorio con PDF |
| Clinical History | `ClinicalRecordCard` | Card de registro clínico individual |
| Consent | `ConsentCard` | Card de consentimiento con estado |
| Consent | `ConsentForm` | Formulario de creación de consentimiento |
| Consent | `ConsentScopeSelector` | Selector de alcance (completo/específico/limitado) |
| IA | `ChatInterface` | Interfaz de chat con IA |
| IA | `PredictionResult` | Resultado de predicción con probabilidad |
| IA | `ImageAnalysisResult` | Resultado de análisis de imagen |
| Epidemiology | `EpidemiologyDashboard` | Dashboard completo con gráficas |
| Epidemiology | `DiseaseChart` | Gráfica de tendencia de enfermedad |
| Epidemiology | `HeatMap` | Mapa de calor de enfermedades |
| Epidemiology | `AlertCard` | Card de alerta epidemiológica |
| Lab Portal | `LabOrderCard` | Card de orden de análisis |
| Lab Portal | `ResultUploadForm` | Formulario de subida de resultados |
| Muni Portal | `MunicipalityDashboard` | Dashboard municipal |
| Pharmacy Portal | `PrescriptionCard` | Card de receta médica |
| Insurance Portal | `CoverageVerifier` | Verificador de cobertura |

---

## 5. Backlog por Fases

### Convenciones

- **ID:** FE-NN correlativo
- **Dificultad:** S (≤ 1 día), M (2-3 días), L (4-5 días), XL (1-2 semanas)
- **Etiquetas:**
  - `foundational`: infraestructura base, componentes compartidos
  - `standard`: implementación estándar
  - `ui`: requiere diseño UI/UX
  - `review-intensiva`: seguridad, permisos, datos sensibles
  - `critica`: bloquea otras tareas
  - `ia`: integración con IA
  - `interoperabilidad`: portales de sistemas externos

---

### Fase 1 — Historial Clínico Unificado (Semanas 1-4)

> **Objetivo:** Interfaz completa para ver, crear y compartir historial clínico.

#### Semana 1 — Componentes Base + Tipos

| ID | Tarea | Descripción | AC | Dificultad | Etiqueta |
|----|-------|-------------|-----|------------|----------|
| FE-01 | Tipos TypeScript del historial | Crear tipos en `clinical-history/types/`: PerfilSalud, RegistroVacuna, CatalogoVacuna, RegistroAlergia, RegistroCirugia, RegistroAnalisis, Consentimiento, AlertaIA. Incluir todos los campos del backend. | Todos los tipos creados y tipados correctamente. | M | foundational |
| FE-02 | Servicio API del historial | Crear `clinical-history/services/clinicalHistoryService.ts` con métodos: getCompleteHistory(mascotaId), createVaccine(), getVaccines(), createAllergy(), getAllergies(), createSurgery(), getSurgeries(), createAnalysis(), getAnalyses(). | Todos los métodos funcionan con el backend. | M | foundational |
| FE-03 | Componente HealthProfileCard | Card que muestra: peso actual, especie, raza, color, esterilizado, alergias (badges), condiciones crónicas. Responsive. | Se muestra correctamente en desktop y mobile. | M | ui |
| FE-04 | Componente VaccinationTimeline | Timeline vertical con: fecha aplicación, nombre vacuna, lote, dosis, próximo refuerzo (con countdown). Vacunas pendientes resaltadas en warning. | Timeline muestra vacunas en orden cronológico. | L | ui |
| FE-05 | Componente AllergyList | Lista de alergias con badge de severidad (LEVE=verde, MODERADA=amarillo, GRAVE=rojo). Opción de desactivar. | Lista funciona, badges correctos. | S | ui |
| FE-06 | Componente DataTable reutilizable | Tabla con: sorting por columna, paginación, búsqueda, filtros, empty state, loading skeleton. Basada en Tailwind (sin librería externa). | Componente reutilizable funciona en diferentes contextos. | L | foundational |

#### Semana 2 — Página de Historial Clínico

| ID | Tarea | Descripción | AC | Dificultad | Etiqueta |
|----|-------|-------------|-----|------------|----------|
| FE-07 | Página MascotaDetailPage expandida | Expandir `/portal/cliente/mascota/:id` existente con pestañas: Info General, Historial Clínico, Vacunas, Análisis, Consentimientos. Cada pestaña carga su contenido. | Página con 5 pestañas funciona. | L | standard |
| FE-08 | Tab "Historial Clínico" | Dentro de MascotaDetailPage: muestra registros clínicos en timeline + HealthProfileCard. Botón "Nuevo Registro" para veterinario. | Timeline de registros visible. | M | standard |
| FE-09 | Tab "Vacunas" | Lista de vacunas con VaccinationTimeline + botón "Registrar Vacuna" (solo veterinario). Modal con formulario de registro. | Vaccinas listadas, formulario funciona. | M | standard |
| FE-10 | Tab "Análisis" | Lista de análisis de laboratorio con estado (SOLICITADO/EN_PROCESO/COMPLETADO). Click ver detalle + PDF si disponible. | Análisis listados con estados. | M | standard |
| FE-11 | Modal Registrar Vacuna | Formulario: seleccionar vacuna (dropdown del catálogo), fecha aplicación, lote, dosis, notas. Validación con Zod. | Formulario crea vacuna correctamente. | M | standard |
| FE-12 | Modal Registrar Alergia | Formulario: tipo alergia, severidad (select), notas. | Formulario crea alergia correctamente. | S | standard |
| FE-13 | Modal Registrar Cirugía | Formulario: tipo cirugía, fecha, resultado, complicaciones, notas. | Formulario crea cirugía correctamente. | S | standard |
| FE-14 | Modal Registrar Análisis | Formulario: tipo análisis, laboratorio (select), notas. | Formulario crea análisis correctamente. | S | standard |

#### Semana 3 — Consentimiento

| ID | Tarea | Descripción | AC | Dificultad | Etiqueta |
|----|-------|-------------|-----|------------|----------|
| FE-15 | Tipos y servicio de consentimiento | Crear `consent/types/`: Consentimiento, AmbitoConsentimiento, DestinatarioTipo. Service: createConsentimiento(), getConsentimientos(mascotaId), revokeConsentimiento(id). | Tipos y service creados. | M | foundational |
| FE-16 | Tab "Consentimientos" en MascotaDetailPage | Lista de consentimientos activos/revocados. Muestra: destinatario, alcance, campos permitidos, fecha inicio/fin, estado. Botón revocar. | Consentimientos listados, revocar funciona. | M | standard |
| FE-17 | Modal Crear Consentimiento | Formulario: seleccionar destinatario (veterinario/lab/muni/aseguradora/farmacia), alcance (completo/específico/limitado), checkboxes de campos permitidos, fecha expiración. | Formulario crea consentimiento correctamente. | L | review-intensiva |
| FE-18 | ConsentimientoBadge | Badge que muestra estado: ACTIVO (verde), PRÓXIMO A VENCER (amarillo), REVOCADO (rojo), EXPIRADO (gris). | Badge funciona correctamente. | S | ui |
| FE-19 | Vista de historial compartido | Página pública `/shared-history/:token` que muestra el historial filtrado por consentimiento. Sin layout de portal (diseño limpio para veterinarios externos). | Veterinario externo ve historial filtrado. | L | review-intensiva |

#### Semana 4 — Integración + Tests

| ID | Tarea | Descripción | AC | Dificultad | Etiqueta |
|----|-------|-------------|-----|------------|----------|
| FE-20 | Integrar con portal Veterinario | Agregar pestaña "Historial Clínico" en VetPacientesPage. Veterinario busca mascota → ve historial completo. Si hay consentimiento → todo. Si no → básico. | Vet puede ver historial de sus pacientes. | M | standard |
| FE-21 | Integrar con portal Empresa | Agregar acceso al historial en EmpresaPacientesPage. Empresa ve historial de mascotas atendidas por sus veterinarios. | Empresa puede ver historial. | M | standard |
| FE-22 | Notificaciones de consentimiento | Cuando se crea un consentimiento → notificación toast. Cuando se revoca → notificación toast. Cuando vence pronto → alerta. | Notificaciones funcionan. | S | standard |
| FE-23 | Tests de la Fase 1 | Tests con Vitest + Testing Library para: MascotaDetailPage (pestañas), VaccinationTimeline (render), HealthProfileCard (render), ConsentForm (submit). | Tests pasan. | L | standard |
| FE-24 | Documentación de componentes | Storybook stories o documentación en código para componentes nuevos: HealthProfileCard, VaccinationTimeline, AllergyList, ConsentCard. | Documentación existe. | S | standard |

---

### Fase 2 — Dashboard Epidemiológico (Semanas 5-8)

> **Objetivo:** Visualización de datos epidemiológicos y tendencias.

#### Semana 5 — Infraestructura de Gráficas

| ID | Tarea | Descripción | AC | Dificultad | Etiqueta |
|----|-------|-------------|-----|------------|----------|
| FE-25 | Tipos epidemiológicos | Crear `epidemiology/types/`: MetricaZona, TendenciaEnfermedad, AlertaEpidemiologica, ReporteEpidemiologico. | Tipos creados. | M | foundational |
| FE-26 | Servicio epidemiológico | Crear `epidemiology/services/epidemiologyService.ts`: getMetricasPorZona(), getTendencias(), getMapaCalor(), getTopEnfermedades(), getReporte(). | Service creado. | M | foundational |
| FE-27 | Componente DiseaseChart | Gráfica de línea con Recharts: muestra tendencia de una enfermedad en el tiempo. Props: data[], color, title. Responsive. | Gráfica renderiza correctamente. | M | ui |
| FE-28 | Componente HeatMap | Mapa de calor superpuesto en Leaflet: muestra concentración de enfermedades por distrito. Usa colores (verde→amarillo→rojo) según intensidad. | Mapa muestra datos correctamente. | L | ui |
| FE-29 | Componente AlertCard (epidemiológica) | Card con: icono de enfermedad, nombre, nivel de riesgo (badge), casos detectados, período, distrito. Acción: "Ver detalles". | Card renderiza correctamente. | S | ui |

#### Semana 6 — Dashboard Admin Epidemiológico

| ID | Tarea | Descripción | AC | Dificultad | Etiqueta |
|----|-------|-------------|-----|------------|----------|
| FE-30 | Página EpidemiologyDashboard (Admin) | Nueva ruta `/portal/admin/epidemiologia`. Layout con: filtros (distrito, período, enfermedad), gráficas principales, tabla de alertas. | Página creada y accesible. | L | standard |
| FE-31 | Sección Resumen | Cards con KPIs: total mascotas, % vacunación, enfermedades top, alertas activas. | KPIs mostrados correctamente. | M | standard |
| FE-32 | Sección Tendencias | DiseaseChart con selector de enfermedad. Tabla de tendencias por distrito. | Gráficas funcionan con datos del backend. | M | standard |
| FE-33 | Sección Alertas | Lista de AlertCard con alertas epidemiológicas. Filtro por nivel de riesgo. Click → detalle. | Alertas listadas y filtrables. | M | standard |
| FE-34 | Sección Reportes | Botón "Descargar Reporte PDF". Llama a endpoint y descarga PDF. | PDF descargado correctamente. | S | standard |
| FE-35 | Sidebar Admin actualizado | Agregar ítem "Epidemiología" al sidebar del portal Admin. | Ítem visible y funciona. | S | standard |

#### Semana 7 — Dashboard Empresa Epidemiológico

| ID | Tarea | Descripción | AC | Dificultad | Etiqueta |
|----|-------|-------------|-----|------------|----------|
| FE-36 | Dashboard epidemiológico Empresa | Dentro del dashboard existente de Empresa: agregar sección "Salud de mis Pacientes". Muestra métricas de salud de las mascotas atendidas por la empresa. | Sección agregada al dashboard. | M | standard |
| FE-37 | Gráficas de salud empresa | DiseaseChart simplificado: solo enfermedades relevantes para la empresa. Vacunación % de sus pacientes. | Gráficas funcionan. | M | standard |
| FE-38 | Pacientes en riesgo | Lista de mascotas con: vacunas vencidas, peso anómalo, seguimientos pendientes. Badges de severidad. | Lista mostrada correctamente. | M | standard |

#### Semana 8 — Tests + Hardening Fase 2

| ID | Tarea | Descripción | AC | Dificultad | Etiqueta |
|----|-------|-------------|-----|------------|----------|
| FE-39 | Tests epidemiología | Tests para: EpidemiologyDashboard (render), DiseaseChart (render con data), HeatMap (render), AlertCard (render). | Tests pasan. | M | standard |
| FE-40 | Responsive design | Verificar que todos los dashboards epidemiológicos funcionan en mobile (320px+), tablet (768px+), desktop (1024px+). | Responsive funciona. | M | ui |
| FE-41 | Loading states | Agregar skeleton loading a todos los componentes que cargan datos. | Skeletons mostrados durante carga. | M | ui |
| FE-42 | Empty states | Agregar empty states a: lista de alertas, gráficas sin datos, reportes disponibles. | Empty states informativos. | S | ui |

---

### Fase 3 — IA Completa (Semanas 9-14)

> **Objetivo:** Interfaz para chatbot, predicción y análisis de imágenes.

#### Semana 9-10 — Chatbot

| ID | Tarea | Descripción | AC | Dificultad | Etiqueta |
|----|-------|-------------|-----|------------|----------|
| FE-43 | Tipos del chatbot | Crear `ia/types/`: ChatMessage, ChatSession, PredictionResult, ImageAnalysisResult. | Tipos creados. | M | foundational |
| FE-44 | Servicio del chatbot | Crear `ia/services/iaService.ts`: sendMessage(message, mascotaId?), getChatHistory(), predictDisease(mascotaId), analyzeImage(file, mascotaId). | Service creado. | M | foundational |
| FE-45 | Componente ChatInterface | Interfaz de chat estilo messaging: input de texto, selector de mascota (opcional), mensajes con avatares (usuario vs IA), indicador de "escribiendo...", scroll automático. | Chat funciona visualmente. | L | ui |
| FE-46 | Página ChatbotPage | Nueva ruta `/portal/cliente/ia` (y `/portal/veterinario/ia`). Layout completo con ChatInterface + sidebar de sesiones anteriores. | Página accesible. | M | standard |
| FE-47 | Integración en portales | Agregar acceso al chatbot en: ClienteSidebar ("Asistente IA"), VetSidebar ("Asistente IA"). Floating button en mobile. | Acceso desde ambos portales. | M | standard |
| FE-48 | Rate limit visual | Mostrar contador de mensajes restantes (20/hora). Cuando se agota → deshabilitar input con mensaje. | Contador visible y funcional. | S | standard |
| FE-49 | Markdown en respuestas | Parsear markdown de las respuestas de IA (negritas, listas, código). Usar librería ligera o custom parser. | Markdown renderizado correctamente. | M | standard |

#### Semana 11-12 — Predicción de Enfermedades

| ID | Tarea | Descripción | AC | Dificultad | Etiqueta |
|----|-------|-------------|-----|------------|----------|
| FE-50 | Componente PredictionResult | Card con: enfermedad predicha, probabilidad (barra de progreso), nivel de riesgo (badge), recomendaciones, fuentes. | Componente renderiza correctamente. | M | ui |
| FE-51 | Página PredictionPage | Nueva ruta `/portal/cliente/mascota/:id/predicciones`. Muestra predicciones generadas + botón "Generar nueva predicción". | Página funcionando. | M | standard |
| FE-52 | Predicción en MascotaDetailPage | Agregar pestaña "Predicciones IA" en MascotaDetailPage. Lista de predicciones + botón generar. | Pestaña agregada. | M | standard |
| FE-53 | Predicción automática | Cuando se crea un registro clínico → toast "¿Generar predicción de salud?" con botón. Si acepta → genera predicción. | Flujo completo funciona. | M | standard |
| FE-54 | Historial de predicciones | Tabla con: fecha, enfermedad, probabilidad, riesgo, estado (pendiente/atendida). Filtros por fecha y riesgo. | Tabla funciona. | M | standard |

#### Semana 13-14 — Análisis de Imágenes

| ID | Tarea | Descripción | AC | Dificultad | Etiqueta |
|----|-------|-------------|-----|------------|----------|
| FE-55 | Componente ImageUploader | Upload de imagen con: drag & drop, preview, validación de tipo/tamaño (jpg/png, max 5MB). | Upload funciona. | M | ui |
| FE-56 | Componente ImageAnalysisResult | Card con: imagen subida, resultado del análisis (tipo lesión, urgencia, recomendación), badge de urgencia. | Componente renderiza correctamente. | M | ui |
| FE-57 | Página ImageAnalysisPage | Nueva ruta `/portal/cliente/mascota/:id/analisis-ia`. Upload de imagen → resultado. Historial de análisis anteriores. | Página funcionando. | M | standard |
| FE-58 | Análisis en MascotaDetailPage | Agregar pestaña "Análisis IA" en MascotaDetailPage. Upload + historial. | Pestaña agregada. | M | standard |
| FE-59 | Análisis rápido desde dashboard | Botón "Analizar imagen" en el dashboard del cliente. Abre modal con upload. | Botón funciona. | S | standard |
| FE-60 | Validación veterinaria | Para análisis con resultado GRAVE: badge "Requiere validación veterinaria". Botón "Marcar como revisado" (solo vet). | Flujo de validación funciona. | M | standard |

---

### Fase 4 — Portales Externos (Semanas 15-22)

> **Objetivo:** Portales para laboratorios, municipalidades, farmacias y aseguradoras.

#### Semana 15-16 — Portal Laboratorio

| ID | Tarea | Descripción | AC | Dificultad | Etiqueta |
|----|-------|-------------|-----|------------|----------|
| FE-61 | Layout portal Lab | Nuevo layout con: sidebar (Órdenes, Resultados, Config), header con logo/nombre. Ruta base: `/portal/laboratorio`. | Layout creado. | L | foundational |
| FE-62 | Login Lab | Formulario de login con API key (no Auth0). Simple: campo API key → validación → redirect a dashboard. | Login funciona. | M | standard |
| FE-63 | Página Órdenes | Lista de órdenes de análisis recibidas. Filtros: estado (SOLICITADO/EN_PROCESO/COMPLETADO), fecha, mascota. Click → detalle. | Página funcionando. | L | standard |
| FE-64 | Página Resultados | Formulario para subir resultados: tipo análisis, resultados (JSON key-value o textarea), archivo adjunto (PDF). Envía al backend. | Formulario crea resultados. | L | standard |
| FE-65 | Detalle de Orden | Vista detallada: mascota, veterinario solicitante, tipo análisis, fecha solicitud, notas. Botón "Subir resultados". | Detalle completo. | M | standard |
| FE-66 | Routing y guards | Configurar rutas del portal Lab con autenticación por API key (no Auth0). | Rutas protegidas. | M | standard |

#### Semana 17-18 — Portal Municipalidad

| ID | Tarea | Descripción | AC | Dificultad | Etiqueta |
|----|-------|-------------|-----|------------|----------|
| FE-67 | Layout portal Muni | Nuevo layout con: sidebar (Dashboard, Alertas, Mascotas, Reportes). Ruta base: `/portal/municipalidad`. | Layout creado. | L | foundational |
| FE-68 | Login Muni | Login con credenciales (usuario + password). | Login funciona. | M | standard |
| FE-69 | Dashboard municipal | KPIs: total mascotas distrito, % vacunación, enfermedades top, tendencias. DiseaseChart + HeatMap. | Dashboard completo. | L | standard |
| FE-70 | Página Alertas | Lista de alertas epidemiológicas recibidas. Filtro por nivel de riesgo. Click → detalle con recomendaciones. | Alertas funcionan. | M | standard |
| FE-71 | Página Mascotas (vista general) | Vista agregada de mascotas del distrito (sin datos personales del dueño). Solo: especie, raza, estado vacunación, última enfermedad. | Vista agregada funcionando. | M | standard |
| FE-72 | Página Reportes | Generador de reportes: seleccionar período, enfermedad, formato (PDF/CSV). Descarga de reportes. | Reportes descargables. | M | standard |
| FE-73 | Notificaciones de alertas | Cuando llega alerta CRITICAL → email automático (backend) + notificación visible en el portal. | Notificaciones funcionan. | M | standard |

#### Semana 19-20 — Portal Farmacia + Portal Aseguradora

| ID | Tarea | Descripción | AC | Dificultad | Etiqueta |
|----|-------|-------------|-----|------------|----------|
| FE-74 | Layout portal Farmacia | Nuevo layout con: sidebar (Recetas, Historial, Config). Ruta base: `/portal/farmacia`. | Layout creado. | L | foundational |
| FE-75 | Login Farmacia | Login con API key. | Login funciona. | S | standard |
| FE-76 | Página Recetas | Lista de recetas recibidas de veterinarios. Filtros: fecha, mascota, estado. Click → detalle. | Página funcionando. | M | standard |
| FE-77 | Detalle Receta + Dispensar | Vista de receta: medicamento, dosis, duración, veterinario. Botón "Dispensar" → confirma → se registra en backend. | Dispensar funciona. | M | standard |
| FE-78 | Layout portal Aseguradora | Nuevo layout con: sidebar (Coberturas, Reclamos, Mascotas, Config). Ruta base: `/portal/aseguradora`. | Layout creado. | L | foundational |
| FE-79 | Login Aseguradora | Login con API key. | Login funciona. | S | standard |
| FE-80 | Página Verificar Cobertura | Formulario: seleccionar mascota, tratamiento. Respuesta: cubierto/no cubierto, monto, condiciones. | Formulario funciona. | M | standard |
| FE-81 | Página Reclamos | Lista de reclamos enviados. Formulario nuevo reclamo. Estado del reclamo. | Página funcionando. | M | standard |
| FE-82 | Página Mascotas (aseguradas) | Lista de mascotas aseguradas con: coberturas activas, historial de reclamos, estado de vacunación. | Lista funcionando. | M | standard |

#### Semana 21-22 — Integración + Navegación

| ID | Tarea | Descripción | AC | Dificultad | Etiqueta |
|----|-------|-------------|-----|------------|----------|
| FE-83 | Navegación entre portales | Desde portal Admin: acceso rápido a todos los portales (Lab, Muni, Farmacia, Aseguradora). Dropdown o página de "Portales". | Navegación funciona. | M | standard |
| FE-84 | Portal unificado (Admin view) | Página en Admin que muestra: estado de cada integración (lab conectados, muni activas, etc.), métricas de uso. | Dashboard de integraciones. | M | standard |
| FE-85 | Onboarding de portales | Flujo de onboarding para cada portal: "Conecta tu laboratorio", "Registra tu municipalidad", etc. Pasos guiados. | Onboarding funciona. | L | ui |
| FE-86 | Tests portales externos | Tests para: Login Lab/Muni/Farmacia/Aseguradora, Órdenes list, Resultados upload, Dashboard municipal. | Tests pasan. | L | standard |

---

### Fase 5 — Hardening + Optimización (Semanas 23-26)

> **Objetivo:** Production-ready, performance, accesibilidad.

#### Semana 23-24 — Performance y Accesibilidad

| ID | Tarea | Descripción | AC | Dificultad | Etiqueta |
|----|-------|-------------|-----|------------|----------|
| FE-87 | Lazy loading de portales | Cada portal (admin, empresa, cliente, vet, repartidor, lab, muni, farmacia, aseguradora) carga con React.lazy + Suspense. | Code splitting funciona. Bundle size reducido. | M | standard |
| FE-88 | Optimización de imágenes | Todas las imágenes pasan por optimización (Cloudinary auto-format o next-gen). Lazy loading nativo. | Imágenes optimizadas. | M | standard |
| FE-89 | Memoización | React.memo en componentes pesados (gráficas, tablas grandes, mapas). useMemo/useCallback donde aplique. | No re-renders innecesarios. | M | standard |
| FE-90 | Accesibilidad básica | aria-labels en botones, roles ARIA, contraste de colores WCAG AA, keyboard navigation en modales y tabs. | Accesibilidad verificada. | L | ui |
| FE-91 | Error states | Todos los componentes con llamadas API tienen: loading skeleton, error state con retry, empty state. | Estados manejados. | M | ui |

#### Semana 25-26 — Testing + Deploy

| ID | Tarea | Descripción | AC | Dificultad | Etiqueta |
|----|-------|-------------|-----|------------|----------|
| FE-92 | Tests de integración E2E | Test completo: login → ver mascota → ver historial → registrar vacuna → crear consentimiento → chatbot → ver predicción. | Test E2E pasa. | XL | standard |
| FE-93 | Tests de portales externos | Test completo: lab login → ver órdenes → subir resultados → backend actualiza historial. | Test pasa. | L | standard |
| FE-94 | Visual regression tests | Configurar Chromatic o similar para detectar cambios visuales en componentes principales. | Configurado. | M | standard |
| FE-95 | Lighthouse audit | Auditar Lighthouse en: homepage, marketplace, portales principales. Score > 90 en performance y accesibilidad. | Score > 90. | M | standard |
| FE-96 | Variables de entorno prod | Configurar variables de entorno para producción: VITE_API_URL, VITE_WS_URL, Auth0 prod, MP prod, Sentry DSN. | Configuración prod lista. | S | standard |
| FE-97 | Vercel deployment verification | Verificar que el deploy en Vercel funciona: todas las rutas, autenticación, API calls, WebSocket. | Deploy exitoso. | M | standard |
| FE-98 | README actualizado | Documentar: setup local, nuevos portales, variables de entorno, guía de desarrollo para nuevos componentes. | README completo. | S | standard |

---

## 6. Estructura de Carpetas Propuesta (Nuevos Módulos)

```
src/features/
├── (20+ feature modules existentes)
│
├── clinical-history/              (NUEVO)
│   ├── components/
│   │   ├── HealthProfileCard.tsx
│   │   ├── VaccinationTimeline.tsx
│   │   ├── AllergyList.tsx
│   │   ├── SurgeryList.tsx
│   │   ├── LabResultsList.tsx
│   │   ├── ClinicalRecordCard.tsx
│   │   └── ClinicalRecordModal.tsx
│   ├── pages/
│   │   └── ClinicalHistoryTab.tsx (dentro de MascotaDetailPage)
│   ├── services/
│   │   └── clinicalHistoryService.ts
│   └── types/
│       └── clinical-history.types.ts
│
├── consent/                       (NUEVO)
│   ├── components/
│   │   ├── ConsentCard.tsx
│   │   ├── ConsentForm.tsx
│   │   ├── ConsentScopeSelector.tsx
│   │   └── ConsentBadge.tsx
│   ├── pages/
│   │   └── ConsentTab.tsx (dentro de MascotaDetailPage)
│   ├── services/
│   │   └── consentService.ts
│   └── types/
│       └── consent.types.ts
│
├── epidemiology/                  (NUEVO)
│   ├── components/
│   │   ├── EpidemiologyDashboard.tsx
│   │   ├── DiseaseChart.tsx
│   │   ├── HeatMap.tsx
│   │   ├── AlertCard.tsx
│   │   ├── StatsGrid.tsx
│   │   └── ReportDownloader.tsx
│   ├── pages/
│   │   ├── AdminEpidemiologyPage.tsx
│   │   └── EmpresaEpidemiologySection.tsx
│   ├── services/
│   │   └── epidemiologyService.ts
│   └── types/
│       └── epidemiology.types.ts
│
├── ia/                            (NUEVO - reemplaza ia-alerts/)
│   ├── components/
│   │   ├── ChatInterface.tsx
│   │   ├── ChatMessage.tsx
│   │   ├── ChatInput.tsx
│   │   ├── MascotaSelector.tsx
│   │   ├── PredictionResult.tsx
│   │   ├── PredictionHistory.tsx
│   │   ├── ImageUploader.tsx
│   │   └── ImageAnalysisResult.tsx
│   ├── pages/
│   │   ├── ChatbotPage.tsx
│   │   ├── PredictionPage.tsx
│   │   └── ImageAnalysisPage.tsx
│   ├── hooks/
│   │   └── useChat.ts
│   ├── services/
│   │   └── iaService.ts
│   └── types/
│       └── ia.types.ts
│
├── portal-lab/                    (NUEVO)
│   ├── components/
│   │   ├── LabSidebar.tsx
│   │   ├── LabHeader.tsx
│   │   ├── LabOrderCard.tsx
│   │   ├── ResultUploadForm.tsx
│   │   └── LabLayout.tsx
│   ├── pages/
│   │   ├── LabLoginPage.tsx
│   │   ├── LabOrdersPage.tsx
│   │   ├── LabOrderDetailPage.tsx
│   │   └── LabResultsPage.tsx
│   ├── services/
│   │   └── labService.ts
│   └── types/
│       └── lab.types.ts
│
├── portal-municipality/           (NUEVO)
│   ├── components/
│   │   ├── MunicipalitySidebar.tsx
│   │   ├── MunicipalityHeader.tsx
│   │   ├── MunicipalityDashboard.tsx
│   │   └── MunicipalityLayout.tsx
│   ├── pages/
│   │   ├── MuniLoginPage.tsx
│   │   ├── MuniDashboardPage.tsx
│   │   ├── MuniAlertsPage.tsx
│   │   ├── MuniPetsPage.tsx
│   │   └── MuniReportsPage.tsx
│   ├── services/
│   │   └── municipalityService.ts
│   └── types/
│       └── municipality.types.ts
│
├── portal-pharmacy/               (NUEVO)
│   ├── components/
│   │   ├── PharmacySidebar.tsx
│   │   ├── PharmacyHeader.tsx
│   │   ├── PrescriptionCard.tsx
│   │   └── PharmacyLayout.tsx
│   ├── pages/
│   │   ├── PharmacyLoginPage.tsx
│   │   ├── PharmacyPrescriptionsPage.tsx
│   │   └── PharmacyDetailPage.tsx
│   ├── services/
│   │   └── pharmacyService.ts
│   └── types/
│       └── pharmacy.types.ts
│
├── portal-insurance/              (NUEVO)
│   ├── components/
│   │   ├── InsuranceSidebar.tsx
│   │   ├── InsuranceHeader.tsx
│   │   ├── CoverageVerifier.tsx
│   │   └── InsuranceLayout.tsx
│   ├── pages/
│   │   ├── InsuranceLoginPage.tsx
│   │   ├── InsuranceDashboardPage.tsx
│   │   ├── InsuranceCoveragePage.tsx
│   │   ├── InsuranceClaimsPage.tsx
│   │   └── InsurancePetsPage.tsx
│   ├── services/
│   │   └── insuranceService.ts
│   └── types/
│       └── insurance.types.ts
│
└── shared-ui/                     (NUEVO - componentes base)
    ├── components/
    │   ├── Card.tsx
    │   ├── Badge.tsx
    │   ├── Timeline.tsx
    │   ├── Tabs.tsx
    │   ├── DataTable.tsx
    │   ├── Chart.tsx
    │   ├── Map.tsx
    │   ├── FileUpload.tsx
    │   ├── SearchInput.tsx
    │   ├── EmptyState.tsx
    │   ├── LoadingSpinner.tsx
    │   ├── Alert.tsx
    │   ├── Avatar.tsx
    │   ├── ProgressBar.tsx
    │   ├── Tooltip.tsx
    │   └── Skeleton.tsx
    └── hooks/
        └── useDebounce.ts
```

---

## 7. Librerías Nuevas Recomendadas

| Librería | Versión | Propósito |
|----------|---------|-----------|
| `react-markdown` | 9.x | Renderizar markdown en chatbot |
| `react-dropzone` | 14.x | File upload drag & drop |
| `date-fns` | 4.x | (ya existe) Manejo de fechas |
| `@headlessui/react` | 2.x | Tabs, Dialog, Menu (accessibles) |
| `react-leaflet-markercluster` | 5.x | Clustering de markers en HeatMap |

**No agregar:**
- Ninguna librería de componentes completa (MUI, Chakra, Shadcn) — se mantiene Tailwind custom
- Ninguna librería de gráficas nueva — se mantiene Recharts
- Ninguna librería de estado nueva — se mantiene Context + React Query

---

## 8. Riesgos y Decisiones Abiertas

### Para conversar con el producto antes/durante Fase 1:

1. **¿Los 4 portales nuevos (Lab, Muni, Farmacia, Aseguradora) usan Auth0 o login propio?** Define complejidad de auth.
2. **¿El chatbot es floating button o página dedicada?** Define UX.
3. **¿Las gráficas epidemiológicas son interactivas o estáticas?** Define complejidad de Recharts.
4. **¿El historial compartido tiene branding de Huella360 o es genérico?** Define diseño.
5. **¿Los portales externos son responsive o desktop-only?** Define esfuerzo de responsive.
6. **¿Se necesita modo oscuro?** Define design system.

### Riesgos Técnicos:

| Riesgo | Impacto | Mitigación |
|--------|---------|------------|
| 4 portales nuevos = mucho código duplicado | Medio | Layout compartido, componentes base reutilizables |
| Chatbot con streaming de respuesta | Medio | SSE o polling, no WebSocket |
| HeatMap con muchos puntos | Medio | Clustering de markers, virtualización |
| Accesibilidad en portales externos | Bajo | aria-labels, keyboard nav, contraste |
| Bundle size con tantas features | Medio | Lazy loading agresivo, code splitting |

---

## 9. Métricas de Éxito

| Métrica | Target |
|---------|--------|
| Lighthouse Performance | > 90 |
| Lighthouse Accesibilidad | > 90 |
| Lighthouse SEO | > 95 |
| Bundle Size (gzipped) | < 300KB initial |
| Tiempo de carga primera pintura | < 2s |
| Cobertura de tests | > 60% |
| Tiempo respuesta chatbot (UI) | < 3s |
| Portales funcionales | 4 nuevos (Lab, Muni, Farmacia, Aseguradora) |

---

## 10. Glossario

| Término | Definición |
|---------|-----------|
| HealthProfileCard | Card con perfil de salud completo de la mascota |
| VaccinationTimeline | Timeline vertical de vacunas aplicadas |
| Consentimiento | Autorización del dueño para compartir datos |
| Chatbot RAG | Chatbot con Retrieval-Augmented Generation |
| HeatMap | Mapa de calor de enfermedades por zona |
| Feature-First | Arquitectura organizada por feature (dominio) |
| ProtectedRoute | Guard de autenticación + rol |
| Lazy loading | Carga bajo demanda de componentes/rutas |
| Code splitting | División del bundle en chunks separados |

---

*Documento generado el 2026-07-27. Versión 1.0.*
