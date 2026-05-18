# Especificación Técnica Detallada para el Desarrollo del Asistente de Propiedad Horizontal

Este documento detalla los requerimientos, lógica de negocio y arquitectura modular para el desarrollo de la aplicación web "Asistente para Administración de Propiedad Horizontal" \[cite: 1\]. Está estructurado como una guía secuencial diseñada para que un asistente de IA pueda ejecutar la codificación paso a paso bajo supervisión.

## 1\. Arquitectura General y Configuración del Sistema

La aplicación debe desarrollarse bajo una arquitectura limpia (Clean Architecture) o MVC, con un backend robusto basado en APIs RESTful e integraciones externas seguras \[cite: 52\]. El sistema requiere un control estricto de accesos mediante Roles y Permisos (RBAC) \[cite: 49\].

### Roles de Usuario del Sistema \[cite: 49\]

| **Rol**              | **Descripción y Alcance de Permisos**                                                                                                       |
| -------------------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
| **Administrador**    | Acceso total a todos los módulos, configuración global de parámetros, carga financiera y gestión de usuarios \[cite: 49, 50\].              |
| ---                  | ---                                                                                                                                         |
| **Comité / Consejo** | Visualización de reportes, seguimiento de compromisos, aprobación de actas y gestión de convivencia \[cite: 33, 41, 49\].                   |
| ---                  | ---                                                                                                                                         |
| **Vigilancia**       | Módulo exclusivo y simplificado para el control de acceso, registro de visitantes y recepción de paquetería o proveedores \[cite: 45, 47\]. |
| ---                  | ---                                                                                                                                         |
| **Residente**        | Acceso exclusivo a la información de su unidad: estado de cuenta, PQRS, reservas y consulta de reglamentos \[cite: 8, 15, 36, 43, 49\].     |
| ---                  | ---                                                                                                                                         |

Toda la actividad en la plataforma debe generar una traza inmutable en un módulo de auditoría integral (logs de actividad) \[cite: 51\].

## 2\. Especificaciones Modulares y Reglas de Negocio

### Módulo A: Gestión Financiera y Contable \[cite: 2\]

Este módulo administra los flujos monetarios y deudas del complejo residencial \[cite: 2\].

| **Funcionalidad**           | **Lógica de Negocio y Flujo Automatizado**                                                                                                                                                                                    |
| --------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Cargue de Información**   | Interfaz para subir archivos planos (CSV/Excel) con el estado de cartera de sistemas contables tradicionales externos \[cite: 3\]. Debe validar duplicados y mapear la deuda a las unidades correspondientes \[cite: 3, 11\]. |
| ---                         | ---                                                                                                                                                                                                                           |
| **Cuentas de Cobro**        | Generación masiva el primer día de cada mes \[cite: 4\]. Envío automatizado por correo electrónico y notificación instantánea en la app del residente con la factura en PDF \[cite: 4, 52\].                                  |
| ---                         | ---                                                                                                                                                                                                                           |
| **Notificación de Morosos** | Filtro automático de unidades con saldo vencido \[cite: 5\]. Envío periódico de alertas de cobro amigables y generación automática de listas de morosidad visibles para la administración \[cite: 5\].                        |
| ---                         | ---                                                                                                                                                                                                                           |
| **Bloqueo de Servicios**    | Si una unidad supera el límite de mora configurado (ej. más de 30 o 60 días), el sistema inhabilita automáticamente su capacidad de reservar zonas comunes \[cite: 6, 37, 50\].                                               |
| ---                         | ---                                                                                                                                                                                                                           |
| **Paz y Salvo**             | Validación en tiempo real. Si el saldo de la unidad es igual a cero, el residente puede descargar instantáneamente un certificado digital de Paz y Salvo firmado electrónicamente \[cite: 7, 52\].                            |
| ---                         | ---                                                                                                                                                                                                                           |
| **Estado de Cuenta**        | Panel interactivo donde el residente visualiza su saldo actual, el desglose de cobros y el histórico de pagos aplicados \[cite: 8\].                                                                                          |
| ---                         | ---                                                                                                                                                                                                                           |

### Módulo B: Gestión de Residentes y Unidades \[cite: 9\]

Permite centralizar el censo y la documentación legal de la copropiedad \[cite: 9\].

- **Registro y Vinculación:** Gestión de la base de datos dividida en propietarios, arrendatarios y ocupantes temporales \[cite: 10\], vinculados lógicamente a sus respectivas unidades habitacionales, parqueaderos o depósitos \[cite: 11\].
- **Gestión Documental Personal:** Repositorio seguro para almacenar documentos de identidad, copias de contratos de arrendamiento y autorizaciones de tenencia de mascotas o vehículos \[cite: 12\].
- **Historial del Residente:** Bitácora unificada donde la administración revisa las interacciones de un usuario, incluyendo PQRS radicadas, asistencia a asambleas y llamados de atención previos \[cite: 13\].

### Módulo C: Atención, Comunicación y PQRS \[cite: 14\]

Automatiza los canales de contacto internos para agilizar respuestas y evitar la saturación administrativa \[cite: 14\].

- **PQRS Automatizado:** Radicación con asignación automática de número de ticket único \[cite: 15\]. Clasificación por categorías (mantenimiento, convivencia, financiero) y flujos de estados: Abierto, En Proceso, Escalado, Cerrado \[cite: 15\].
- **Circulares masivas segmentadas:** Envío de notificaciones importantes que pueden ser filtradas para que lleguen a todo el complejo, a una torre específica, o solo a propietarios/arrendatarios \[cite: 16\]. Integración con canales como correo electrónico y WhatsApp \[cite: 52\].
- **Llamados de Atención automáticos:** Generación automática del formato de notificación formal basado en reportes de infracciones aprobados por la administración \[cite: 17, 40\].
- **Asistente de IA para Preguntas Frecuentes:** Un bot conversacional que responde autónomamente dudas sobre cuentas bancarias para pagos, fechas de corte, horarios de administración o uso de áreas comunes \[cite: 18, 50\].

### Módulo D: Contratos, Proveedores y Mantenimientos \[cite: 19\]

Monitorea la infraestructura física y los compromisos con terceros de la propiedad horizontal \[cite: 19\].

| **Área**                      | **Funcionalidad Requerida**                                                                                                                                                                                                                         |
| ----------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Contratos de Terceros**     | Registro de contratos de vigilancia, limpieza o ascensores \[cite: 20\]. El sistema dispara alertas automáticas a la administración 30, 15 y 5 días antes de su vencimiento \[cite: 20\]. Incluye plantillas digitales estandarizadas \[cite: 20\]. |
| ---                           | ---                                                                                                                                                                                                                                                 |
| **Mantenimiento Preventivo**  | Calendario anual programado para revisiones técnicas obligatorias (tanques de agua, bombas, subestación eléctrica) \[cite: 21\]. Notificación automática de tareas pendientes a los operarios contratados \[cite: 21\].                             |
| ---                           | ---                                                                                                                                                                                                                                                 |
| **Mantenimiento Correctivo**  | Flujo para levantar reportes de daños imprevistos. Permite adjuntar evidencias, solicitar y consolidar cotizaciones de múltiples proveedores para su respectiva evaluación y comparación \[cite: 22\].                                              |
| ---                           | ---                                                                                                                                                                                                                                                 |
| **Directorio de Proveedores** | Base de datos centralizada de técnicos y empresas certificadas \[cite: 23\]. Almacena su historial de servicios en la copropiedad y una calificación de desempeño asignada por la administración \[cite: 23\].                                      |
| ---                           | ---                                                                                                                                                                                                                                                 |

### Módulo E: Gestión Documental Centralizada \[cite: 24\]

El core de almacenamiento institucional de la copropiedad \[cite: 24\].

- **Clasificación de Archivos:** Almacenamiento organizado jerárquicamente de manera automática según su origen (Financiero, Actas de Asamblea, Reglamentos Internos) \[cite: 25\].
- **Indexación y Búsqueda:** Motor de búsqueda avanzado compatible con palabras clave en títulos y contenido, además de filtros por etiquetas y fechas de publicación \[cite: 26\].
- **Seguridad y Trazabilidad:** Control riguroso de versiones para documentos regulatorios de la copropiedad \[cite: 27\], resguardados mediante enlaces seguros temporales que evitan fugas de información al descargar o compartir enlaces \[cite: 28\].

### Módulo F: Asambleas, Consejo y Decisiones \[cite: 29\]

Garantiza la validez legal y el seguimiento a los acuerdos tomados en los órganos colegiados \[cite: 29\].

- **Convocatorias Formales:** Creación del orden del día y envío programado de invitaciones a asambleas ordinarias y extraordinarias \[cite: 30\].
- **Registro de Quórum y Votaciones:** Control en tiempo real de coeficientes de propiedad y asistencias confirmadas \[cite: 31\]. Registro digital del sentido de votaciones de las propuestas presentadas durante la sesión \[cite: 31\].
- **Archivo de Actas:** Almacenamiento cronológico de las actas oficiales, vinculando de manera transparente las decisiones tomadas con las firmas digitales correspondientes \[cite: 32, 52\].
- **Módulo de Compromisos:** Dashboard Kanban o lista de tareas específicas asignadas a los miembros del consejo o a la administración, con fechas límite e indicadores de cumplimiento \[cite: 33\].

### Módulo G: Reservas de Áreas Comunes \[cite: 34\]

Controla el uso de amenidades del edificio o conjunto residencial \[cite: 34\].

- **Calendario de Disponibilidad:** Vista interactiva en tiempo real por zona de uso común (salón social, BBQ, canchas deportivas, piscina) \[cite: 35\].
- **Solicitudes de Reserva:** Sistema de auto-reserva desde el perfil del residente, calculando tarifas de alquiler si aplica \[cite: 36\].
- **Validación Financiera Automática:** El sistema aprueba automáticamente o bloquea la solicitud dependiendo de si la unidad del solicitante está al día con la cartera \[cite: 6, 37\].
- **Auditoría de Uso:** Registro histórico detallado por unidad habitacional que indica quién reservó, cuándo y el estado en que devolvió la zona común \[cite: 38\].

### Módulo H: Convivencia y Régimen Sancionatorio \[cite: 39\]

Manejo objetivo de infracciones de acuerdo con el reglamento interno \[cite: 39\].

- **Registro de Infracciones:** Formulario para reportar faltas al manual de convivencia (ruido excesivo, mal uso de parqueaderos, mascotas sin control) adjuntando pruebas fotográficas o testimoniales \[cite: 40\].
- **Escalamiento de Casos:** Ante reincidencias de una misma unidad, el sistema escala automáticamente el caso al Comité de Convivencia oficial \[cite: 41\].
- **Generación de Sanciones:** Aplicación parametrizada de multas económicas automáticas cargadas directamente al estado de cuenta del residente, basándose en la gravedad y reincidencia de la falta según el reglamento configurado \[cite: 42, 50\].
- **Consulta del Reglamento:** Interfaz conversacional amigable para residentes que permite buscar y resolver dudas sobre normas de convivencia directamente desde su aplicación \[cite: 43\].

### Módulo I: Control de Acceso y Seguridad (Opcional) \[cite: 44\]

Módulo diseñado para uso en portería o vigilancia física \[cite: 44\].

- **Registro de Visitantes:** Entrada digital de personas y vehículos en portería, registrando nombre, identificación, placas, hora de ingreso y destino \[cite: 45\].
- **Pre-Autorizaciones del Residente:** El usuario residente puede generar códigos QR de acceso o registrar autorizaciones anticipadas para invitados permanentes, servicios de mensajería o domicilios \[cite: 46\].
- **Reportes de Seguridad:** Historial analítico auditable de ingresos y salidas totales para investigaciones y control de flujos de proveedores o personal externo \[cite: 47\].

## 3\. Plan de Desarrollo Paso a Paso para la IA (Roadmap de Prompts)

Copie y envíe los siguientes enunciados secuencialmente a su asistente de desarrollo de IA para guiar la construcción del software:

\=== PASO 1: MODELO DE DATOS Y AUTENTICACIÓN ===  
"Actúa como un arquitecto de software experto. Configura la base de datos relacional para una aplicación de Propiedad Horizontal basándote en los roles de Administrador, Comité, Vigilancia y Residente. Genera los modelos de usuario, perfiles y las entidades iniciales para Unidades Habitacionales asociadas. Implementa el sistema de autenticación JWT y el control de accesos por roles (RBAC)."  
<br/>\=== PASO 2: CONSTRUCCIÓN DEL MÓDULO FINANCIERO ===  
"Desarrolla el Módulo de Gestión Financiera. Necesito la lógica para importar archivos CSV/Excel de estados de cartera externos, la generación y envío programado de Cuentas de Cobro mensuales por correo electrónico, y una regla automatizada que si una unidad excede los días de mora configurados, cambie su estado a 'Bloqueado para Reservas'."  
<br/>\=== PASO 3: SISTEMA DE RESERVAS Y VALIDACIONES ===  
"Implementa el Módulo de Reservas de Áreas Comunes. Crea los endpoints para CRUD de zonas comunes y un calendario de disponibilidad. Agrega un middleware de validación que consulte el estado financiero del usuario en el Módulo Financiero antes de confirmar cualquier reserva; rechaza la transacción si el usuario está en mora."  
<br/>\=== PASO 4: MÓDULO DE ATENCIÓN, PQRS Y COMUNICACIÓN ===  
"Desarrolla el motor de radicación de PQRS con generación de números de ticket consecutivos y asignación de estados. Agrega la funcionalidad para envío masivo de circulares segmentadas por torres o tipos de residente e integra el servicio de notificaciones por correo electrónico."  
<br/>\=== PASO 5: CONVIVENCIA, ACCESOS Y AJUSTES FINALES ===  
"Construye los módulos restantes de Convivencia (registro de infracciones y cálculo automático de sanciones por reincidencia) y el Módulo Opcional de Control de Acceso para vigilancia. Integra el sistema de logs/auditoría global de la plataforma para registrar todos los movimientos administrativos."