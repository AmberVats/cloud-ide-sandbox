import React, { useState } from 'react';
import { Terminal } from './Terminal';
import { MetricsBadge } from './MetricsBadge';
import { ExecutionResult } from '../types';
import {
  Terminal as TermIcon,
  Activity,
  Keyboard,
} from 'lucide-react';

interface OutputPanelProps {
  logs: string;
  onClear: () => void;
  onSendInput: (input: string) => void;
  isRunning: boolean;
  lastResult: ExecutionResult | null;
  stdinBuffer: string;
  onStdinChange: (val: string) => void;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({
  logs,
  onClear,
  onSendInput,
  isRunning,
  lastResult,
  stdinBuffer,
  onStdinChange,
}) => {
  const [activeTab, setActiveTab] = useState<'terminal' | 'metrics' | 'stdin'>('terminal');

  return (
    <div className="terminal-pane">
      {/* Tab Navigation Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#161b22',
          borderBottom: '1px solid var(--border-subtle)',
          padding: '0 12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center' }}>
          <button
            onClick={() => setActiveTab('terminal')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 500,
              color: activeTab === 'terminal' ? '#ffffff' : 'var(--text-muted)',
              backgroundColor: activeTab === 'terminal' ? '#0c0e14' : 'transparent',
              border: 'none',
              borderTop: activeTab === 'terminal' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            <TermIcon size={14} />
            <span>Terminal Stream</span>
          </button>

          <button
            onClick={() => setActiveTab('metrics')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 500,
              color: activeTab === 'metrics' ? '#ffffff' : 'var(--text-muted)',
              backgroundColor: activeTab === 'metrics' ? '#0c0e14' : 'transparent',
              border: 'none',
              borderTop: activeTab === 'metrics' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            <Activity size={14} />
            <span>Diagnostics & Metrics</span>
          </button>

          <button
            onClick={() => setActiveTab('stdin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              fontSize: '12px',
              fontWeight: 500,
              color: activeTab === 'stdin' ? '#ffffff' : 'var(--text-muted)',
              backgroundColor: activeTab === 'stdin' ? '#0c0e14' : 'transparent',
              border: 'none',
              borderTop: activeTab === 'stdin' ? '2px solid var(--accent-primary)' : '2px solid transparent',
              cursor: 'pointer',
            }}
          >
            <Keyboard size={14} />
            <span>Custom Stdin</span>
            {stdinBuffer.length > 0 && (
              <span
                style={{
                  width: '6px',
                  height: '6px',
                  borderRadius: '50%',
                  backgroundColor: 'var(--accent-info)',
                }}
              />
            )}
          </button>
        </div>

        {/* Live Metrics Summary Badge */}
        <div>
          <MetricsBadge result={lastResult} isRunning={isRunning} />
        </div>
      </div>

      {/* Tab Content Panels */}
      <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
        {activeTab === 'terminal' && (
          <Terminal
            logs={logs}
            onClear={onClear}
            onSendInput={onSendInput}
            isRunning={isRunning}
          />
        )}

        {activeTab === 'metrics' && (
          <div style={{ padding: '16px', overflowY: 'auto', backgroundColor: '#0c0e14', height: '100%' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-main)', marginBottom: '12px' }}>
              Execution Diagnostics & Resource Quota Limits
            </h4>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                gap: '12px',
                marginBottom: '16px',
              }}
            >
              <div
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Execution Latency</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#38bdf8', marginTop: '4px' }}>
                  {lastResult ? `${lastResult.executionTimeMs} ms` : '—'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Max Timeout: 5,000 ms
                </div>
              </div>

              <div
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Memory Allocated</div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: '#c084fc', marginTop: '4px' }}>
                  {lastResult ? `${lastResult.memoryUsageMb.toFixed(2)} MB` : '—'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Hard Cgroups Cap: 256 MB
                </div>
              </div>

              <div
                style={{
                  padding: '12px',
                  borderRadius: '6px',
                  backgroundColor: 'var(--bg-secondary)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Container Security Sandbox</div>
                <div style={{ fontSize: '14px', fontWeight: 600, color: '#4ade80', marginTop: '4px' }}>
                  {lastResult?.environment || 'Isolated Environment'}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Network: Egress Disabled (--network none)
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'stdin' && (
          <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#0c0e14' }}>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '8px' }}>
              Standard Input (stdin) supplied to program prior to execution:
            </div>
            <textarea
              value={stdinBuffer}
              onChange={(e) => onStdinChange(e.target.value)}
              placeholder="Enter inputs here (e.g. numbers, lines of text to pass into input() / cin / Scanner)..."
              style={{
                flex: 1,
                width: '100%',
                backgroundColor: 'var(--bg-secondary)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '6px',
                padding: '10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '13px',
                outline: 'none',
                resize: 'none',
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};
