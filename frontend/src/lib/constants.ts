export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const ROLES = {
  SUPERUSER: "superuser",
  ADMIN: "admin",
  COMITE: "comite",
  VIGILANCIA: "vigilancia",
  RESIDENT: "resident",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const DEFAULT_ROLE_PERMISSIONS: Record<Role, string[]> = {
  superuser: [
    "pqrs", "documents", "reservations", "financial", "assemblies",
    "convivencia", "access", "admin_dashboard", "resident_portal", "superuser_access",
  ],
  admin: [
    "pqrs", "documents", "reservations", "assemblies", "convivencia",
    "access", "admin_dashboard", "resident_portal",
  ],
  comite: ["pqrs", "documents", "convivencia", "assemblies"],
  vigilancia: ["access", "documents"],
  resident: ["pqrs", "documents", "reservations", "resident_portal"],
};

export const SUBSCRIPTION_PLANS = {
  free: {
    maxTenants: 1,
    monthlyPrice: 0,
    features: ["pqrs", "documents", "resident_portal", "admin_dashboard"],
  },
  basic: {
    maxTenants: 3,
    monthlyPrice: 50000,
    features: ["pqrs", "documents", "resident_portal", "reservations", "admin_dashboard"],
  },
  professional: {
    maxTenants: 10,
    monthlyPrice: 150000,
    features: [
      "pqrs", "documents", "resident_portal", "reservations",
      "assemblies", "convivencia", "access", "admin_dashboard",
    ],
  },
  enterprise: {
    maxTenants: 999999,
    monthlyPrice: 500000,
    features: [
      "pqrs", "documents", "resident_portal", "reservations",
      "assemblies", "convivencia", "financial", "access",
      "admin_dashboard", "superuser_access",
    ],
  },
} as const;

export const PQRS_STATUS = {
  OPEN: "open",
  IN_PROGRESS: "in_progress",
  ESCALATED: "escalated",
  CLOSED: "closed",
} as const;

export const PQRS_PRIORITY = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent",
} as const;

export const PQRS_TYPE = {
  PETICION: "p",
  QUEJA: "q",
  SUGERENCIA: "r",
  RECLAMO: "s",
} as const;

export const PQRS_TYPE_LABELS: Record<string, string> = {
  p: "Petición",
  q: "Queja",
  r: "Sugerencia",
  s: "Reclamo",
};

export const PQRS_STATUS_LABELS: Record<string, string> = {
  open: "Abierto",
  in_progress: "En Proceso",
  escalated: "Escalado",
  closed: "Cerrado",
};

export const PQRS_STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  in_progress: "bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200",
  escalated: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  closed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
};

export const SUBSCRIPTION_STATUS_LABELS: Record<string, string> = {
  active: "Activa",
  expired: "Expirada",
  cancelled: "Cancelada",
  trial: "Prueba",
};

export const SUBSCRIPTION_STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
  expired: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
  cancelled: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
  trial: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
};
