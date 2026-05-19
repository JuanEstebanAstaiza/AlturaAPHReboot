# Guía de Desarrollo - Asistente de Propiedad Horizontal

## Contexto Actual
- **Backend:** MVP-1 + MVP-2 completados — 28/28 tests passed — Commit `4fe1a55`
- **Frontend:** GREENFIELD — no existe. Iniciar con MVP-1 (Foundation + Auth) y MVP-2 (Dashboards)
- **Guía de continuación:** `MCP_APH/Continuation_Guide_MVP2_to_Frontend.md`

## Directrices de Arquitectura
- **Backend:** Clean Architecture / MVC. Toda regla de negocio (cartera, bloqueos, sanciones) debe estar en la capa de servicios, no en los controladores. Backend Python optimizado con FAST API.
- **Frontend:** Next.js 14+ (App Router), TypeScript strict, shadcn/ui + Radix, Tailwind CSS, TanStack Query + Zustand, Recharts, React Hook Form + Zod.

---

## 🛠️ PROTOCOLOS DE SUPERPODERES (SKILLS AUTOMÁTICAS)

Claude, debes ejecutar estos protocolos de manera autónoma utilizando tus herramientas MCP activas:

### 1. 🧠 Sincronización de Memoria y Arquitectura (Obsidian MCP)
- **Cuándo usarlo:** Al inicio de cada sesión de desarrollo o al terminar un módulo.
- **Acción:**
  1. Lee `App_Propiedad_Horizontal_Specs.md` en la bóveda de Obsidian para entender el alcance global.
  2. Lee `Continuation_Guide_MVP2_to_Frontend.md` para conocer el estado actual y próximos pasos.
  3. Cada vez que tomes una decisión de diseño crítica, actualiza la nota técnica en Obsidian.

### 2. 🔍 Investigación con Tavily MCP (NUEVO)
- **Cuándo usarlo:**
  - Cuando necesites verificar APIs, libraries, o best practices que no tienes memorizado.
  - Antes de instalar un package nuevo — verificar compatibilidad y versión más reciente.
  - Para buscar soluciones a errores específicos de frameworks (FastAPI, Next.js, shadcn/ui, etc.).
  - Cuando el usuario mencione "busca", "investiga", "verifica" o necesite info actualizada.
- **Acción:**
  1. Usa `tavily_search` para búsquedas web rápidas y relevantes.
  2. Usa `tavily_research` para investigaciones profundas (múltiples fuentes).
  3. Usa `tavily_extract` para extraer contenido de documentación específica.
  4. **Informar siempre antes de buscar:** qué vas a buscar, en qué fuente, por qué.

### 3. 🗄️ Validación de Datos en Tiempo Real (Postgres/SQLite MCP)
- **Cuándo usarlo:** Antes de escribir cualquier Query, Modelo o Migración del backend.
- **Acción:**
  1. NO asumas cómo se llaman las tablas o columnas. Ejecuta el MCP de Base de Datos para inspeccionar el esquema actual.
  2. Si vas a relacionar un Residente con una Unidad Habitacional, verifica primero las llaves foráneas existentes.

### 4. 👁️ Visual QA y Auto-Corrección Frontend (Puppeteer/Playwright MCP)
- **Cuándo usarlo:** Al finalizar cualquier vista del Frontend.
- **Acción:**
  1. Levanta el servidor local de desarrollo.
  2. Usa el MCP de navegación para abrir la ruta (`localhost:3000/...`).
  3. Toma captura de pantalla y analiza visualmente el layout.
  4. Revisa los logs de la consola del navegador. Si ves errores de JS o desbordamientos de CSS, **corrígelos inmediatamente**.

### 5. 🌿 Control de Versiones Atómico (Git MCP)
- **Cuándo usarlo:** Al completar un paso del roadmap.
- **Acción:**
  1. Divide el trabajo en ramas (ej: `feature/modulo-financiero`).
  2. Haz commits atómicos y descriptivos. No mezcles código de módulos diferentes en el mismo commit.