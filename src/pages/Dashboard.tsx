import React, { useState, useEffect } from 'react';
import { PageLayout } from '../components/PageLayout.js';
import { SummaryCards } from '../components/SummaryCards.js';
import { DailyLogForm } from '../components/DailyLogForm.js';
import { HealthCharts } from '../charts/HealthCharts.js';
import { ReminderSettings } from '../components/ReminderSettings.js';
import { useAuth } from '../context/AuthContext.js';
import { DailyLog, SummaryStats } from '../types.js';
import api from '../services/api.js';
import { Activity, ClipboardList, RefreshCw, CalendarDays, X } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<SummaryStats>({
    totalCalories: 0,
    totalWater: 0,
    totalSteps: 0,
    averageSleep: 0,
  });
  const [history, setHistory] = useState<DailyLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorHeader, setErrorHeader] = useState<string | null>(null);
  const [showInAppReminderBanner, setShowInAppReminderBanner] = useState(false);

  // Check if today has been recorded
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayString();
  const isTodayLogged = history.some((log) => log.date === todayStr);

  useEffect(() => {
    if (user) {
      const storageSuffix = user ? `_${user.email}` : '';
      const storageKeyInApp = `reminder_in_app${storageSuffix}`;
      const savedInAppStr = localStorage.getItem(storageKeyInApp);
      const isBannerEnabled = savedInAppStr !== null ? JSON.parse(savedInAppStr) : true;
      
      const sessionDismissKey = `dismissed_reminder_banner_${todayStr}${storageSuffix}`;
      const isDismissedForToday = localStorage.getItem(sessionDismissKey) === 'true';

      setShowInAppReminderBanner(isBannerEnabled && !isTodayLogged && !isDismissedForToday);
    } else {
      setShowInAppReminderBanner(false);
    }
  }, [user, isTodayLogged, history, todayStr]);

  const fetchDashboardData = async () => {
    try {
      setErrorHeader(null);
      // Fetch summary and logs list concurrently
      const [summaryResponse, historyResponse] = await Promise.all([
        api.get('/summary'),
        api.get('/history'),
      ]);

      setStats(summaryResponse.data);
      setHistory(historyResponse.data);
    } catch (err: any) {
      setErrorHeader(err.message || 'Failed to pull health logs from the cloud database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleSaveLogs = async (data: {
    date: string;
    calories: number;
    water: number;
    steps: number;
    sleepHours: number;
  }) => {
    try {
      // POST the log to secure API endpoint
      await api.post('/log', data);
      // Retrieve updated tracking records cleanly to sync GUI instantly
      await fetchDashboardData();
    } catch (err: any) {
      throw new Error(err.message || 'Fail to log stats. Try again.');
    }
  };

  return (
    <PageLayout>
      {/* Upper header section */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <h1 className="font-sans font-bold text-xl md:text-2xl text-slate-800 tracking-tight flex items-center space-x-2">
            <Activity className="h-6 w-6 text-indigo-600 inline mr-1.5 shrink-0 animate-pulse" />
            <span>HealthSync Dashboard</span>
          </h1>
          <p className="font-sans text-xs text-slate-500">
            Monitor and record physical training, sleep, hydration, and energy levels.
          </p>
        </div>
        
        {/* Quick Sync Button */}
        <button
          id="dashboard-sync-btn"
          onClick={fetchDashboardData}
          disabled={loading}
          className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg font-sans font-semibold text-xs text-slate-700 hover:text-slate-900 hover:bg-slate-50 hover:shadow-sm transition-colors cursor-pointer focus:outline-none"
        >
          <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Sync Instance</span>
        </button>
      </div>

      {errorHeader && (
        <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-700 text-xs font-semibold font-sans">
          {errorHeader}
        </div>
      )}

      {/* IN-APP DAILY REMINDER BANNER */}
      {showInAppReminderBanner && (
        <div className="flex items-center justify-between gap-3 bg-indigo-50/80 border border-indigo-100 p-3 rounded-lg">
          <div className="flex items-center space-x-2.5">
            <span className="flex-shrink-0 flex items-center justify-center w-6 h-6 bg-indigo-100 rounded-full text-indigo-700 font-bold text-xs">
              ⏰
            </span>
            <div>
              <p className="font-sans text-xs font-bold text-slate-800 leading-normal">
                Forgot to track today?
              </p>
              <p className="font-sans text-[10px] text-slate-500">
                You haven't recorded your daily metrics for today yet. Fill in your stats below to keep your streaks and health trends perfectly mapped out!
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              const storageSuffix = user ? `_${user.email}` : '';
              const sessionDismissKey = `dismissed_reminder_banner_${todayStr}${storageSuffix}`;
              localStorage.setItem(sessionDismissKey, 'true');
              setShowInAppReminderBanner(false);
            }}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg scale-90 hover:bg-slate-100 transition-all focus:outline-none cursor-pointer"
            title="Dismiss today's warning banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* TOP SUMMARY KPI DECK */}
      <SummaryCards stats={stats} loading={loading} />

      {/* MID SECTION: FORM & CHARTS SIDE BY SIDE */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 items-start">
        {/* Left Side: Records Form & Reminder Settings */}
        <div className="xl:col-span-4 space-y-4">
          <DailyLogForm onSave={handleSaveLogs} />
          <ReminderSettings history={history} />
        </div>

        {/* Right Side: Recharts graphics line, bar, area */}
        <div className="xl:col-span-8">
          <HealthCharts data={history} />
        </div>
      </div>

      {/* FULL ALIGNED BOTTOM: HISTORY LOGS TABLE */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
        <div className="flex items-center space-x-2 mb-4 border-b border-slate-100 pb-3">
          <ClipboardList className="h-4.5 w-4.5 text-indigo-600" />
          <h2 className="font-sans font-bold text-sm text-slate-800 uppercase tracking-wider">Recent History</h2>
        </div>

        {loading ? (
          <div className="py-8 text-center text-slate-400 font-sans text-xs">Loading records...</div>
        ) : history.length === 0 ? (
          <div className="py-8 text-center text-slate-400 font-sans text-xs flex flex-col items-center justify-center">
            <CalendarDays className="h-6 w-6 text-slate-300 mb-1.5" />
            <span>No health entries saved yet. Log metrics above to populate history!</span>
          </div>
        ) : (
          <div className="overflow-x-auto -mx-5">
            <div className="inline-block min-w-full align-middle px-5">
              <table className="min-w-full divide-y divide-slate-100 border-b border-slate-200 text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-100 text-slate-400 font-semibold">
                    <th scope="col" className="py-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      DATE
                    </th>
                    <th scope="col" className="py-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      CALORIES
                    </th>
                    <th scope="col" className="py-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      WATER
                    </th>
                    <th scope="col" className="py-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      STEPS
                    </th>
                    <th scope="col" className="py-2 px-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                      SLEEP
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 bg-white text-slate-600">
                  {/* Show latest 7 elements in descending chronological order inside dashboard table */}
                  {[...history]
                    .reverse()
                    .slice(0, 7)
                    .map((log) => (
                      <tr key={log._id || log.date} className="hover:bg-slate-50 transition-all font-sans text-xs">
                        <td className="py-2.5 px-3 font-medium text-slate-800 whitespace-nowrap">
                          {log.date}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-orange-50 text-orange-600 font-bold rounded-md border border-orange-100">
                            {log.calories.toLocaleString()} kcal
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-cyan-50 text-cyan-600 font-bold rounded-md border border-cyan-100">
                            {log.water} L
                          </span>
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap font-mono text-slate-500 font-bold">
                          {log.steps.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 whitespace-nowrap">
                          <span className="px-2 py-0.5 bg-purple-50 text-purple-600 font-bold rounded-md border border-purple-100">
                            {log.sleepHours} hrs
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
