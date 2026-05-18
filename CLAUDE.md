# Guía de Desarrollo - Asistente de Propiedad Horizontal



## Directrices de Arquitectura
- **Backend:** Clean Architecture / MVC. Toda regla de negocio (cartera, bloqueos, sanciones) debe estar en la capa de servicios, no en los controladores. Asi mismo el backend tiene que ser python optimizado con FAST API
- **Frontend:** Componentes modulares, tipado estricto, el stack es a tu libertad sin embargo una vez elegido tienes que cambiar esta linea con el stack en cuestion y justificarlo.

---

## 🛠️ PROTOCOLOS DE SUPERPODERES (SKILLS AUTOMÁTICAS)

Claude, debes ejecutar estos protocolos de manera autónoma utilizando tus herramientas MCP activas:

### 1. 🧠 Skill: Sincronización de Memoria y Arquitectura (Obsidian MCP)
- **Cuándo usarlo:** Al inicio de cada sesión de desarrollo o al terminar un módulo.
- **Acción:** 1. Lee la nota `App_Propiedad_Horizontal_Specs.md` en tu bóveda de Obsidian para entender el alcance global.
  2. Cada vez que tomes una decisión de diseño crítica (ej. cómo se calcula la mora en el Módulo Financiero), escribe un micro-resumen en tu memoria persistente o actualiza la nota técnica en Obsidian para no sufrir de "olvido de contexto".

### 2. 🗄️ Skill: Validación de Datos en Tiempo Real (Postgres/SQLite MCP)
- **Cuándo usarlo:** Antes de escribir cualquier Query, Modelo o Migración del backend.
- **Acción:**
  1. NO asumas cómo se llaman las tablas o columnas. Ejecuta el MCP de Base de Datos para inspeccionar el esquema actual.
  2. Si vas a relacionar un Residente con una Unidad Habitacional, verifica primero las llaves foráneas existentes para evitar errores de compilación o colisiones en la base de datos.

### 3. 👁️ Skill: Visual QA y Auto-Corrección Frontend (Puppeteer/Playwright MCP)
- **Cuándo usarlo:** Al finalizar cualquier vista del Frontend (Dashboard de administrador, pasarela de reservas, etc.).
- **Acción:**
  1. Levanta el servidor local de desarrollo si no está corriendo.
  2. Usa el MCP de navegación (Puppeteer) para abrir la ruta correspondiente (`localhost:3000/...`).
  3. Toma una captura de pantalla y analiza visualmente el layout. 
  4. Revisa los logs de la consola del navegador a través del MCP. Si ves errores de JS o desbordamientos de CSS (Tailwind), **corrígelos inmediatamente sin que el usuario te lo pida**.

### 4. 🌿 Skill: Control de Versiones Atómico (Git MCP)
- **Cuándo usarlo:** Al completar un paso del roadmap (ej: terminar el backend del Módulo A).
- **Acción:**
  1. Divide el trabajo en ramas (ej: `feature/modulo-financiero`).
  2. Haz commits atómicos y descriptivos. No mezcles código del frontend de reservas con el backend de morosos en el mismo commit.