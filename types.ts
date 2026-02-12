
export enum CenterStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  MAINTENANCE = 'MAINTENANCE'
}

export interface TrainingCenter {
  id: string;
  name: string;
  location: string;
  capacity: number;
  status: CenterStatus;
  currentTenant?: string;
  lastMaintenance: string;
  nextMaintenance: string;
  occupancyRate: number;
  // Status for each month (1-12)
  monthlyStatus: CenterStatus[];
  // Tenant for each month (1-12)
  monthlyTenants: (string | undefined)[];
}

export interface Booking {
  id: string;
  centerId: string;
  tenantName: string;
  startDate: string;
  endDate: string;
}

export interface DashboardStats {
  totalOccupancy: number;
  avgOccupancy: number;
  maintenanceCount: number;
  totalBeneficiaries: number;
}
