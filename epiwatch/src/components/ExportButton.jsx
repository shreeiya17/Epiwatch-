import React from 'react';
import { Download } from 'lucide-react';

export const downloadCSV = (data, filename) => {
  if (!data || !data.length) return;

  // Extract headers
  const headers = Object.keys(data[0]);
  
  // Format rows
  const rows = data.map(row => 
    headers.map(header => {
      let val = row[header];
      // Handle null/undefined
      if (val === null || val === undefined) val = '';
      // Escape quotes and wrap in quotes if there's a comma
      const stringVal = String(val);
      if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
        return `"${stringVal.replace(/"/g, '""')}"`;
      }
      return stringVal;
    }).join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${filename || 'chart-data'}.csv`);
  link.setAttribute('target', '_blank');
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export default function ExportButton({ data, filename, label = "Export CSV" }) {
  return (
    <button
      onClick={() => downloadCSV(data, filename)}
      className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700/50 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20"
      title="Download data as CSV for Excel"
    >
      <Download size={14} className="text-blue-500 dark:text-blue-400" />
      {label}
    </button>
  );
}
