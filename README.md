# 🛡️ ZF Halo - Sistema Inteligente de Trazabilidad de Activos

> **Modernizando la logística interna.** Una plataforma integral (PWA) para el rastreo, asignación, mantenimiento y control de préstamos de equipo especializado en planta.

[![React](https://img.shields.io/badge/Frontend-React_18-61DAFB?logo=react)](https://reactjs.org/)
[![Node.js](https://img.shields.io/badge/Backend-Node.js-339933?logo=nodedotjs)](https://nodejs.org/)
[![Prisma](https://img.shields.io/badge/ORM-Prisma-2D3748?logo=prisma)](https://www.prisma.io/)
[![Supabase](https://img.shields.io/badge/Database-Supabase_PostgreSQL-3ECF8E?logo=supabase)](https://supabase.com/)
[![PWA](https://img.shields.io/badge/App-PWA_Ready-5A0FC8?logo=pwa)](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)

---

## 🎯 El Problema
En entornos industriales de alta precisión como ZF, el control de activos (herramientas costosas, laptops, maquinaria de prueba) a menudo se pierde en correos electrónicos, firmas en papel y hojas de cálculo desactualizadas. Esto genera:
* **Pérdida de tiempo** en auditorías manuales.
* **Falta de visibilidad** sobre qué equipo está prestado, descompuesto o fuera de planta.
* **Cuellos de botella** en validaciones de Seguridad (EHS) y Logística (S&R).

## 💡 Nuestra Solución: ZF Halo
ZF Halo es un ecosistema digital que automatiza la burocracia mediante un motor de **Reglas de Negocio Inteligentes** y **Jerarquía de Firmas**. Transforma el seguimiento manual en un flujo digital de extremo a extremo con códigos QR, alertas automáticas y reportes en tiempo real.

---

## ✨ Características Principales para Jueces

### 1. Motor de Aprobación Bimodal Dinámico
* **Jerarquía Inteligente:** El sistema detecta la disciplina del equipo y enruta la solicitud de firma automáticamente al Gerente responsable, sin asignaciones manuales en código.
* **Reglas de Negocio Configurables:** Los administradores pueden encender/apagar requisitos de firmas (EHS, Logística, Gerencia) con un solo clic, adaptándose a las normativas de la planta al instante.

### 2. Operación de Campo con Código QR (PWA)
* Construida como una **Progressive Web App (PWA)**, permite a los guardias de seguridad en caseta usar la cámara de su celular o tablet para escanear el QR del equipo.
* Realiza el **Check-in / Check-out** físico validando en microsegundos si el folio fue aprobado por todas las instancias.

### 3. Auditoría y Trazabilidad Incorruptible
* **Cron Jobs Automatizados:** Un proceso en segundo plano audita diariamente los préstamos. Si un usuario no devuelve el equipo a tiempo, el sistema lo registra en una tabla de infracciones y genera alertas visuales.
* **Exportación Excel:** Generación de reportes limpios y estructurados con `exceljs` para auditorías externas en un solo clic.

### 4. Dashboards Analíticos por Rol
* **Seguridad en Vistas:** Renderizado condicional estricto. Un operador ve un botón de solicitud; un Gerente ve sus firmas pendientes; un Auditor ve KPIs globales y métricas de infracción renderizadas con `Recharts`.

---

## 🏗️ Arquitectura y Tecnologías

El sistema está construido bajo una arquitectura cliente-servidor robusta:

* **Frontend:** React (Vite) + Tailwind CSS + Lucide Icons + Recharts. Diseño Mobile-First y PWA.
* **Backend:** Node.js + Express.js. API RESTful modularizada en 8 servicios clave.
* **Base de Datos:** PostgreSQL alojada en Supabase.
* **ORM:** Prisma, garantizando tipado seguro y consultas relacionales complejas (ej. *Self-referencing* para suplentes de gerentes).
* **Seguridad:** Autenticación JWT, contraseñas encriptadas con `bcrypt`, Middleware de protección de rutas y preparación para 2FA.

---

## 👥 Matriz de Roles (Control de Accesos)
El sistema maneja 7 niveles de acceso, cada uno con una UI/UX diseñada para sus necesidades operativas:
1. **Administrador:** Acceso Root.
2. **Usuario / Operario:** Solicitudes y bandeja de estatus.
3. **Gerente:** Panel de aprobación de su disciplina.
4. **Logística (S&R):** Control de almacén e inventario de salida.
5. **EHS:** Validaciones de seguridad ambiental.
6. **Seguridad (Caseta):** Vista limpia exclusiva para Escáner QR.
7. **Auditor:** Dashboards y exportación de KPIs.

---

## 🚀 Instalación y Ejecución Local

Si deseas probar el proyecto en un entorno local, sigue estos pasos:

### Prerrequisitos
* Node.js (v18 o superior)
* Git
* Docker Dektop

### Pasos
1. **Clonar el repositorio**
   ```bash
   git clone [https://github.com/tu-usuario/zf-halo.git](https://github.com/tu-usuario/zf-halo.git)
   cd zf-halo

2. **Configurar variables de entono**
   1. Navegue a la carpeta del servidor: `cd backend`
   2. Cree un archivo llamado `.env` y pegue lo siguiente:
   ```env
   # URL de conexión a la base de datos (PostgreSQL)
   # IMPORTANTE: Si su contraseña contiene caracteres especiales como @ o $, 
   # debe usar URL Encoding (ej. @ = %40, $ = %24)
   DATABASE_URL="postgresql://postgres.USUARIO:PASSWORD@host:puerto/postgres?connect_timeout=10"

   # Secreto para la generación de Tokens JWT
   JWT_SECRET="mi_firma_secreta_zf_halo_2026"

   # Clave para validación de Captcha (Opcional en desarrollo)
   CAPTCHA_SECRET_KEY="6LeIxAcTAAAAAGG-vFI1TnRWxMZNFuojJ4WifJWe"

3. **Construcción e Inicio**
   1. Desde la raíz del proyecto
   ```bash
   docker-compose up --build

4. **Acceso al Sistema**
   Una vez que la terminal indique que los contenedores están listos, puede acceder a través de:

   🌐 Frontend (Aplicación PWA): http://localhost:5173

   ⚙️ Backend (API REST): http://localhost:4000

### Desarrollado para la competencia IMU 2026 💙
