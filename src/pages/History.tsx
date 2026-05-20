import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/PageLayout.js';
import { SummaryCards } from '../components/SummaryCards.js';
import { DailyLog, SummaryStats } from '../types.js';
import api from '../services/api.js';
import { ClipboardList, Filter, RefreshCw, CalendarRange, ArrowLeftRight } from 'lucide-react';

export const History: React.FC = () => {
  const [stats, setStats] = useState<SummaryStats>({
    totalCalories: 0,
    totalWater: 0,
    totalSteps: 0,
    averageSleep: 0,
  });
  const [history, setHistory] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Search/Filters states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const fetchHistoryData = async () => {
    try {
      setLoading(true);
      setErrorMsg(null);
      const [summaryResponse, historyResponse] = await Promise.all([
        api.get('/summary'),
        api.get('/history'),
      ]);

      setStats(summaryResponse.data);
      setHistory(historyResponse.data);
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to load complete historical logs.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryData();
  }, []);

  // Filter & sort logic applied locally
  const getFilteredLogs = () => {
    let list = [...history];

    if (startDate) {
      list = list.filter((log) => log.date >= startDate);
    }
    if (endDate) {
      list = list.filter((log) => log.date <= endDate);
    }

    // Sort order
    list.sort((a, b) => {
      const comparison = a.date.localeCompare(b.date);
      return sortOrder === 'desc' ? -comparison : comparison;
    });

    return list;
  };

  const filteredLogs = getFilteredLogs();

  return (
    <PageLayout>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h1 className="font-sans font-bold text-xl md:text-2xl text-slate-800 tracking-tight flex items-center space-x-2">
            <ClipboardList className="h-6 w-6 text-indigo-600 inline mr-1.5 shrink-0" />
            <span>Complete Historical Archive</span>
          </h1>
          <p className="font-sans text-xs text-slate-500">
            Audit, filter, and sort every daily tracking record submitted.
          </p>
        </div>

        <button
          id="history-reload"
          onClick={fetchHistoryData}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-sans font-semibold text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:shadow-sm transition-colors cursor-pointer focus:outline-none"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Archive</span>
        </button>
      </div>

      {errorMsg && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs font-semibold font-sans">
          {errorMsg}
        </div>
      )}

      {/* Stats Cards Section */}
      <SummaryCards stats={stats} loading={loading} />

      {/* FILTER & SORT CONTROLS BAR */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
        <div className="md:col-span-3 flex items-center space-x-2 text-slate-700">
          <Filter className="h-4 w-4 text-indigo-600" />
          <span className="font-sans text-xs font-bold uppercase tracking-wider text-slate-500">Filter & Sort Engine</span>
        </div>

        <div className="md:col-span-9 grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Start Date */}
          <div>
            <div className="relative">
              <input
                id="filter-start-date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                placeholder="Start Date"
                className="w-full pl-3 pr-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
              />
              {!startDate && (
                <span className="absolute left-3 top-2 pointer-events-none text-xs text-slate-400 font-sans hidden sm:block">
                  From Date
                </span>
              )}
            </div>
          </div>

          {/* End Date */}
          <div>
            <div className="relative">
              <input
                id="filter-end-date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                placeholder="End Date"
                className="w-full pl-3 pr-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs text-slate-700 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-sans"
              />
              {!endDate && (
                <span className="absolute left-3 top-2 pointer-events-none text-xs text-slate-400 font-sans hidden sm:block">
                  To Date
                </span>
              )}
            </div>
          </div>

          {/* Sort Order dropdown */}
          <div>
            <button
              id="history-sort-toggle"
              onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
              className="w-full flex items-center justify-between px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg font-sans text-xs text-slate-600 hover:bg-slate-100/50 hover:text-slate-900 transition-colors focus:outline-none"
            >
              <span className="flex items-center space-x-1.5 font-medium">
                <ArrowLeftRight className="h-3.5 w-3.5" />
                <span>Date Sorting</span>
              </span>
              <span className="font-bold text-indigo-600 uppercase">
                {sortOrder === 'desc' ? 'Newest' : 'Oldest'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* FULL ARCHIVAL RECORDS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        {loading ? (
          <div className="py-12 text-center text-slate-400 font-sans text-xs">Accessing record indexes...</div>
        ) : filteredLogs.length === 0 ? (
          <div className="py-10 text-center text-slate-400 font-sans text-xs flex flex-col items-center justify-center space-y-1.5">
            <CalendarRange className="h-8 w-8 text-slate-300" />
            <span className="font-bold text-slate-700 text-sm">No Matching Log Archive Found</span>
            <span className="font-sans text-xs text-slate-400 max-w-sm">
              We couldn't locate active files for the chosen date configuration. Reset dates filters to inspect all log rows.
            </span>
            {(startDate || endDate) && (
              <button
                onClick={() => {
                  setStartDate('');
                  setEndDate('');
                }}
                className="mt-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 pointer focus:outline-none"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <div className="inline-block min-w-full align-middle px-5">
              <table className="min-w-full divide-y divide-slate-100 border-b border-slate-200 text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th scope="col" className="py-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Calendar Date
                    </th>
                    <th scope="col" className="py-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Energy / Calories
                    </th>
                    <th scope="col" className="py-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Fluid / Water
                    </th>
                    <th scope="col" className="py-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Action Steps
                    </th>
                    <th scope="col" className="py-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      Sleep Duration
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white text-slate-600">
                  {filteredLogs.map((log) => (
                    <tr key={log._id || log.date} className="hover:bg-slate-50 transition-all font-sans text-xs">
                      <td className="py-2.5 px-3 font-bold text-slate-800 whitespace-nowrap">
                        {log.date}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-orange-50 text-orange-600 font-bold rounded-md border border-orange-100">
                          {log.calories.toLocaleString()} kcal
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-cyan-50 text-cyan-600 font-bold rounded-md border border-cyan-100">
                          {log.water} Liters
                        </span>
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap font-mono font-bold text-slate-500">
                        {log.steps.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-3 whitespace-nowrap">
                        <span className="px-2 py-0.5 bg-purple-50 text-purple-600 font-bold rounded-md border border-purple-100">
                          {log.sleepHours} Hours
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </PageLayout>
  );
};
