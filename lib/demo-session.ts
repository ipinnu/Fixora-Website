export type DemoRole = "customer" | "artisan" | "admin";

const STORAGE_KEY = "fixora_demo_role";

export const DEMO_ROUTES: Record<DemoRole, string> = {
  customer: "/customer",
  artisan: "/artisan",
  admin: "/admin",
};

export const DEMO_PROFILES = {
  customer: {
    fullName: "Demo Client",
    email: "demo.client@fixora.ng",
    state: "Lagos",
    phone: null as string | null,
  },
  artisan: {
    fullName: "Demo Artisan",
    email: "demo.artisan@fixora.ng",
    state: "Lagos",
    phone: null as string | null,
  },
};

export function setDemoSession(role: DemoRole) {
  sessionStorage.setItem(STORAGE_KEY, role);
}

export function getDemoSession(): DemoRole | null {
  if (typeof window === "undefined") return null;
  const value = sessionStorage.getItem(STORAGE_KEY);
  if (value === "customer" || value === "artisan" || value === "admin") return value;
  return null;
}

export function clearDemoSession() {
  if (typeof window === "undefined") return;
  sessionStorage.removeItem(STORAGE_KEY);
}

export function isDemoSession(): boolean {
  return getDemoSession() !== null;
}
