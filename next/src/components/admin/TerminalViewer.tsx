'use client';

import React, { useMemo, useState } from 'react';
import { X, Terminal, Copy, Check } from 'lucide-react';
import AnsiToHtml from 'ansi-to-html';

interface TerminalViewerProps {
  title: string;
  output: string;
  isRunning: boolean;
  onClose: () => void;
}

export default function TerminalViewer({
  title,
  output,
  isRunning,
  onClose,
}: TerminalViewerProps) {
  const [hasCopied, setHasCopied] = useState(false);

  const convert = useMemo(() => new AnsiToHtml({
    fg: '#e5e7eb', // gray-200
    bg: '#111827', // gray-900
    newline: true,
    escapeXML: true,
  }), []);

  const htmlOutput = useMemo(() => convert.toHtml(output), [convert, output]);

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setHasCopied(true);
    setTimeout(() => setHasCopied(false), 2000);
  };

  return (
    <div className="bg-gray-900 text-gray-200 rounded-2xl border-2 border-gray-700 shadow-2xl overflow-hidden font-mono flex flex-col h-full">
      {/* Header */}
      <div className="bg-gray-800 px-4 py-2 flex items-center justify-between border-b border-gray-700">
        <div className="flex items-center space-x-2">
          <Terminal size={16} className="text-green-400" />
          <span className="font-semibold text-sm">{title}</span>
        </div>
        <div className="flex items-center space-x-4">
          {isRunning && (
            <div className="flex items-center space-x-1 text-xs text-yellow-400">
              <svg className="animate-spin h-3 w-3" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
              </svg>
              <span>執行中...</span>
            </div>
          )}
          <button
            onClick={handleCopy}
            disabled={!output}
            className="text-gray-400 hover:text-white transition-colors disabled:text-gray-600 disabled:cursor-not-allowed"
            title="複製內容"
          >
            {hasCopied ? <Check size={16} className="text-green-400" /> : <Copy size={16} />}
          </button>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
            title="關閉終端機"
          >
            <X size={18} />
          </button>
        </div>
      </div>

      {/* Output Area */}
      <div className="p-4 overflow-y-auto flex-grow h-96">
        <pre
          className="whitespace-pre-wrap break-words text-sm leading-6"
          dangerouslySetInnerHTML={{ __html: htmlOutput || '等待指令執行...' }}
        />
      </div>
    </div>
  );
}