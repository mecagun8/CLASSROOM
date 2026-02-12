
import React from 'react';
import { TrainingCenter, CenterStatus } from '../types';

interface CenterCardProps {
  center: TrainingCenter;
  onClick: (center: TrainingCenter) => void;
}

const CenterCard: React.FC<CenterCardProps> = ({ center, onClick }) => {
  const getStatusStyle = (status: CenterStatus) => {
    switch (status) {
      case CenterStatus.AVAILABLE:
        return 'bg-green-100 text-green-700 border-green-200';
      case CenterStatus.OCCUPIED:
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case CenterStatus.MAINTENANCE:
        return 'bg-amber-100 text-amber-700 border-amber-200';
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  const getStatusText = (status: CenterStatus) => {
    switch (status) {
      case CenterStatus.AVAILABLE: return '임대 가능';
      case CenterStatus.OCCUPIED: return '임대 중';
      case CenterStatus.MAINTENANCE: return '정비 중';
    }
  };

  return (
    <div 
      onClick={() => onClick(center)}
      className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all cursor-pointer group"
    >
      <div className="flex justify-between items-start mb-4">
        <div>
          <h4 className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
            {center.name}
          </h4>
          <p className="text-xs text-slate-400">{center.location}</p>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${getStatusStyle(center.status)}`}>
          {getStatusText(center.status)}
        </span>
      </div>

      <div className="space-y-3">
        <div className="flex justify-between items-center text-sm">
          <span className="text-slate-500">가동률</span>
          <span className="font-semibold text-slate-700">{center.occupancyRate}%</span>
        </div>
        <div className="w-full bg-slate-100 rounded-full h-1.5">
          <div 
            className="bg-blue-500 h-1.5 rounded-full" 
            style={{ width: `${center.occupancyRate}%` }}
          />
        </div>
        
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-50">
          <div className="text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">수용 인원</p>
            <p className="text-xs font-semibold">{center.capacity}명</p>
          </div>
          <div className="text-center border-l border-slate-50">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider">월 임대료</p>
            <p className="text-xs font-semibold">{ (center.monthlyRent / 10000).toLocaleString() }만원</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CenterCard;
