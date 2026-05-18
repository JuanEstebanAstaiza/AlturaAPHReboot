# Plan de Frontend — Asistente de Propiedad Horizontal

## Stack Tecnológico Elegido

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| **Framework** | Next.js 14+ (App Router) | SSR para dashboards admin, CSR para resident portal, routing file-system based, ecosystem maduro |
| **Lenguaje** | TypeScript strict | Tipado estricto requerido por CLAUDE.md, previene bugs en lógica financiera y reservas |
| **UI Components** | shadcn/ui + Radix Primitives | Headless, accessible, tailwind-based, fully customizable (no locked-in styles como MUI), copiable y editable |
| **Styling** | Tailwind CSS | Utility-first, consistente con shadcn/ui, hot reload rápido |
| **State** | TanStack Query + Zustand | Query para server state (API calls), Zustand para client state (auth, UI prefs) — mínimo boilerplate |
| **Charts** | Recharts | Library más estable de React, compatible con TypeScript, customizable |
| **Forms** | React Hook Form + Zod | Validation declarativa, Zod schema shared con backend |
| **Calendar** | @internationalized/date + custom calendar | Calendario de reservas necesita vista mes/semana con drag-select |
| **Tables** | TanStack Table | Virtualización para lists grandes (morosos, proveedores, PQRS) |
| **Auth** | NextAuth.js (Auth.js) v5 | JWT sessions, RBAC middleware, compatible con backend Python |
| **Icons** | Lucide React | Consistent con shadcn/ui ecosystem, tree-shakeable |
| **Notifications** | Sonner + Push API | Toast notifications para alerts de mora, PQRS, reservas |
| **PDF** | @react-pdf/renderer | Paz y salvo, cuentas de cobro, actas generadas client-side |

---

## Diseño Visual — Referencias Consultadas

### Paleta de Colores (inspirada en property management dashboards profesionales)

```
Primary:    #2563EB (Blue 600) — confianza, profesionalismo
Secondary:  #0F172A (Slate 900) — text, sidebar
Accent:     #059669 (Green 600) — métricas positivas, saldo al día
Alert:      #DC2626 (Red 600) — mora, infracciones, bloqueos
Warning:    #D97706 (Amber 600) — alerts de contratos, advertencias
Neutral:    #F8FAFC (Slate 50) — backgrounds
```

### Layout Patterns (basados en referencias de Dribbble, Behance y Tailwind UI)

1. **Admin Dashboard**: Sidebar izquierda + top navbar + KPI cards en grid modular
2. **Resident Portal**: Layout más cálido, cards con bordes redondeados, iconografía amigable
3. **Vigilancia**: Layout simplificado, botones grandes, alto contraste
4. **Comité/Consejo**: Focus en reportes y kanban de compromisos

### Inspiración de Referencias

- **Dribbble**: Property management dashboards usan paletas azul/gris/blanco, KPIs prominentes, grids modulares, navegación lateral
- **Tailwind UI**: Application UI blocks (sidebar, tables, form layouts, feeds, command palette)
- **shadcn/ui**: Dashboard templates con sidebar navigation, data tables, charts, modals

---

## Estructura de Directorios del Frontend

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/             # Route group: login, register, forgot-password
│   ├── (dashboard)/        # Route group: admin/comité dashboard
│   │   ├── layout.tsx      # Sidebar + top navbar
│   │   ├── page.tsx        # Dashboard home
│   │   ├── financiero/     # Módulo A
│   │   ├── residentes/     # Módulo B
│   │   ├── pqrs/           # Módulo C
│   │   ├── contratos/      # Módulo D
│   │   ├── documentos/     # Módulo E
│   │   ├── asambleas/      # Módulo F
│   │   ├── reservas/       # Módulo G
│   │   ├── convivencia/    # Módulo H
│   │   ├── acceso/         # Módulo I
│   │   └── config/         # Admin config global
│   ├── (resident)/         # Route group: portal residente
│   │   ├── layout.tsx      # Resident layout (simplificado)
│   │   ├── page.tsx        # Resident home
│   │   ├── estado-cuenta/
│   │   ├── reservas/
│   │   ├── pqrs/
│   │   ├── reglamento/
│   │   └── documentos/
│   └── (vigilancia)/       # Route group: vigilancia
│       ├── layout.tsx
│       └── page.tsx
├── components/
│   ├── ui/                 # shadcn/ui components (copied, not node_modules)
│   ├── layout/             # Sidebar, TopNav, Breadcrumb, MobileMenu
│   ├── financial/          # KPI cards, Morosos table, Estado de cuenta
│   ├── reservations/       # Calendar, Booking form, Availability grid
│   ├── pqrs/               # Ticket list, PQRS form, Status badge
│   ├── documents/          # File tree, Viewer, Upload zone
│   ├── convivencia/        # Infractions list, Sanction calculator
│   ├── assemblies/         # Kanban compromisos, Vote interface
│   ├── shared/             # DataTable, Search, Filters, Pagination
│   └── charts/             # Revenue chart, Payment rate, Occupancy
├── lib/
│   ├── api/                # API client (fetch wrappers per module)
│   ├── auth/               # Auth helpers, RBAC guards
│   ├── utils.ts            # cn(), formatCurrency(), formatDate()
│   └── constants.ts        # Roles, statuses, config defaults
├── hooks/
│   ├── useAuth.ts
│   ├── useAPI.ts
│   ├── useRoles.ts
│   └── useReservations.ts
├── types/
│   ├── user.ts
│   ├── financial.ts
│   ├── reservation.ts
│   ├── pqrs.ts
│   ├── document.ts
│   └── index.ts
├── styles/
│   └── globals.css         # Tailwind imports + CSS variables
└── config/
    └── app.ts             # App config, feature flags
```

---

## Plan de Implementación Frontend — Paso a Paso

### FASE 1: Foundation (Semanas 1-2)

#### 1.1 Setup del Proyecto
- `npx create-next-app@latest` con TypeScript, Tailwind, App Router
- Instalar shadcn/ui: `npx shadcn-ui@latest init`
- Install: shadcn/ui components needed (button, input, card, table, dialog, dropdown, select, badge, tabs, sidebar, command, toast, calendar, chart, avatar, checkbox, radio-group, switch, separator, scroll-area, popover, sheet, tooltip, progress, alert-dialog)
- Install: zustand, @tanstack/react-query, react-hook-form, zod, lucide-react, recharts, sonner, @react-pdf/renderer

#### 1.2 Design System
- Definir CSS variables en `globals.css` con la paleta de colores
- Crear `cn()` utility
- Configurar Tailwind theme extensions (colors, spacing, borderRadius)
- Crear layout base: `Sidebar + TopNav + Breadcrumb`

#### 1.3 Auth System
- Login page con formulario (email/password)
- NextAuth config con JWT strategy
- RBAC middleware: `middleware.ts` que redirect según role
- Protected route HOC: `requireRole(['admin'])`
- Types: `User`, `Role`, `Permission`

### FASE 2: Dashboards Core (Semanas 3-4)

#### 2.1 Admin Dashboard Home
- KPI cards grid: Total unidades, Cartera activa, Morosos %, Reservas este mes
- Chart: Revenue trend (Recharts AreaChart)
- Chart: Payment rate by month
- Quick actions panel
- Recent activity feed

#### 2.2 Resident Portal Home
- Card con estado de cuenta resumido
- Quick links: reservas, PQRS, documentos
- Notifications panel
- Botón de IA assistant (FAQ bot)

#### 2.3 Vigilancia Layout
- Layout simplificado con botones grandes
- Quick actions: registrar visitante, verificar QR
- Access log table

### FASE 3: Módulos Funcionales (Semanas 5-8)

#### 3.1 Módulo A: Financiero
- **Import CSV/Excel**: Upload zone con drag-drop, preview de data, validation errors
- **Cuentas de Cobro**: Table con filtros (torre, estado, coeficiente), bulk generate button
- **Morosos**: Table con status badges (color-coded), export button
- **Estado de Cuenta**: Interactive panel with breakdown, payment history timeline
- **Paz y Salvo**: Download button with PDF generation, real-time balance check
- **Charts**: Cartera aging, payment trends

#### 3.2 Módulo B: Residentes
- **Directory**: Searchable table with filters, resident detail panel
- **Vinculación**: Form para vincular residente-unidad
- **Documentos Personales**: Upload zone, document viewer, version history
- **Historial**: Timeline view de interacciones

#### 3.3 Módulo C: PQRS
- **Ticket List**: Table con status badges, filters by category/status
- **PQRS Form**: Multi-step form con category selection, file attachments
- **Circular Masiva**: Form con segment filters (tower, type), preview
- **FAQ Bot**: Chat interface (conectar con backend AI)

#### 3.4 Módulo D: Contratos y Proveedores
- **Contracts**: Calendar view de vencimientos, alert cards (30/15/5 days)
- **Maintenance Calendar**: Annual preventive schedule with status
- **Corrective Maintenance**: Report form with evidence upload, quotation comparison
- **Provider Directory**: Cards con rating, history, certification status

#### 3.5 Módulo E: Documentos
- **File Tree**: Hierarchical navigation (Financiero, Actas, Reglamentos)
- **Search**: Advanced search with keyword, tag, date filters
- **Document Viewer**: PDF/image viewer with version comparison
- **Upload**: Drag-drop zone with classification auto-suggest

#### 3.6 Módulo F: Asambleas
- **Convocatorias**: Form para orden del día, scheduling
- **Quorum Control**: Real-time attendance tracking with coeficient display
- **Votes**: Digital voting interface with results chart
- **Actas Archive**: Chronological list with digital signatures
- **Compromisos Kanban**: Kanban board con drag-drop tasks

#### 3.7 Módulo G: Reservas
- **Availability Calendar**: Month/week view, zone selector, color-coded availability
- **Booking Form**: Date picker, time slots, zone selection, fee calculation
- **Validation**: Financial check middleware (show block reason if mora)
- **Audit History**: Per-unit reservation history table

#### 3.8 Módulo H: Convivencia
- **Infracciones**: Report form with photo upload, category selection
- **Escalation**: Case timeline with auto-escalation indicators
- **Sanctions**: Calculator display with regulation reference
- **Reglamento**: Searchable regulation text with conversational interface

#### 3.9 Módulo I: Control de Acceso
- **Visitor Registration**: Form con name, ID, plate, destination
- **QR Authorization**: QR code generator, pre-authorization list
- **Security Reports**: Analytics with entry/exit charts

### FASE 4: Polish & Production (Semanas 9-10)

#### 4.1 Responsive Design
- Mobile layouts for all modules
- Tablet breakpoints
- Touch-friendly interactions

#### 4.2 Accessibility
- ARIA labels, keyboard navigation
- Color contrast verification
- Screen reader support

#### 4.3 Performance
- Code splitting per route group
- Image optimization
- Data virtualization for large tables
- SWR caching strategy

#### 4.4 Final Integration
- WebSocket for real-time reservations
- Email notification previews
- PDF generation testing
- Dark mode toggle (optional)

---

## Componentes Clave — Wireframes Textuales

### Admin Dashboard Home

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]  [Search...]  [Notifications]  [Admin ▼]            │
├──────────┬──────────────────────────────────────────────────┤
│          │  Dashboard Principal                             │
│ 🏠 Home  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          │
│ 💰 Finanz│  │ 350  │ │ 28   │ │ 8.2% │ │ 42   │          │
│ 👥 Resident│Unidades│Morosos│Cartera│Reservas│          │
│ 📋 PQRS   │  └──────┘ └──────┘ └──────┘ └──────┘          │
│ 📄 Docs   │                                          │
│ 🏛 Asamble│  ┌──────────────────┐ ┌──────────────────┐   │
│ 🏊 Reservas│  │ Ingresos Mensual │ │ Tasa de Pago     │   │
│ 🤝 Conviv.│  │  [AreaChart]     │ │  [PieChart]      │   │
│ 🔒 Acceso  │  └──────────────────┘ └──────────────────┘   │
│ ⚙️ Config  │                                          │
│          │  ┌──────────────────────────────────────┐     │
│          │  │ Acciones Rápidas                     │     │
│          │  │ [Generar Cuentas] [Exportar] [PQRS]  │     │
│          │  └──────────────────────────────────────┘     │
│          │                                          │
│          │  ┌──────────────────────────────────────┐     │
│          │  │ Actividad Reciente                   │     │
│          │  │ • María G. reservó Salón Social      │     │
│          │  │ • Cuenta de cobro #1247 generada     │     │
│          │  │ • PQRS #0892 escalada                │     │
│          │  └──────────────────────────────────────┘     │
└──────────┴──────────────────────────────────────────────────┘
```

### Estado de Cuenta Residente

```
┌─────────────────────────────────────────────────────────────┐
│ [Logo]  [Mi Portal]  [Notificaciones]  [Residente ▼]       │
├─────────────────────────────────────────────────────────────┤
│  Unidad: Torre A - Apt 1204  |  Coeficiente: 3.2%         │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Saldo Actual: $4,250,000                           │  │
│  │  Estado: ⚠️ CON MORA (45 días)                     │  │
│  │  [Ver desglose]  [Realizar Pago]                    │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  ┌──────────────────┐  ┌──────────────────┐               │
│  │ Cuentas de Cobro │  │ Pagos Aplicados  │               │
│  │ ┌──────────────┐ │  │ ┌──────────────┐ │               │
│  │ │ Feb 2026     │ │  │ │ 15/03/2026   │ │               │
│  │ │ $3,800,000   │ │  │ │ $3,800,000   │ │               │
│  │ │ ✅ Pagada    │ │  │ │ ✅ Aplicado  │ │               │
│  │ │ ──────────── │ │  │ │ ──────────── │ │               │
│  │ │ Mar 2026     │ │  │ │ 01/02/2026   │ │               │
│  │ │ $3,800,000   │ │  │ │ $3,500,000   │ │               │
│  │ │ ⚠️ Vencida   │ │  │ │ ⚠️ Parcial   │ │               │
│  │ └──────────────┘ │  │ └──────────────┘ │               │
│  └──────────────────┘  └──────────────────┘               │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Paz y Salvo: No disponible (saldo pendiente)       │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### Calendario de Reservas

```
┌─────────────────────────────────────────────────────────────┐
│  [←]  Mayo 2026  [→]    Zona: [Salón Social ▼]  [Semana ▼] │
├─────────────────────────────────────────────────────────────┤
│           Lun    Mar    Mié    Jue    Vie    Sáb    Dom     │
│  Sem 1    27     28     29     30    01     02     03     │
│           [dispo] [dispo] [dispo] [dispo] [LIBRE] [LIBRE] [dispo]│
│  Sem 2    04     05     06     07     08     09     10     │
│           [RESERV] [LIBRE] [LIBRE] [dispo] [LIBRE] [LIBRE] [dispo]│
│  Sem 3    11     12     13     14     15     16     17     │
│           [LIBRE] [LIBRE] [RESERV] [LIBRE] [LIBRE] [LIBRE] [dispo]│
│  Sem 4    18     19     20     21     22     23     24     │
│           [LIBRE] [dispo] [dispo] [dispo] [LIBRE] [LIBRE] [dispo]│
├─────────────────────────────────────────────────────────────┤
│  Leyenda: [LIBRE] disponible  [RESERV] reservado  [dispo] parcial│
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │  Mi Reserva: 12 de Mayo, 14:00 - 22:00             │  │
│  │  Salón Social - Tarifa: $150,000                    │  │
│  │  [Modificar]  [Cancelar]  [Ver detalle]              │  │
│  └─────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Consideraciones Técnicas

### API Integration Pattern
```typescript
// lib/api/client.ts
const api = {
  financial: {
    importCSV: (file: File) => post('/api/financial/import'),
    generateBills: (params) => post('/api/financial/generate'),
    getStatement: (unitId) => get(`/api/financial/statement/${unitId}`),
    getPazYSalvo: (unitId) => get(`/api/financial/paz-y-salvo/${unitId}`),
  },
  reservations: {
    getAvailability: (zone, dateRange) => get(`/api/reservations/availability`),
    createBooking: (data) => post('/api/reservations'),
    validateFinancial: (unitId) => get(`/api/reservations/validate/${unitId}`),
  },
  pqrs: {
    createTicket: (data) => post('/api/pqrs'),
    getList: (filters) => get('/api/pqrs'),
  },
  // ... other modules
};
```

### RBAC Middleware
```typescript
// middleware.ts
export function middleware(request: NextRequest) {
  const role = getRoleFromSession(request);
  const path = request.nextUrl.pathname;
  
  if (path.startsWith('/(dashboard)') && role !== 'admin' && role !== 'comite') {
    return redirect('/(resident)');
  }
  if (path.startsWith('/(vigilancia)') && role !== 'vigilancia') {
    return redirect('/(resident)');
  }
  // ... more rules
}
```

### Financial Validation for Reservations
```typescript
// Component: ReservationForm
async function canReserve(unitId: string): Promise<boolean> {
  const result = await api.reservations.validateFinancial(unitId);
  if (!result.allowed) {
    showError(`Bloqueado: ${result.reason} (${result.moraDays} días de mora)`);
  }
  return result.allowed;
}
```
