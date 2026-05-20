import React from 'react';
import { Flame, Droplet, Footprints, Moon } from 'lucide-react';
import { SummaryStats } from '../types.js';

interface SummaryCardsProps {
  stats: SummaryStats;
  loading?: boolean;
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({ stats, loading = false }) => {
  const cards = [
    {
      id: "stat-calories",
      title: 'Total Calories',
      value: loading ? '...' : `${stats.totalCalories.toLocaleString()} kcal`,
      description: 'Cumulative energy intake',
      textClass: 'text-orange-600',
      badgeClass: 'text-orange-600 bg-orange-50 border-orange-100',
      icon: Flame,
    },
    {
      id: "stat-water",
      title: 'Total Water Intake',
      value: loading ? '...' : `${stats.totalWater} Liters`,
      description: 'Cumulative fluid consumed',
      textClass: 'text-cyan-600',
      badgeClass: 'text-cyan-600 bg-cyan-50 border-cyan-100',
      icon: Droplet,
    },
    {
      id: "stat-steps",
      title: 'Total Steps',
      value: loading ? '...' : `${stats.totalSteps.toLocaleString()} steps`,
      description: 'Cumulative physical steps',
      textClass: 'text-indigo-600',
      badgeClass: 'text-indigo-600 bg-indigo-50 border-indigo-100',
      icon: Footprints,
    },
    {
      id: "stat-sleep",
      title: 'Average Sleep',
      value: loading ? '...' : `${stats.averageSleep} hours`,
      description: 'Daily duration average',
      textClass: 'text-purple-600',
      badgeClass: 'text-purple-600 bg-purple-50 border-purple-100',
      icon: Moon,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <div
            id={card.id}
            key={card.title}
            className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex items-center justify-between hover:shadow-md hover:border-slate-300 transition-all"
          >
            <div className="space-y-1">
              <span className="font-sans text-[10px] font-bold text-slate-400 tracking-wider uppercase block">
                {card.title}
              </span>
              <h3 className={`font-sans font-bold text-2xl tracking-tight ${card.textClass}`}>
                {card.value}
              </h3>
              <p className="font-sans text-[11px] text-slate-500">{card.description}</p>
            </div>
            <div className={`p-2.5 rounded-lg border ${card.badgeClass}`}>
              <Icon className="h-5 w-5" />
            </div>
          </div>
        );
      })}
    </div>
  );
};
