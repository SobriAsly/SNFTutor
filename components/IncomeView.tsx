
import React, { useState } from 'react';
import { Student, ClassSession, PaymentInfo } from '../types';
import { DollarSign, TrendingUp, Users, Calendar, CheckCircle2, Circle, ChevronDown, ChevronUp, Clock } from 'lucide-react';

interface IncomeViewProps {
  students: Student[];
  classes: ClassSession[];
  payments: PaymentInfo[];
  onTogglePayment: (studentId: string, month: number, year: number, isPaid: boolean, date?: string) => void;
  onUpdatePaymentInfo: (studentId: string, month: number, year: number, data: Partial<PaymentInfo>) => void;
  onUpdateClass: (session: Partial<ClassSession>) => void;
  month: number;
  year: number;
  monthName: string;
}

const IncomeView: React.FC<IncomeViewProps> = ({ 
  students, 
  classes, 
  payments, 
  onTogglePayment, 
  onUpdatePaymentInfo,
  onUpdateClass,
  month, 
  year, 
  monthName 
}) => {
  const [expandedStudentId, setExpandedStudentId] = useState<string | null>(null);

  const calculateStudentIncome = (student: Student) => {
    // Filter classes for this student in the current month
    const studentClasses = classes.filter(c => {
      if ((c.type !== 'SESSION' && c.type !== 'QUICK') || c.studentId !== student.id) return false;
      if (c.originalSessionId) return false; // Don't count the new "moved" session in its new month
      
      const [cYear, cMonth] = c.date.split('-').map(Number);
      return cYear === year && (cMonth - 1) === month;
    }).sort((a, b) => a.date.localeCompare(b.date));

    const payment = payments.find(p => p.studentId === student.id && p.month === month && p.year === year);
    
    // Monthly defaults
    const monthlyHours = payment?.monthlyHours !== undefined ? payment.monthlyHours : (student.defaultHours || 1);
    const monthlyPrice = payment?.monthlyPrice !== undefined ? payment.monthlyPrice : (student.pricePerHour || 35);
    
    const total = studentClasses.reduce((sum, c) => {
      const hours = c.customHours !== undefined ? c.customHours : monthlyHours;
      const price = c.customPrice !== undefined ? c.customPrice : monthlyPrice;
      return sum + (hours * price);
    }, 0);

    const count = studentClasses.length;

    return {
      count,
      hours: monthlyHours,
      price: monthlyPrice,
      total,
      payment,
      studentClasses
    };
  };

  const studentData = students.map(s => ({
    student: s,
    ...calculateStudentIncome(s)
  })).sort((a, b) => b.total - a.total);

  const totalIncome = studentData.reduce((sum, item) => sum + item.total, 0);
  const totalClasses = studentData.reduce((sum, item) => sum + item.count, 0);

  const handlePaymentToggle = (studentId: string, currentPaid: boolean) => {
    const today = new Date().toISOString().split('T')[0];
    onTogglePayment(studentId, month, year, !currentPaid, !currentPaid ? today : undefined);
  };

  const handleDateChange = (studentId: string, date: string) => {
    onTogglePayment(studentId, month, year, true, date);
  };

  return (
    <div className="space-y-4 md:space-y-8 animate-in fade-in duration-500">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-6">
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex items-center gap-3 md:gap-5">
          <div className="bg-emerald-50 p-2.5 md:p-4 rounded-xl md:rounded-2xl">
            <TrendingUp className="w-4 h-4 md:w-6 md:h-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">Total Income</p>
            <h3 className="text-lg md:text-2xl font-black text-slate-900">RM {totalIncome.toLocaleString()}</h3>
          </div>
        </div>
        
        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex items-center gap-3 md:gap-5">
          <div className="bg-indigo-50 p-2.5 md:p-4 rounded-xl md:rounded-2xl">
            <Calendar className="w-4 h-4 md:w-6 md:h-6 text-indigo-600" />
          </div>
          <div>
            <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">Total Classes</p>
            <h3 className="text-lg md:text-2xl font-black text-slate-900">{totalClasses} Sessions</h3>
          </div>
        </div>

        <div className="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 flex items-center gap-3 md:gap-5">
          <div className="bg-amber-50 p-2.5 md:p-4 rounded-xl md:rounded-2xl">
            <Users className="w-4 h-4 md:w-6 md:h-6 text-amber-600" />
          </div>
          <div>
            <p className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-0.5 md:mb-1">Active Students</p>
            <h3 className="text-lg md:text-2xl font-black text-slate-900">{students.length} Students</h3>
          </div>
        </div>
      </div>

      {/* Detailed Table / Mobile Cards */}
      <div className="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-4 md:px-8 py-4 md:py-6 border-b border-gray-50 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h3 className="text-sm md:text-lg font-black text-slate-800 uppercase tracking-tight">Income Breakdown • {monthName} {year}</h3>
          <div className="bg-gray-50 px-3 py-1 rounded-full text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest self-start sm:self-auto">
            Monthly Report
          </div>
        </div>
        
        {/* Mobile View: Card List */}
        <div className="md:hidden divide-y divide-gray-50">
          {studentData.map(({ student, count, hours, price, total, payment, studentClasses }) => (
            <div key={student.id} className="flex flex-col">
              <div 
                className="p-4 flex flex-col gap-3 cursor-pointer hover:bg-gray-50/50 transition-colors"
                onClick={() => setExpandedStudentId(expandedStudentId === student.id ? null : student.id)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${student.color.split(' ')[0]}`} />
                    <span className="font-bold text-slate-700 text-sm">{student.name}</span>
                    {expandedStudentId === student.id ? <ChevronUp className="w-3 h-3 text-gray-400" /> : <ChevronDown className="w-3 h-3 text-gray-400" />}
                  </div>
                  <div className="flex items-center gap-2">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePaymentToggle(student.id, !!payment?.isPaid);
                      }}
                      className={`p-1.5 rounded-lg transition-all ${payment?.isPaid ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}
                    >
                      {payment?.isPaid ? <CheckCircle2 className="w-4 h-4" /> : <Circle className="w-4 h-4" />}
                    </button>
                    <span className="text-sm font-black text-indigo-600">RM {total.toLocaleString()}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Classes</span>
                      <span className="text-[10px] font-bold text-slate-600">{count}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Rate</span>
                      <span className="text-[10px] font-bold text-slate-600">RM {price}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Hours</span>
                      <span className="text-[10px] font-bold text-slate-600">{hours}</span>
                    </div>
                  </div>
                  {payment?.isPaid && (
                    <div className="flex flex-col" onClick={(e) => e.stopPropagation()}>
                      <span className="text-[8px] font-black text-gray-400 uppercase tracking-tighter">Paid Date</span>
                      <input 
                        type="date" 
                        value={payment.paidDate || ''} 
                        onChange={(e) => handleDateChange(student.id, e.target.value)}
                        className="text-[10px] font-bold text-emerald-600 bg-transparent outline-none border-none p-0 h-auto"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded Monthly Adjustments Mobile */}
              {expandedStudentId === student.id && (
                <div className="bg-gray-50/50 p-4 space-y-4 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between">
                    <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Monthly Adjustments</h4>
                    <span className="text-[8px] font-bold text-gray-400 italic">Applies to all {count} classes</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" /> Hours / Class
                      </label>
                      <input 
                        type="number" 
                        step="0.5"
                        placeholder={student.defaultHours?.toString() || "1"}
                        value={payment?.monthlyHours ?? ''}
                        onChange={(e) => onUpdatePaymentInfo(student.id, month, year, { monthlyHours: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full text-xs font-bold text-slate-700 bg-white px-3 py-2 rounded-xl border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[8px] font-black text-gray-400 uppercase tracking-tighter flex items-center gap-1">
                        <DollarSign className="w-2.5 h-2.5" /> Rate / Hour (RM)
                      </label>
                      <input 
                        type="number" 
                        placeholder={student.pricePerHour?.toString() || "35"}
                        value={payment?.monthlyPrice ?? ''}
                        onChange={(e) => onUpdatePaymentInfo(student.id, month, year, { monthlyPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                        className="w-full text-xs font-bold text-slate-700 bg-white px-3 py-2 rounded-xl border border-gray-100 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Individual Session Adjustments</h4>
                      <span className="text-[8px] font-bold text-gray-400 italic">Override specific dates</span>
                    </div>
                    <div className="space-y-3">
                      {studentClasses.map(c => (
                        <div key={c.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-bold text-slate-500">
                              {new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                              {c.rescheduledTo && (
                                <span className="text-indigo-400 ml-1">
                                  → {new Date(c.rescheduledTo).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                </span>
                              )}
                            </span>
                            <span className="text-[10px] font-black text-indigo-600">
                              RM {((c.customHours !== undefined ? c.customHours : hours) * (c.customPrice !== undefined ? c.customPrice : price)).toLocaleString()}
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div className="flex flex-col gap-1">
                              <span className="text-[7px] font-black text-gray-400 uppercase">Hours</span>
                              <input 
                                type="number" 
                                step="0.5"
                                placeholder={hours.toString()}
                                value={c.customHours ?? ''}
                                onChange={(e) => onUpdateClass({ ...c, customHours: e.target.value ? parseFloat(e.target.value) : undefined })}
                                className="text-[10px] font-bold text-slate-700 bg-gray-50 px-2 py-1 rounded border border-gray-100 focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                            </div>
                            <div className="flex flex-col gap-1">
                              <span className="text-[7px] font-black text-gray-400 uppercase">Rate (RM)</span>
                              <input 
                                type="number" 
                                placeholder={price.toString()}
                                value={c.customPrice ?? ''}
                                onChange={(e) => onUpdateClass({ ...c, customPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                                className="text-[10px] font-bold text-slate-700 bg-gray-50 px-2 py-1 rounded border border-gray-100 focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
          {studentData.length === 0 && (
            <div className="p-8 text-center text-gray-400 font-bold italic text-sm">
              No student data available.
            </div>
          )}
          <div className="p-4 bg-gray-50/50 flex justify-between items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Grand Total</span>
            <span className="text-lg font-black text-slate-900">RM {totalIncome.toLocaleString()}</span>
          </div>
        </div>

        {/* Desktop View: Table */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Student</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Classes</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Rate</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Hours</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Total</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">Paid</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Paid Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {studentData.map(({ student, count, hours, price, total, payment, studentClasses }) => (
                <React.Fragment key={student.id}>
                  <tr 
                    className={`hover:bg-gray-50/30 transition-colors cursor-pointer ${expandedStudentId === student.id ? 'bg-gray-50/50' : ''}`}
                    onClick={() => setExpandedStudentId(expandedStudentId === student.id ? null : student.id)}
                  >
                    <td className="px-8 py-5">
                      <div className="flex items-center gap-3">
                        <div className={`w-2.5 h-2.5 rounded-full ${student.color.split(' ')[0]}`} />
                        <span className="font-bold text-slate-700">{student.name}</span>
                        {expandedStudentId === student.id ? <ChevronUp className="w-4 h-4 text-gray-300" /> : <ChevronDown className="w-4 h-4 text-gray-300" />}
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-slate-600">{count}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-slate-600">RM {price}</span>
                    </td>
                    <td className="px-8 py-5">
                      <span className="text-sm font-bold text-slate-600">{hours}</span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <span className="text-base font-black text-indigo-600">RM {total.toLocaleString()}</span>
                    </td>
                    <td className="px-8 py-5 text-center" onClick={(e) => e.stopPropagation()}>
                      <button 
                        onClick={() => handlePaymentToggle(student.id, !!payment?.isPaid)}
                        className={`p-2 rounded-xl transition-all ${payment?.isPaid ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-50 text-gray-300 hover:text-gray-400'}`}
                      >
                        {payment?.isPaid ? <CheckCircle2 className="w-5 h-5" /> : <Circle className="w-5 h-5" />}
                      </button>
                    </td>
                    <td className="px-8 py-5" onClick={(e) => e.stopPropagation()}>
                      {payment?.isPaid ? (
                        <input 
                          type="date" 
                          value={payment.paidDate || ''} 
                          onChange={(e) => handleDateChange(student.id, e.target.value)}
                          className="text-sm font-bold text-emerald-600 bg-emerald-50/50 px-3 py-1.5 rounded-lg outline-none focus:ring-2 focus:ring-emerald-200 transition-all"
                        />
                      ) : (
                        <span className="text-xs text-gray-300 italic font-medium">Pending</span>
                      )}
                    </td>
                  </tr>
                  
                  {/* Expanded Monthly Adjustments Desktop */}
                  {expandedStudentId === student.id && (
                    <tr className="bg-gray-50/30">
                      <td colSpan={7} className="px-8 py-6">
                        <div className="flex flex-col gap-6 animate-in fade-in slide-in-from-top-2 duration-200">
                          <div className="flex items-center justify-between">
                            <div className="space-y-1">
                              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Monthly Adjustments</h4>
                              <p className="text-[10px] font-bold text-gray-400 italic">Set the rate and hours for all {count} classes in {monthName}</p>
                            </div>
                            <div className="flex items-center gap-4">
                              <div className="flex flex-col items-end">
                                <span className="text-[8px] font-black text-gray-400 uppercase">Current Calculation</span>
                                <span className="text-sm font-black text-indigo-600">{count} sessions × {hours}hr × RM{price}</span>
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Clock className="w-3.5 h-3.5" /> Monthly Hours
                              </label>
                              <input 
                                type="number" 
                                step="0.5"
                                placeholder={student.defaultHours?.toString() || "1"}
                                value={payment?.monthlyHours ?? ''}
                                onChange={(e) => onUpdatePaymentInfo(student.id, month, year, { monthlyHours: e.target.value ? parseFloat(e.target.value) : undefined })}
                                className="w-full text-sm font-bold text-slate-700 bg-white px-4 py-3 rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                              />
                            </div>

                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <DollarSign className="w-3.5 h-3.5" /> Monthly Rate (RM)
                              </label>
                              <input 
                                type="number" 
                                placeholder={student.pricePerHour?.toString() || "35"}
                                value={payment?.monthlyPrice ?? ''}
                                onChange={(e) => onUpdatePaymentInfo(student.id, month, year, { monthlyPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                                className="w-full text-sm font-bold text-slate-700 bg-white px-4 py-3 rounded-2xl border border-gray-100 shadow-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                              />
                            </div>

                            <div className="md:col-span-2 space-y-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                                <Calendar className="w-3.5 h-3.5" /> Individual Session Adjustments
                              </label>
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {studentClasses.map(c => (
                                  <div key={c.id} className="bg-white p-3 rounded-xl border border-gray-100 shadow-sm space-y-2">
                                    <div className="flex items-center justify-between border-b border-gray-50 pb-1">
                                      <span className="text-[10px] font-bold text-slate-500">
                                        {new Date(c.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                        {c.rescheduledTo && (
                                          <span className="text-indigo-400 ml-1">
                                            → {new Date(c.rescheduledTo).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                                          </span>
                                        )}
                                      </span>
                                      <span className="text-[10px] font-black text-indigo-600">
                                        RM {((c.customHours !== undefined ? c.customHours : hours) * (c.customPrice !== undefined ? c.customPrice : price)).toLocaleString()}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2">
                                      <div className="space-y-1">
                                        <span className="text-[8px] font-black text-gray-400 uppercase">Hours</span>
                                        <input 
                                          type="number" 
                                          step="0.5"
                                          placeholder={hours.toString()}
                                          value={c.customHours ?? ''}
                                          onChange={(e) => onUpdateClass({ ...c, customHours: e.target.value ? parseFloat(e.target.value) : undefined })}
                                          className="w-full text-[10px] font-bold text-slate-700 bg-gray-50 px-2 py-1 rounded border border-gray-100 focus:ring-1 focus:ring-indigo-500 outline-none"
                                        />
                                      </div>
                                      <div className="space-y-1">
                                        <span className="text-[8px] font-black text-gray-400 uppercase">Rate (RM)</span>
                                        <input 
                                          type="number" 
                                          placeholder={price.toString()}
                                          value={c.customPrice ?? ''}
                                          onChange={(e) => onUpdateClass({ ...c, customPrice: e.target.value ? parseFloat(e.target.value) : undefined })}
                                          className="w-full text-[10px] font-bold text-slate-700 bg-gray-50 px-2 py-1 rounded border border-gray-100 focus:ring-1 focus:ring-indigo-500 outline-none"
                                        />
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
            <tfoot className="bg-gray-50/50">
              <tr>
                <td colSpan={4} className="px-8 py-6 text-right text-[10px] font-black text-gray-400 uppercase tracking-widest">Grand Total</td>
                <td className="px-8 py-6 text-right">
                  <span className="text-2xl font-black text-slate-900">RM {totalIncome.toLocaleString()}</span>
                </td>
                <td colSpan={2}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
};

export default IncomeView;
