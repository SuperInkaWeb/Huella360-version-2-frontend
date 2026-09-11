export interface UserProfile {
  name: string;
  role: string;
  avatarUrl: string;
}

export interface KPIStats {
  label: string;
  value: string;
  trend: number;
  trendLabel: string; // e.g., "+12%"
  icon: "revenue" | "appointments" | "sales";
}

export interface InventoryItem {
  id: string;
  name: string;
  status: "low" | "out" | "ok";
  statusText: string;
  action?: string;
}

export interface Appointment {
  id: string;
  petName: string;
  petBreed: string;
  ownerName: string;
  petImage: string;
  serviceName: string;
  serviceDesc: string;
  date: string; // ISO string o formato legible
  status: "Upcoming" | "Pending" | "Completed";
}
