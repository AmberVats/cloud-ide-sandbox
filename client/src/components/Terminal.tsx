import React, { useEffect, useRef } from 'react';
import { Terminal as XTerm } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import '@xterm/xterm/css/xterm.css';
import { Trash2, Copy, Check } from 'lucide-react';

interface TerminalProps {
  logs: string;
  onClear: () => void;
  onSendInput?: (input: string) => void;
  isRunning: boolean;
}

export const Terminal: React.FC<TerminalProps> = ({ logs, onClear, onSendInput, isRunning }) => {
  const terminalRef = useRef<HTMLDivElement>(null);
  const xtermInstance = useRef<XTerm | null>(null);
  const fitAddonRef = useRef<FitAddon | null>(null);
  const [copied, setCopied] = React.useState(false);
  const lastRenderedLogLength = useRef<number>(0);

  useEffect(() => {
    if (!terminalRef.current) return;

    // Initialize Xterm
    const term = new XTerm({
      theme: {
        background: '#0c0e14',
        foreground: '#e2e8f0',
        cursor: '#6366f1',
        cursorAccent: '#ffffff',
        selectionBackground: 'rgba(99, 102, 241, 0.3)',
        black: '#1e293b',
        red: '#f87171',
        green: '#4ade80',
        yellow: '#facc15',
        blue: '#60a5fa',
        magenta: '#c084fc',
        cyan: '#38bdf8',
        white: '#f8fafc',
      },
      fontFamily: "'JetBrains Mono', 'Fira Code', Menlo, monospace",
      fontSize: 13,
      lineHeight: 1.35,
      cursorBlink: true,
      convertEol: true,
      rows: 14,
    });

    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);
    term.open(terminalRef.current);
    fitAddon.fit();

    term.writeln('\x1b[1;34m⚡ CodeSphere Cloud Sandbox Terminal Initialized.\x1b[0m');
    term.writeln('\x1b[90mPress "Run Code" or (Ctrl + Enter) to execute code in isolated container.\x1b[0m\r\n');

    // Handle user keyboard input to terminal
    term.onData((data) => {
      if (onSendInput) {
        onSendInput(data);
      }
    });

    xtermInstance.current = term;
    fitAddonRef.current = fitAddon;

    const handleResize = () => {
      fitAddon.fit();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      term.dispose();
    };
  }, []);

  // Update terminal content when logs change
  useEffect(() => {
    if (!xtermInstance.current) return;

    if (logs.length === 0) {
      xtermInstance.current.clear();
      lastRenderedLogLength.current = 0;
      return;
    }

    if (logs.length > lastRenderedLogLength.current) {
      const newChunk = logs.slice(lastRenderedLogLength.current);
      xtermInstance.current.write(newChunk);
      lastRenderedLogLength.current = logs.length;
    } else if (logs.length < lastRenderedLogLength.current) {
      xtermInstance.current.clear();
      xtermInstance.current.write(logs);
      lastRenderedLogLength.current = logs.length;
    }
  }, [logs]);

  const handleCopy = () => {
    navigator.clipboard.writeText(logs);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', position: 'relative' }}>
      {/* Terminal Toolbar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '6px 14px',
          backgroundColor: '#11141d',
          borderBottom: '1px solid var(--border-subtle)',
          fontSize: '12px',
          color: 'var(--text-muted)',
          userSelect: 'none',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Interactive Console</span>
          {isRunning && (
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '4px',
                color: '#34d399',
                fontSize: '11px',
              }}
            >
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: '#34d399',
                }}
                className="animate-pulse"
              />
              Streaming live stdout/stderr...
            </span>
          )}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            className="btn"
            style={{ padding: '2px 8px', fontSize: '11px', backgroundColor: 'transparent' }}
            onClick={handleCopy}
            title="Copy Terminal Logs"
          >
            {copied ? <Check size={12} color="#4ade80" /> : <Copy size={12} />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
          <button
            className="btn"
            style={{ padding: '2px 8px', fontSize: '11px', backgroundColor: 'transparent' }}
            onClick={onClear}
            title="Clear Console"
          >
            <Trash2 size={12} />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Terminal View */}
      <div
        ref={terminalRef}
        style={{
          flex: 1,
          padding: '8px',
          backgroundColor: '#0c0e14',
          overflow: 'hidden',
        }}
      />
    </div>
  );
};
