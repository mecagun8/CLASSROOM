
import { TrainingCenter, CenterStatus } from './types';

// 초기 데이터를 모두 비어있는 상태(AVAILABLE)로 생성합니다.
const generateEmptyMonthlyData = () => {
  const status: CenterStatus[] = Array(12).fill(CenterStatus.AVAILABLE);
  const tenants: (string | undefined)[] = Array(12).fill(undefined);
  return { status, tenants };
};

export const MOCK_CENTERS: TrainingCenter[] = Array.from({ length: 13 }, (_, i) => {
  const { status, tenants } = generateEmptyMonthlyData();
  return {
    id: `center-${i + 1}`,
    name: `교육장 ${String(i + 1).padStart(2, '0')}호`,
    location: i < 7 ? '강남 테헤란로' : '종로 인사동',
    capacity: 20 + (i * 5),
    status: CenterStatus.AVAILABLE,
    currentTenant: undefined,
    lastMaintenance: '2024-03-01',
    nextMaintenance: '2024-06-15',
    occupancyRate: 0,
    monthlyRent: 1500000 + (i * 100000), // 샘플 임대료 데이터 추가
    monthlyStatus: status,
    monthlyTenants: tenants,
  };
});

export const MONTHS = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

export const USAGE_DATA = [
  { name: '1월', users: 0 },
  { name: '2월', users: 0 },
  { name: '3월', users: 0 },
  { name: '4월', users: 0 },
  { name: '5월', users: 0 },
];
