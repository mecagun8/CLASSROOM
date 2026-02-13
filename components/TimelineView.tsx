
import React, { useState, useRef, useEffect } from 'react';
import { TrainingCenter, CenterStatus } from '../types';
import { MONTHS } from '../constants';
import { X, Calendar, User, Info, AlertCircle, PlusCircle, MoreVertical, Edit2, Check, Clock, Save, Trash2, ArrowRight, MapPin, Users as UsersIcon } from 'lucide-react';

interface TimelineViewProps {
  centers: TrainingCenter[];
  onUpdateCenterMeta: (id: string, updates: Partial<TrainingCenter>) => void;
  onUpdateTenant: (centerId: string, startMonth: number, endMonth: number, newTenant: string) => void;
  onDeleteSchedule: (centerId: string, startMonth: number, endMonth: number) => void;
}

interface Selection {
  center: TrainingCenter;
  monthIdx: number;
  status: CenterStatus;
  tenant?: string;
  duration?: number;
  block?: { start: number; end: number; tenant: string };
}

interface CenterMetaEdit {
  id: string;
  name: string;
  location: string;
  capacity: number;
}

const TimelineView: React.FC<TimelineViewProps> = ({ centers, onUpdateCenterMeta, onUpdateTenant, onDeleteSchedule }) => {
  const [selectedCell, setSelectedCell] = useState<Selection | null>(null);
  const [metaEdit, setMetaEdit] = useState<CenterMetaEdit | null>(null);
  
  // Schedule Management State
  const [tenantValue, setTenantValue] = useState('');
  const [durationValue, setDurationValue] = useState(1);

  const COLORS = [
    { bg: 'bg-[#3b82f6]', text: 'text-blue-600' },
    { bg: 'bg-[#6366f1]', text: 'text-indigo-600' },
    { bg: 'bg-[#8b5cf6]', text: 'text-purple-600' },
    { bg: 'bg-[#d946ef]', text: 'text-pink-600' },
    { bg: 'bg-[#f43f5e]', text: 'text-rose-600' },
    { bg: 'bg-[#f97316]', text: 'text-orange-600' },
  ];

  const handleCellClick = (center: TrainingCenter, monthIdx: number, block?: any) => {
    setSelectedCell({
      center,
      monthIdx,
      status: center.monthlyStatus[monthIdx],
      tenant: center.monthlyTenants[monthIdx],
      duration: block ? (block.end - block.start + 1) : 1,
      block: block
    });
    setTenantValue(center.monthlyTenants[monthIdx] || '');
    setDurationValue(block ? (block.end - block.start + 1) : 1);
  };

  const startEditingMeta = (center: TrainingCenter) => {
    setMetaEdit({
      id: center.id,
      name: center.name,
      location: center.location,
      capacity: center.capacity
    });
  };

  const handleSaveMeta = () => {
    if (metaEdit) {
      onUpdateCenterMeta(metaEdit.id, {
        name: metaEdit.name,
        location: metaEdit.location,
        capacity: metaEdit.capacity
      });
      setMetaEdit(null);
    }
  };

  const handleSaveSchedule = () => {
    if (selectedCell && tenantValue.trim()) {
      const endMonth = selectedCell.block 
        ? selectedCell.block.start + (durationValue - 1)
        : selectedCell.monthIdx + (durationValue - 1);
      
      onUpdateTenant(
        selectedCell.center.id, 
        selectedCell.block ? selectedCell.block.start : selectedCell.monthIdx, 
        Math.min(endMonth, 11), 
        tenantValue.trim()
      );
      setSelectedCell(null);
    }
  };

  const handleDelete = () => {
    if (selectedCell && selectedCell.block) {
      onDeleteSchedule(selectedCell.center.id, selectedCell.block.start, selectedCell.block.end);
      setSelectedCell(null);
    }
  };

  const getOccupiedBlocks = (center: TrainingCenter) => {
    const blocks: { start: number; end: number; tenant: string }[] = [];
    let currentBlock: { start: number; end: number; tenant: string } | null = null;

    center.monthlyStatus.forEach((status, idx) => {
      if (status === CenterStatus.OCCUPIED) {
        const tenant = center.monthlyTenants[idx] || '기관 미지정';
        if (currentBlock && currentBlock.tenant === tenant) {
          currentBlock.end = idx;
        } else {
          if (currentBlock) blocks.push(currentBlock);
          currentBlock = { start: idx, end: idx, tenant };
        }
      } else {
        if (currentBlock) {
          blocks.push(currentBlock);
          currentBlock = null;
        }
      }
    });
    if (currentBlock) blocks.push(currentBlock);
    return blocks;
  };

  return (
    <div className="bg-white rounded-[40px] border border-slate-100 shadow-2xl overflow-hidden relative p-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-4">
        <div>
          <div className="flex items-center gap-3 mb-1">
            <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-lg uppercase tracking-widest">2026 Fiscal Year</span>
            <h3 className="text-3xl font-black text-slate-900 tracking-tight">2026 연간 교육 스케줄링</h3>
          </div>
          <p className="text-slate-400 font-bold text-sm mt-2 flex items-center gap-2">
            <Clock size={16} className="text-blue-500" /> 
            2026년 전체 교육 일정을 한눈에 관리하세요. (교육장 정보 클릭 시 수정 가능)
          </p>
        </div>
        <div className="flex gap-3">
          <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm shadow-blue-200"></div>
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Occupied</span>
          </div>
          <div className="flex items-center gap-2 px-5 py-2.5 bg-slate-50 rounded-2xl border border-slate-100">
            <div className="w-3 h-3 rounded-full bg-slate-200"></div>
            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Available</span>
          </div>
        </div>
      </div>

      <div className="relative overflow-x-auto pb-10">
        <div className="min-w-[1100px]">
          {/* Months Header with Year Label */}
          <div className="flex ml-[280px] mb-8 items-center">
            {MONTHS.map((month) => (
              <div key={month} className="flex-1 text-center">
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] block">2026</span>
                <span className="text-xs font-black text-slate-300 uppercase tracking-[0.2em]">{month}</span>
              </div>
            ))}
          </div>

          <div className="space-y-8">
            {centers.map((center, idx) => {
              const colorSet = COLORS[idx % COLORS.length];
              const blocks = getOccupiedBlocks(center);

              return (
                <div key={center.id} className="flex items-center group relative">
                  <div className="absolute left-[280px] right-0 top-0 bottom-0 pointer-events-none flex">
                    {MONTHS.map((_, mIdx) => (
                      <div key={mIdx} className="flex-1 border-l border-slate-50 h-full"></div>
                    ))}
                    <div className="flex-1 border-l border-r border-slate-50 h-full"></div>
                  </div>

                  {/* Left Label: Clickable to Edit Meta */}
                  <div 
                    onClick={() => startEditingMeta(center)}
                    className="w-[260px] shrink-0 flex items-center gap-4 bg-white p-4 rounded-[28px] border border-slate-100 shadow-sm hover:border-blue-300 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 relative z-20 cursor-pointer"
                  >
                    <div className={`w-11 h-11 shrink-0 rounded-[18px] ${colorSet.bg} flex items-center justify-center text-white font-black text-sm shadow-lg rotate-3 group-hover:rotate-0 transition-transform`}>
                      {String.fromCharCode(65 + (idx % 26))}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className="text-sm font-black text-slate-800 truncate">{center.name}</p>
                        <Edit2 size={12} className="text-slate-300 opacity-0 group-hover:opacity-100" />
                      </div>
                      <p className="text-[10px] text-slate-500 font-bold truncate mt-0.5">{center.location}</p>
                      <p className="text-[9px] text-blue-500 font-black uppercase tracking-widest mt-1">CAP: {center.capacity}인</p>
                    </div>
                  </div>

                  <div className="flex-1 ml-6 relative h-14 flex items-center">
                    <div className="absolute inset-0 flex">
                      {MONTHS.map((_, mIdx) => (
                        <div 
                          key={mIdx} 
                          onClick={() => handleCellClick(center, mIdx)}
                          className="flex-1 h-full cursor-pointer hover:bg-blue-50/40 transition-colors group/cell rounded-xl relative overflow-hidden"
                        >
                          {center.monthlyStatus[mIdx] === CenterStatus.AVAILABLE && (
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
                              <PlusCircle size={20} className="text-blue-400" />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {blocks.map((block, bIdx) => {
                      const duration = block.end - block.start + 1;
                      const width = (duration / 12) * 100;
                      const left = (block.start / 12) * 100;
                      
                      return (
                        <div
                          key={bIdx}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCellClick(center, block.start, block);
                          }}
                          style={{ 
                            width: `calc(${width}% - 4px)`, 
                            left: `calc(${left}% + 2px)` 
                          }}
                          className={`absolute h-11 rounded-[22px] ${colorSet.bg} flex items-center px-5 shadow-xl shadow-slate-200 cursor-pointer hover:scale-[1.01] hover:brightness-110 transition-all z-10 border-4 border-white group/bar`}
                        >
                          <div className="flex items-center gap-3 w-full overflow-hidden">
                            <div className="w-6 h-6 rounded-full bg-white/30 flex-shrink-0 flex items-center justify-center">
                              <User size={12} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <span className="text-[11px] font-black text-white truncate block uppercase tracking-tight">
                                {block.tenant}
                              </span>
                            </div>
                            {duration >= 2 && (
                              <div className="bg-black/10 px-2.5 py-1 rounded-full text-[9px] font-black text-white whitespace-nowrap border border-white/20">
                                {duration}개월
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 교육장 정보 수정 모달 (메타 데이터) */}
      {metaEdit && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[120] flex items-center justify-center p-6">
          <div className="bg-white rounded-[48px] w-full max-w-md p-12 relative animate-in fade-in zoom-in duration-300 shadow-2xl border border-white">
            <button 
              onClick={() => setMetaEdit(null)}
              className="absolute top-10 right-10 p-4 rounded-full hover:bg-slate-100 transition-colors text-slate-300"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col items-center text-center mb-10">
              <div className="w-20 h-20 rounded-[30px] mb-6 flex items-center justify-center bg-slate-900 shadow-xl text-white">
                <Edit2 size={32} />
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">시설 정보 수정</h2>
              <p className="text-slate-400 font-bold text-xs mt-2 uppercase tracking-[0.2em]">Center Master Configuration</p>
            </div>

            <div className="space-y-6 mb-10">
              {/* Name */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">교육장 명칭</label>
                <input 
                  value={metaEdit.name}
                  onChange={(e) => setMetaEdit({...metaEdit, name: e.target.value})}
                  className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white rounded-[24px] px-8 py-4 text-sm font-bold outline-none transition-all"
                />
              </div>

              {/* Location (Building) */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">건물명 / 상세 위치</label>
                <div className="relative">
                  <MapPin size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    value={metaEdit.location}
                    onChange={(e) => setMetaEdit({...metaEdit, location: e.target.value})}
                    placeholder="예: 강남 드림센터 3층"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white rounded-[24px] px-14 py-4 text-sm font-bold outline-none transition-all"
                  />
                </div>
              </div>

              {/* Capacity */}
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">수용 인원 (명)</label>
                <div className="relative">
                  <UsersIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    type="number"
                    value={metaEdit.capacity}
                    onChange={(e) => setMetaEdit({...metaEdit, capacity: parseInt(e.target.value) || 0})}
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white rounded-[24px] px-14 py-4 text-sm font-bold outline-none transition-all"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={handleSaveMeta}
                className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black text-lg hover:bg-black transition-all shadow-2xl active:scale-95 flex items-center justify-center gap-3"
              >
                <Save size={20} />
                정보 저장하기
              </button>
              <button 
                onClick={() => setMetaEdit(null)}
                className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase text-xs tracking-[0.2em]"
              >
                취소
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 스케줄 관리 통합 모달 */}
      {selectedCell && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-xl z-[110] flex items-center justify-center p-6">
          <div className="bg-white rounded-[48px] w-full max-lg p-12 relative animate-in fade-in zoom-in duration-300 shadow-2xl border border-white">
            <button 
              onClick={() => setSelectedCell(null)}
              className="absolute top-10 right-10 p-4 rounded-full hover:bg-slate-100 transition-colors text-slate-300"
            >
              <X size={24} />
            </button>
            
            <div className="flex flex-col items-center text-center mb-8">
              <div className={`w-20 h-20 rounded-[30px] mb-6 flex items-center justify-center shadow-2xl text-white ${
                selectedCell.status === CenterStatus.OCCUPIED ? 'bg-blue-500 shadow-blue-200' : 'bg-emerald-500 shadow-emerald-200'
              }`}>
                {selectedCell.status === CenterStatus.OCCUPIED ? <Calendar size={40} /> : <PlusCircle size={40} />}
              </div>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">{selectedCell.center.name}</h2>
              <div className="flex items-center gap-2 bg-slate-50 px-4 py-1.5 rounded-full mt-3">
                <span className="text-slate-400 font-black uppercase tracking-widest text-[10px]">
                  {selectedCell.block 
                    ? `2026년 ${MONTHS[selectedCell.block.start]} ~ ${MONTHS[selectedCell.block.end]} 교육 관리` 
                    : `2026년 ${MONTHS[selectedCell.monthIdx]} 교육 신규 등록`
                  }
                </span>
              </div>
            </div>

            <div className="space-y-6 mb-10">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-4">교육 프로그램 / 기관명</label>
                <div className="relative">
                  <User size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" />
                  <input 
                    value={tenantValue}
                    onChange={(e) => setTenantValue(e.target.value)}
                    placeholder="예: 청년 창업 코딩 캠프"
                    className="w-full bg-slate-50 border-2 border-transparent focus:border-blue-400 focus:bg-white rounded-[24px] px-14 py-5 text-sm font-bold outline-none transition-all"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center ml-4 mr-4">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest">교육 기간 (개월)</label>
                  <span className="text-sm font-black text-blue-500">{durationValue}개월</span>
                </div>
                <div className="bg-slate-50 rounded-[24px] p-6 space-y-4">
                  <input 
                    type="range" 
                    min="1" 
                    max={selectedCell.block ? 12 : (12 - selectedCell.monthIdx)}
                    value={durationValue}
                    onChange={(e) => setDurationValue(parseInt(e.target.value))}
                    className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] font-bold text-slate-400 px-1">
                    <span>{MONTHS[selectedCell.block ? selectedCell.block.start : selectedCell.monthIdx]}</span>
                    <ArrowRight size={12} />
                    <span>
                      {MONTHS[Math.min((selectedCell.block ? selectedCell.block.start : selectedCell.monthIdx) + durationValue - 1, 11)]}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <button 
                onClick={handleSaveSchedule}
                disabled={!tenantValue.trim()}
                className="w-full bg-slate-900 text-white py-6 rounded-[28px] font-black text-lg hover:bg-black transition-all shadow-2xl active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3"
              >
                <Save size={20} />
                {selectedCell.status === CenterStatus.OCCUPIED ? '스케줄 업데이트' : '신규 교육 등록'}
              </button>
              
              {selectedCell.status === CenterStatus.OCCUPIED && (
                <button 
                  onClick={handleDelete}
                  className="w-full bg-rose-50 text-rose-500 py-5 rounded-[28px] font-black text-sm hover:bg-rose-100 transition-all flex items-center justify-center gap-3"
                >
                  <Trash2 size={18} />
                  이 스케줄 삭제 (비우기)
                </button>
              )}
              
              <button 
                onClick={() => setSelectedCell(null)}
                className="w-full py-4 text-slate-400 font-bold hover:text-slate-600 transition-colors uppercase text-xs tracking-[0.2em]"
              >
                닫기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineView;
