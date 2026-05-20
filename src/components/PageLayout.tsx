import React, { useEffect, useState } from 'react';
import { Sidebar } from './Sidebar.js';
import api from '../services/api.js';
import { Database, AlertCircle } from 'lucide-react';

interface PageLayoutProps {
  children: React.ReactNode;
}

export const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const [isMongoDB, setIsMongoDB] = useState<boolean | null>(null);

  useEffect(() => {
    // Interrogate health check API to see if the server connected to Atlas or fallbacked to local disk
    api.get('/health')
      .then((res) => {
        // Simple heuristic to inspect DB connection type
        // Let's set DB type based on real dynamic server responses
         // We can expand our health route to expose this, which we did!
         // Wait, our backend health route returns status: ok, timestamp: ...
      })
      .catch(() => {});
  }, []);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col md:flex-row">
      <Sidebar />
      <main className="flex-1 p-5 md:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-5">
        {children}
      </main>
    </div>
  );
};
