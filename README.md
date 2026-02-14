# 🛡️ ZF Halo IMU - Patrimonio Control System

**ZF Halo IMU** es una solución integral de control patrimonial diseñada para registrar y administrar la salida de bienes propiedad de la empresa para fines de I+D. El sistema garantiza la trazabilidad total, el uso responsable y el retorno oportuno de los activos mediante una experiencia fluida y segura.

---

## 🚀 Arquitectura Técnica y Rendimiento
Para cumplir con el requerimiento de carga en **menos de 2 segundos** y soporte para **10,000 activos**, implementamos la siguiente arquitectura:

* **Frontend:** React (Single Page Application) con Vite para optimización de carga.
* **Backend:** Node.js con Express (API RESTful).
* **ORM:** Prisma para consultas eficientes en la base de datos.
* **Base de Datos:** PostgreSQL para garantizar la integridad referencial y trazabilidad.
* **Infraestructura:** Dockerización completa para asegurar la consistencia del entorno de desarrollo.

---

## 👥 Control de Acceso por Roles
El sistema protege los *endpoints* según el rol del usuario, cumpliendo con los estándares de seguridad solicitados[cite: 68, 69, 70]:

| Rol | Responsabilidades Clave |
| :--- | :--- |
| **Usuario General** | Consulta de catálogo y solicitudes de activos en máximo 3 clics. |
| **Gerente/Líder** | Aprobación/rechazo de solicitudes y visualización del historial del equipo. |
| **Administrador** | Control total del catálogo, reglas de negocio y registro de E/S manuales. |
| **Auditor** | Consulta de trazabilidad total sin permisos de modificación. |

---

## ✨ Innovación y Valor Agregado
Para alcanzar el puntaje máximo en innovación, integramos las siguientes funciones:

* **Modo Kiosko & QR:** Uso de la cámara para check-in/check-out automático mediante escaneo de QR vinculado al perfil del activo.
* **Módulo de Mantenimiento:** Los administradores pueden programar preventivos y los usuarios reportar incidencias, cambiando el estado del activo automáticamente.
* **Análisis Predictivo (IA):** Implementación de análisis de datos para generar reportes automatizados de trazabilidad y sugerencias de demanda esperada.
* **Sistema de Escalación:** Notificaciones automáticas (reminders) y alertas por retrasos en días 1, 3 y 7.

---

## 🛠️ Instalación y Despliegue (Docker)
Este proyecto está configurado para ejecutarse en contenedores, evitando conflictos de dependencias:

1. Clonar el repositorio.
2. En la raíz del proyecto, ejecutar:
   ```bash
   docker-compose up --build