import type { Appointment, InventoryItem, KPIStats } from "./types";

export const kpiData: KPIStats[] = [
  {
    label: "Total Revenue",
    value: "$12,450",
    trend: 12,
    trendLabel: "+12%",
    icon: "revenue",
  },
  {
    label: "Active Appointments",
    value: "45 Scheduled",
    trend: 5,
    trendLabel: "+5%",
    icon: "appointments",
  },
  {
    label: "Product Sales",
    value: "120 Items",
    trend: 8,
    trendLabel: "+8%",
    icon: "sales",
  },
];

export const inventoryData: InventoryItem[] = [
  {
    id: "1",
    name: "Premium Dog Food",
    status: "low",
    statusText: "Only 4 bags left",
    action: "Restock",
  },
  {
    id: "2",
    name: "Sensitive Skin Shampoo",
    status: "out",
    statusText: "Out of stock",
    action: "Order",
  },
  {
    id: "3",
    name: "Cat Treats (Salmon)",
    status: "ok",
    statusText: "Stock healthy: 45 units",
  },
];

export const appointmentsData: Appointment[] = [
  {
    id: "1",
    petName: "Buster",
    petBreed: "French Bulldog",
    ownerName: "John Doe",
    petImage:
      "https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=100&h=100",
    serviceName: "Full Grooming",
    serviceDesc: "Wash, Cut, Nail Trim",
    date: "Today, 2:00 PM",
    status: "Upcoming",
  },
  {
    id: "2",
    petName: "Luna",
    petBreed: "Siamese",
    ownerName: "Sarah Smith",
    petImage:
      "https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&w=100&h=100",
    serviceName: "Vaccination",
    serviceDesc: "Annual Booster",
    date: "Today, 3:30 PM",
    status: "Pending",
  },
  {
    id: "3",
    petName: "Max",
    petBreed: "Golden Retriever",
    ownerName: "Mike Ross",
    petImage:
      "https://images.unsplash.com/photo-1633722715463-d30f4f325e24?auto=format&fit=crop&w=100&h=100",
    serviceName: "Dental Cleaning",
    serviceDesc: "Routine Hygiene",
    date: "Today, 11:00 AM",
    status: "Completed",
  },
];
