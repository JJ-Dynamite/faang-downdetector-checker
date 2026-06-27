'use client';

import { useState, useEffect } from 'react';

export default function Home() {
  const [url, setUrl] = useState('');
  const [status, setStatus] = useState<any>(null);
  const [globalStatus, setGlobalStatus] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchGlobalStatus();
  }, []);

  const fetchGlobalStatus = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/global');
      const data = await res.json();
      if (data.success) setGlobalStatus(data.data);
    } catch (error) {
      console.error('Failed to fetch global status:', error);
    }
  };

  const handleCheck = async () => {
    if (!url) return;
    setLoading(true);
    try {
      const res = await fetch('http://localhost:3001/api/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (data.success) setStatus(data.data);
    } catch (error) {
      console.error('Check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900 text-white">
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-3 mb-4">
            <span className="text-5xl">📡</span>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 to-red-400 bg-clip-text text-transparent">
              DownDetector
            </h1>
          </div>
          <p className="text-gray-300 text-lg">Check if any website is down right now</p>
        </div>

        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 shadow-2xl mb-8">
          <div className="flex gap-4">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://example.com"
              className="flex-1 px-6 py-4 bg-slate-700 border border-slate-600 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:border-orange-500"
            />
            <button
              onClick={handleCheck}
              disabled={!url || loading}
              className="px-8 py-4 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 rounded-xl font-semibold transition-all disabled:opacity-50"
            >
              {loading ? 'Checking...' : '🔍 Check Status'}
            </button>
          </div>
        </div>

        {status && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700 mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">{status.name}</h2>
              <span className={`px-4 py-2 rounded-full font-bold ${
                status.status === 'operational' 
                  ? 'bg-green-500/20 text-green-400 border border-green-500'
                  : status.status === 'degraded'
                  ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500'
                  : 'bg-red-500/20 text-red-400 border border-red-500'
              }`}>
                {status.status === 'operational' ? '✅ Operational' : 
                 status.status === 'degraded' ? '⚠️ Degraded' : '❌ Down'}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-slate-700/30 rounded-xl">
                <p className="text-gray-400 text-sm">Response Time</p>
                <p className="text-2xl font-bold text-orange-400">{status.response_time_ms}ms</p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-xl">
                <p className="text-gray-400 text-sm">Status Code</p>
                <p className="text-2xl font-bold text-green-400">{status.status_code}</p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-xl">
                <p className="text-gray-400 text-sm">Uptime</p>
                <p className="text-2xl font-bold text-blue-400">{status.uptime_percentage}%</p>
              </div>
              <div className="p-4 bg-slate-700/30 rounded-xl">
                <p className="text-gray-400 text-sm">Last Checked</p>
                <p className="text-sm font-semibold text-purple-400">Just now</p>
              </div>
            </div>
          </div>
        )}

        {globalStatus && (
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl p-8 border border-slate-700">
            <h2 className="text-xl font-bold text-orange-400 mb-6">Global Service Status</h2>
            <div className="space-y-3">
              {globalStatus.services?.map((service: any, i: number) => (
                <div key={i} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${
                      service.status === 'operational' ? 'bg-green-400' :
                      service.status === 'degraded' ? 'bg-yellow-400' : 'bg-red-400'
                    }`} />
                    <span className="font-semibold">{service.name}</span>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm ${
                      service.status === 'operational' ? 'text-green-400' : 'text-yellow-400'
                    }`}>
                      {service.status === 'operational' ? 'Operational' : 'Degraded'}
                    </span>
                    <p className="text-xs text-gray-400">{service.uptime}% uptime</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {!status && !globalStatus && (
          <div className="text-center py-12">
            <p className="text-6xl mb-4">🌐</p>
            <p className="text-gray-400">Enter a URL to check its status</p>
          </div>
        )}
      </div>
    </main>
  );
}
