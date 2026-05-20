import React, { useState, useEffect } from 'react';
import { CalendarRange, Flame, Droplet, Footprints, Moon, CheckCircle2 } from 'lucide-react';

interface DailyLogFormProps {
  onSave: (data: {
    date: string;
    calories: number;
    water: number;
    steps: number;
    sleepHours: number;
  }) => Promise<void>;
  initialDate?: string;
}

export const DailyLogForm: React.FC<DailyLogFormProps> = ({ onSave, initialDate }) => {
  // Get today's local date string in YYYY-MM-DD
  const getTodayString = () => {
    const today = new Date();
    const offset = today.getTimezoneOffset();
    const localToday = new Date(today.getTime() - (offset * 60 * 1000));
    return localToday.toISOString().split('T')[0];
  };

  const [date, setDate] = useState(initialDate || getTodayString());
  const [calories, setCalories] = useState<string>('');
  const [water, setWater] = useState<string>('');
  const [steps, setSteps] = useState<string>('');
  const [sleepHours, setSleepHours] = useState<string>('');

  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Clear success notification after 3.5 seconds
  useEffect(() => {
    if (successMsg) {
      const timer = setTimeout(() => {
        setSuccessMsg(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [successMsg]);

  const validate = () => {
    const errors: { [key: string]: string } = {};

    if (!date) {
      errors.date = 'Please select a valid log date.';
    }

    const calNum = Number(calories);
    if (!calories.trim()) {
      errors.calories = 'Calories is a required field.';
    } else if (isNaN(calNum) || calNum < 0) {
      errors.calories = 'Calories must be a value of 0 or greater.';
    }

    const waterNum = Number(water);
    if (!water.trim()) {
      errors.water = 'Water intake is a required field.';
    } else if (isNaN(waterNum) || waterNum < 0) {
      errors.water = 'Water intake cannot be less than 0 litres.';
    }

    const stepsNum = Number(steps);
    if (!steps.trim()) {
      errors.steps = 'Steps taken is a required field.';
    } else if (isNaN(stepsNum) || stepsNum < 0) {
      errors.steps = 'Steps cannot be a negative value.';
    }

    const sleepNum = Number(sleepHours);
    if (!sleepHours.trim()) {
      errors.sleepHours = 'Sleep hours is a required field.';
    } else if (isNaN(sleepNum) || sleepNum < 0 || sleepNum > 24) {
      errors.sleepHours = 'Sleep must be between 0 and 24 hours.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg(null);

    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSave({
        date,
        calories: Number(calories),
        water: Number(water),
        steps: Number(steps),
        sleepHours: Number(sleepHours),
      });

      setSuccessMsg(`Daily log for ${date} saved and updated successfully.`);
      
      // Clear inputs
      setCalories('');
      setWater('');
      setSteps('');
      setSleepHours('');
      setFormErrors({});
    } catch (err: any) {
      setFormErrors({ form: err.message || 'An error occurred when trying to save stats.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex items-center space-x-2.5 mb-4 border-b border-slate-100 pb-3">
        <CalendarRange className="h-5 w-5 text-indigo-600" />
        <h2 className="font-sans font-bold text-sm text-slate-800 uppercase tracking-wider">Add Daily Entry</h2>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Base Form-Level API Error */}
        {formErrors.form && (
          <div className="p-3 bg-red-50 border border-red-100 text-red-700 rounded-lg text-xs font-sans font-semibold">
            {formErrors.form}
          </div>
        )}

        {/* Success Alert Banner */}
        {successMsg && (
          <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-lg text-xs font-sans font-semibold flex items-center space-x-2.5 animate-fade-in">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-indigo-600" />
            <span>{successMsg}</span>
          </div>
        )}

        {/* Log Date Field */}
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Log Date
          </label>
          <input
            id="log-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            disabled={isSubmitting}
            className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-slate-100 disabled:text-slate-400"
          />
          {formErrors.date && (
            <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.date}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Calories Field */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Flame className="h-3.5 w-3.5 text-orange-500 inline mr-1" />
              <span>Calories (kcal)</span>
            </label>
            <input
              id="log-calories"
              type="number"
              placeholder="2400"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-slate-100 disabled:text-slate-400"
            />
            {formErrors.calories && (
              <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.calories}</p>
            )}
          </div>

          {/* Water Intake Field */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Droplet className="h-3.5 w-3.5 text-cyan-500 inline mr-1" />
              <span>Water (L)</span>
            </label>
            <input
              id="log-water"
              type="number"
              step="any"
              placeholder="2.5"
              value={water}
              onChange={(e) => setWater(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-slate-100 disabled:text-slate-400"
            />
            {formErrors.water && (
              <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.water}</p>
            )}
          </div>

          {/* Steps Field */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Footprints className="h-3.5 w-3.5 text-indigo-500 inline mr-1" />
              <span>Steps</span>
            </label>
            <input
              id="log-steps"
              type="number"
              placeholder="8000"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-slate-100 disabled:text-slate-400"
            />
            {formErrors.steps && (
              <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.steps}</p>
            )}
          </div>

          {/* Sleep Hours Field */}
          <div>
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5 flex items-center space-x-1">
              <Moon className="h-3.5 w-3.5 text-purple-500 inline mr-1" />
              <span>Sleep (Hrs)</span>
            </label>
            <input
              id="log-sleep"
              type="number"
              step="any"
              placeholder="8.0"
              value={sleepHours}
              onChange={(e) => setSleepHours(e.target.value)}
              disabled={isSubmitting}
              className="w-full px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-all disabled:bg-slate-100 disabled:text-slate-400"
            />
            {formErrors.sleepHours && (
              <p className="text-red-500 text-xs mt-1 font-medium">{formErrors.sleepHours}</p>
            )}
          </div>
        </div>

        <button
          id="log-submit-btn"
          type="submit"
          disabled={isSubmitting}
          className="w-full py-2 bg-indigo-600 text-white font-bold rounded-lg hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-100 text-sm mt-2 focus:outline-none cursor-pointer disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Saving Daily Log...' : 'Save Daily Log'}
        </button>
      </form>
    </div>
  );
};
