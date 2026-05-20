import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { DailyLog } from '../types.js';
import { TrendingUp, BarChart3, Presentation } from 'lucide-react';

interface HealthChartsProps {
  data: DailyLog[];
}

export const HealthCharts: React.FC<HealthChartsProps> = ({ data }) => {
  // If no data exists, show an empty, clean visual state
  if (data.length === 0) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm text-center flex flex-col items-center justify-center min-h-[250px]">
        <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600 mb-3">
          <Presentation className="h-6 w-6" />
        </div>
        <h3 className="font-sans font-bold text-sm text-slate-800 tracking-tight">No Trend Visualizations Available</h3>
        <p className="font-sans text-xs text-slate-500 mt-1 max-w-sm">
          Once you start submitting daily health metrics, interactive trends mapping calories, activities, and sleep patterns will display here.
        </p>
      </div>
    );
  }

  // Format Dates to readable shorthand inside charts e.g. "05/20"
  const chartData = data.map((log) => {
    let displayDate = log.date;
    try {
      const parts = log.date.split('-');
      if (parts.length === 3) {
        displayDate = `${parts[1]}/${parts[2]}`; // MM/DD
      }
    } catch {
      // Fallback to original
    }

    return {
      ...log,
      displayDate,
    };
  });

  return (
    <div className="space-y-4">
      {/* 1. Area Chart for Calories (Cumulative or Full Width) */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
        <div className="flex items-center space-x-2 text-orange-600 mb-3 border-b border-slate-100 pb-2">
          <TrendingUp className="h-4.5 w-4.5 text-orange-600" />
          <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-600">Calories Burned (Energy Intake)</h3>
        </div>
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCalories" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f97316" stopOpacity={0.15}/>
                  <stop offset="95%" stopColor="#f97316" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={10} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#ffffff',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  fontFamily: 'Inter, sans-serif',
                  fontSize: '11px',
                }}
              />
              <Area
                type="monotone"
                dataKey="calories"
                name="Calories"
                stroke="#ea580c"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorCalories)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Grid for Steps & Sleep Trend */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Line Chart for Steps */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 text-indigo-600 mb-3 border-b border-slate-100 pb-2">
            <TrendingUp className="h-4.5 w-4.5 text-indigo-600" />
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-600">Steps Trend (7 Days)</h3>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="steps"
                  name="Steps"
                  stroke="#4f46e5"
                  strokeWidth={2}
                  dot={{ r: 3, stroke: '#4f46e5', strokeWidth: 1, fill: '#ffffff' }}
                  activeDot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bar Chart for Sleep Progress */}
        <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
          <div className="flex items-center space-x-2 text-purple-600 mb-3 border-b border-slate-100 pb-2">
            <BarChart3 className="h-4.5 w-4.5 text-purple-600" />
            <h3 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-600">Sleep Log (Hours)</h3>
          </div>
          <div className="h-44">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="displayDate" stroke="#94a3b8" fontSize={10} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={10} tickLine={false} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #e2e8f0',
                    borderRadius: '8px',
                    fontFamily: 'Inter, sans-serif',
                    fontSize: '11px',
                  }}
                />
                <Bar
                  dataKey="sleepHours"
                  name="Hours"
                  fill="#8b5cf6"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
