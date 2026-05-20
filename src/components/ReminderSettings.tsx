import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { DailyLog } from '../types.js';
import { 
  Bell, 
  BellOff, 
  Mail, 
  CheckCircle2, 
  AlertCircle, 
  Play, 
  Sparkles, 
  X, 
  Clock, 
  Monitor, 
  Smartphone,
  Eye,
  Check,
  Zap
} from 'lucide-react';

interface ReminderSettingsProps {
  history: DailyLog[];
}

export const ReminderSettings: React.FC<ReminderSettingsProps> = ({ history }) => {
  const { user } = useAuth();
  
  // LocalStorage keys scoped to currentUser
  const storageSuffix = user ? `_${user.email}` : '';
  const storageKeyInApp = `reminder_in_app${storageSuffix}`;
  const storageKeyBrowser = `reminder_browser${storageSuffix}`;
  const storageKeyEmail = `reminder_email${storageSuffix}`;
  const storageKeyTime = `reminder_time${storageSuffix}`;
  const storageKeyLogs = `reminder_logs${storageSuffix}`;

  // Loaded states
  const [inAppEnabled, setInAppEnabled] = useState(true);
  const [browserEnabled, setBrowserEnabled] = useState(false);
  const [emailEnabled, setEmailEnabled] = useState(false);
  const [reminderTime, setReminderTime] = useState('20:00');
  const [dispatchLogs, setDispatchLogs] = useState<Array<{ id: string; time: string; type: string; message: string }>>([]);
  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  // Read preferences on initial mount
  useEffect(() => {
    if (user) {
      const savedInApp = localStorage.getItem(storageKeyInApp);
      const savedBrowser = localStorage.getItem(storageKeyBrowser);
      const savedEmail = localStorage.getItem(storageKeyEmail);
      const savedTime = localStorage.getItem(storageKeyTime);
      const savedLogs = localStorage.getItem(storageKeyLogs);

      if (savedInApp !== null) setInAppEnabled(JSON.parse(savedInApp));
      if (savedBrowser !== null) setBrowserEnabled(JSON.parse(savedBrowser));
      if (savedEmail !== null) setEmailEnabled(JSON.parse(savedEmail));
      if (savedTime !== null) setReminderTime(savedTime);
      if (savedLogs !== null) {
        try {
          setDispatchLogs(JSON.parse(savedLogs));
        } catch {
          setDispatchLogs([]);
        }
      }
    }
  }, [user, storageSuffix]);

  // Save setters
  const updatePreference = (type: 'inApp' | 'browser' | 'email' | 'time', value: any) => {
    if (!user) return;
    
    if (type === 'inApp') {
      setInAppEnabled(value);
      localStorage.setItem(storageKeyInApp, JSON.stringify(value));
      showStatus(value ? 'In-App banner reminders activated.' : 'In-App banner reminders turned off.', 'success');
    } else if (type === 'browser') {
      if (value) {
        // Request HTML5 notification permission if turned on
        if ('Notification' in window) {
          Notification.requestPermission().then((perm) => {
            if (perm !== 'granted') {
              setBrowserEnabled(false);
              localStorage.setItem(storageKeyBrowser, JSON.stringify(false));
              showStatus('Browser Notification permission denied by host environment.', 'error');
            } else {
              setBrowserEnabled(true);
              localStorage.setItem(storageKeyBrowser, JSON.stringify(true));
              showStatus('Notification alerts enabled successfully!', 'success');
            }
          });
        } else {
          setBrowserEnabled(false);
          localStorage.setItem(storageKeyBrowser, JSON.stringify(false));
          showStatus('Notifications are not supported by this browser.', 'error');
        }
      } else {
        setBrowserEnabled(false);
        localStorage.setItem(storageKeyBrowser, JSON.stringify(false));
        showStatus('Browser Push alerts turned off.', 'success');
      }
    } else if (type === 'email') {
      setEmailEnabled(value);
      localStorage.setItem(storageKeyEmail, JSON.stringify(value));
      if (value) {
        showStatus(`Email reminders subscribed for ${user.email}!`, 'success');
      } else {
        showStatus('Email reminder subscriptions disabled.', 'success');
      }
    } else if (type === 'time') {
      setReminderTime(value);
      localStorage.setItem(storageKeyTime, value);
      showStatus(`Reminders rescheduled for daily ${value}`, 'success');
    }
  };

  const showStatus = (msg: string, type: 'success' | 'error') => {
    setStatusMessage({ text: msg, type });
    const timeout = setTimeout(() => {
      setStatusMessage(null);
    }, 3500);
    return () => clearTimeout(timeout);
  };

  // Check if today is completed
  const getTodayString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  const todayStr = getTodayString();
  const isTodayLogged = history.some((log) => log.date === todayStr);

  // Manual Trigger Simulation
  const handleTriggerSimulation = () => {
    if (!user) return;
    
    const now = new Date();
    const timestamp = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    const newLogsList = [...dispatchLogs];

    // 1. Browser HTML5 trigger
    if (browserEnabled && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification('HealthSync Reminder 👋', {
          body: `Hi ${user.name}, don't forget to track your stats today to maintain your healthy patterns!`,
          tag: 'health-sync-reminder'
        });
        newLogsList.unshift({
          id: Math.random().toString(36).substring(2, 6),
          time: timestamp,
          type: 'push',
          message: 'Notification successfully sent to your system browser.'
        });
      } catch (e) {
        console.error('HTML5 Notification failed', e);
      }
    }

    // 2. Email trigger
    if (emailEnabled) {
      newLogsList.unshift({
        id: Math.random().toString(36).substring(2, 6),
        time: timestamp,
        type: 'email',
        message: `Dispatched an automated daily log reminder to ${user.email}`
      });
    }

    // 3. Keep in-app notification visual alert if banner is on
    if (inAppEnabled) {
      newLogsList.unshift({
        id: Math.random().toString(36).substring(2, 6),
        time: timestamp,
        type: 'in-app',
        message: 'In-app notification banner triggered actively on Dashboard.'
      });
    }

    // fallback log if absolutely nothing enabled
    if (!browserEnabled && !emailEnabled && !inAppEnabled) {
      newLogsList.unshift({
        id: Math.random().toString(36).substring(2, 6),
        time: timestamp,
        type: 'status',
        message: 'Simulation run: All notification systems currently muted.'
      });
    }

    // Trim to 3 logs max for spacing cleanliness
    const finalLogs = newLogsList.slice(0, 3);
    setDispatchLogs(finalLogs);
    localStorage.setItem(storageKeyLogs, JSON.stringify(finalLogs));
    showStatus('Dispatched reminder triggers simulation.', 'success');
  };

  const clearDispatchLogs = () => {
    setDispatchLogs([]);
    localStorage.removeItem(storageKeyLogs);
  };

  // Helper mapping component to render toggle switches elegantly
  const customToggle = (enabled: boolean, onChange: (val: boolean) => void) => (
    <button
      type="button"
      onClick={() => onChange(!enabled)}
      className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
        enabled ? 'bg-indigo-600' : 'bg-slate-200'
      }`}
    >
      <span
        className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-200 ease-in-out ${
          enabled ? 'translate-x-4' : 'translate-x-0'
        }`}
      />
    </button>
  );

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-4">
      {/* Header section with refined typography and micro-badges */}
      <div className="flex items-center justify-between border-b border-slate-100 pb-3">
        <div className="flex items-center space-x-2">
          <Bell className="h-4.5 w-4.5 text-indigo-600 animate-pulse" />
          <h2 className="font-sans font-bold text-xs uppercase tracking-wider text-slate-800">Reminder Settings</h2>
        </div>
        <span className="font-mono text-[9px] uppercase tracking-wider bg-slate-50 border border-slate-200 text-slate-500 rounded px-1.5 py-0.5">
          Local engine
        </span>
      </div>

      {/* Refined Health Report Completion Indicator */}
      <div className={`p-3 rounded-lg border flex items-center justify-between text-xs transition-colors duration-300 ${
        isTodayLogged 
          ? 'bg-emerald-50/70 border-emerald-100 text-emerald-800' 
          : 'bg-amber-50/70 border-amber-100 text-amber-800'
      }`}>
        <div className="flex items-center space-x-2.5">
          {isTodayLogged ? (
            <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center text-white shrink-0">
              <Check className="h-3 w-3 text-white" />
            </div>
          ) : (
            <div className="w-5 h-5 bg-amber-500 rounded-full flex items-center justify-center text-white shrink-0 animate-bounce">
              <span className="text-[11px] font-bold">!</span>
            </div>
          )}
          <div className="flex flex-col">
            <span className="font-sans font-bold">
              {isTodayLogged ? "Today's metrics are safe!" : "Today's metrics are missing"}
            </span>
            <span className="font-sans text-[10px] text-slate-500/90">
              {isTodayLogged ? 'Splendid work tracking your parameters.' : 'Log now to preserve your streaks.'}
            </span>
          </div>
        </div>
        
        {/* Status pill inside banner */}
        <span className={`font-mono text-[8.5px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full ${
          isTodayLogged 
            ? 'bg-emerald-200/50 text-emerald-800' 
            : 'bg-amber-200/50 text-amber-800'
        }`}>
          {isTodayLogged ? 'Complete' : 'Pending'}
        </span>
      </div>

      {/* Elegant, temporary alert banner */}
      {statusMessage && (
        <div className={`p-2 rounded-lg text-[10.5px] font-sans font-medium flex items-center space-x-2 border animate-fade-in ${
          statusMessage.type === 'success' 
            ? 'bg-indigo-50 border-indigo-100 text-indigo-700' 
            : 'bg-red-50 border-red-100 text-red-700'
        }`}>
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600 shrink-0" />
          ) : (
            <AlertCircle className="h-3.5 w-3.5 text-red-600 shrink-0" />
          )}
          <span className="flex-1 text-slate-700 font-medium">{statusMessage.text}</span>
        </div>
      )}

      {/* Row stack for opt-ins */}
      <div className="space-y-2.5">
        <span className="text-[9.5px] font-bold text-slate-400 tracking-wider uppercase block">
          Channels & Triggers
        </span>

        {/* 1. In-App Banner Setting */}
        <div className="flex items-center justify-between p-2.5 border border-slate-100 rounded-lg hover:border-slate-200 hover:bg-slate-50/50 transition-all">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-md ${inAppEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
              <Sparkles className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700">In-App Banner Alert</span>
                <span className={`text-[8px] font-mono font-bold px-1 rounded-sm uppercase tracking-wider ${
                  inAppEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {inAppEnabled ? 'ACTIVE' : 'MUTED'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Dashboard status reminders</span>
            </div>
          </div>
          {customToggle(inAppEnabled, (val) => updatePreference('inApp', val))}
        </div>

        {/* 2. Browser Push Alert */}
        <div className="flex items-center justify-between p-2.5 border border-slate-100 rounded-lg hover:border-slate-200 hover:bg-slate-50/50 transition-all">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-md ${browserEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
              <Monitor className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700">Desktop Push Notifications</span>
                <span className={`text-[8px] font-mono font-bold px-1 rounded-sm uppercase tracking-wider ${
                  browserEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {browserEnabled ? 'ACTIVE' : 'MUTED'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">HTML5 system-level ping popup</span>
            </div>
          </div>
          {customToggle(browserEnabled, (val) => updatePreference('browser', val))}
        </div>

        {/* 3. Simulated Email Alert */}
        <div className="flex items-center justify-between p-2.5 border border-slate-100 rounded-lg hover:border-slate-200 hover:bg-slate-50/50 transition-all">
          <div className="flex items-center space-x-2.5">
            <div className={`p-2 rounded-md ${emailEnabled ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}>
              <Mail className="h-4 w-4" />
            </div>
            <div className="flex flex-col">
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold text-slate-700">Simulated Email Reminders</span>
                <span className={`text-[8px] font-mono font-bold px-1 rounded-sm uppercase tracking-wider ${
                  emailEnabled ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'
                }`}>
                  {emailEnabled ? 'ACTIVE' : 'MUTED'}
                </span>
              </div>
              <span className="text-[10px] text-slate-500">Mock metrics alerts to your email</span>
            </div>
          </div>
          {customToggle(emailEnabled, (val) => updatePreference('email', val))}
        </div>
      </div>

      {/* Reminder Scheduler Controls */}
      <div className="pt-3 border-t border-slate-100 space-y-2">
        <label className="block text-[9.5px] font-bold text-slate-400 tracking-wider uppercase">
          Daily Trigger Configuration
        </label>
        
        <div className="flex items-center gap-2">
          {/* Hour Select Wrapper */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
              <Clock className="h-3.5 w-3.5 text-indigo-500" />
            </div>
            <select
              value={reminderTime}
              onChange={(e) => updatePreference('time', e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 hover:border-slate-300 rounded-lg py-1.5 pl-8 pr-2.5 text-xs text-slate-700 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 font-sans cursor-pointer font-semibold transition-all"
            >
              <option value="17:00">5:00 PM </option>
              <option value="18:00">6:00 PM</option>
              <option value="19:00">7:00 PM (Sunset)</option>
              <option value="20:00">8:00 PM (Default)</option>
              <option value="21:00">9:00 PM</option>
              <option value="22:00">10:00 PM</option>
            </select>
          </div>
          
          {/* Immediate Simulation Trigger */}
          <button
            onClick={handleTriggerSimulation}
            className="inline-flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-1.5 px-3 text-xs rounded-lg transition-colors cursor-pointer shadow-sm shadow-indigo-150 group"
          >
            <Play className="h-3 w-3 text-white fill-white group-hover:scale-110 transition-transform" />
            <span>Simulate Alarm</span>
          </button>
        </div>
      </div>

      {/* Interactive Logger Deck */}
      {dispatchLogs.length > 0 && (
        <div className="pt-3 border-t border-slate-100 space-y-2">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-1">
              <Zap className="h-3 w-3 text-indigo-500" />
              <span className="text-[9.5px] font-bold uppercase tracking-wider text-slate-400">
                Trigger Feed Logs
              </span>
            </div>
            <button 
              onClick={clearDispatchLogs} 
              className="text-[9px] hover:text-rose-600 font-sans tracking-wide cursor-pointer font-bold lowercase transition-colors"
            >
              (Clear feed)
            </button>
          </div>
          
          <div className="space-y-1.5 bg-slate-50 p-2.5 rounded-lg border border-slate-150 max-h-28 overflow-y-auto">
            {dispatchLogs.map((lg) => (
              <div key={lg.id} className="text-[10px] font-mono leading-relaxed flex items-start gap-1 pb-1 border-b border-dashed border-slate-200/50 last:border-0 last:pb-0 text-slate-600">
                <span className="text-slate-400 shrink-0 select-none">[{lg.time}]</span>
                <span className={`font-bold uppercase tracking-wider shrink-0 select-none px-1 rounded-sm text-[8px] ${
                  lg.type === 'email' ? 'bg-amber-100/70 text-amber-800' :
                  lg.type === 'push' ? 'bg-blue-100/70 text-blue-800' :
                  lg.type === 'in-app' ? 'bg-indigo-100/70 text-indigo-800' :
                  'bg-slate-200 text-slate-700'
                }`}>
                  {lg.type}
                </span>
                <span className="break-words pl-0.5">{lg.message}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

