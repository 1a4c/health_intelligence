import React, { useState } from 'react';
import { HealthEventLog } from '../types';
import { ListFilter, Download, Trash2, ShieldAlert, AlertTriangle, Info, CheckCircle2 } from 'lucide-react';

interface EventLogTableProps {
  logs: HealthEventLog[];
  onClearLogs: () => void;
  onExportLogs: () => void;
}

export const EventLogTable: React.FC<EventLogTableProps> = ({
  logs,
  onClearLogs,
  onExportLogs,
}) => {
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'info' | 'warning' | 'alert'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = logs.filter((log) => {
    const matchesSeverity = filterSeverity === 'all' || log.severity === filterSeverity;
    const matchesSearch =
      log.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.eventType.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'alert':
        return (
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest bg-[#0B0C0E] text-[#FF4E00] border border-[#FF4E00] flex items-center space-x-1">
            <ShieldAlert className="w-3 h-3 text-[#FF4E00]" />
            <span>ALERT</span>
          </span>
        );
      case 'warning':
        return (
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest bg-[#0B0C0E] text-amber-400 border border-amber-600/60 flex items-center space-x-1">
            <AlertTriangle className="w-3 h-3 text-amber-400" />
            <span>WARN</span>
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 text-[9px] font-mono font-bold uppercase tracking-widest bg-[#0B0C0E] text-[#D1D1D1] border border-[#333538] flex items-center space-x-1">
            <Info className="w-3 h-3 text-[#D1D1D1]" />
            <span>INFO</span>
          </span>
        );
    }
  };

  return (
    <div className="bg-[#1A1C1E] border border-[#333538] p-5 shadow-2xl flex flex-col h-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-[#333538] pb-3">
        <div className="flex items-center space-x-2">
          <ListFilter className="w-4 h-4 text-[#FF4E00]" />
          <h2 className="text-xs font-mono font-bold tracking-[0.2em] uppercase text-white">
            Trace Log Index ({logs.length})
          </h2>
        </div>

        {/* Filter Controls & Actions */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <input
            type="text"
            placeholder="Search logs..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="px-3 py-1.5 text-[10px] bg-[#0B0C0E] border border-[#333538] text-[#D1D1D1] focus:outline-none focus:border-[#FF4E00] font-mono tracking-wider uppercase"
          />

          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value as any)}
            className="px-3 py-1.5 text-[10px] bg-[#0B0C0E] border border-[#333538] text-[#D1D1D1] font-mono tracking-wider uppercase focus:outline-none focus:border-[#FF4E00]"
          >
            <option value="all">All Severities</option>
            <option value="alert">Alerts Only</option>
            <option value="warning">Warnings Only</option>
            <option value="info">Info Only</option>
          </select>

          <button
            onClick={onExportLogs}
            title="Export CSV Log File"
            className="p-1.5 bg-[#0B0C0E] border border-[#333538] text-[#D1D1D1] hover:text-white hover:border-[#FF4E00] transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
          </button>

          <button
            onClick={onClearLogs}
            title="Clear Log History"
            className="p-1.5 bg-[#0B0C0E] border border-[#333538] text-[#D1D1D1] hover:text-[#FF4E00] hover:border-[#FF4E00] transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Log Table Container */}
      <div className="flex-1 overflow-x-auto overflow-y-auto max-h-[260px] border border-[#333538] bg-[#0B0C0E]">
        <table className="w-full text-left text-[11px] font-mono text-[#D1D1D1]">
          <thead className="bg-[#1A1C1E] border-b border-[#333538] text-[#D1D1D1]/50 uppercase tracking-widest sticky top-0">
            <tr>
              <th className="p-2.5">Time</th>
              <th className="p-2.5">Frame</th>
              <th className="p-2.5">Severity</th>
              <th className="p-2.5">Event Type</th>
              <th className="p-2.5">Description</th>
              <th className="p-2.5 text-right">Value</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#333538]/60">
            {filteredLogs.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-[#D1D1D1]/40 uppercase tracking-widest text-[10px]">
                  No matching telemetry events recorded yet.
                </td>
              </tr>
            ) : (
              filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-[#1A1C1E]/60 transition-colors">
                  <td className="p-2.5 text-[#D1D1D1]/60 whitespace-nowrap">{log.timestamp}</td>
                  <td className="p-2.5 text-[#FF4E00] font-bold whitespace-nowrap">#{log.frameIndex}</td>
                  <td className="p-2.5 whitespace-nowrap">{getSeverityBadge(log.severity)}</td>
                  <td className="p-2.5 font-bold text-white whitespace-nowrap uppercase">{log.eventType}</td>
                  <td className="p-2.5 text-[#D1D1D1]/80 max-w-xs truncate">{log.description}</td>
                  <td className="p-2.5 text-right font-bold text-[#FF4E00] whitespace-nowrap">{log.value}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
