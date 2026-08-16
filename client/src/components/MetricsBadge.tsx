import React from 'react';
import { ExecutionResult } from '../types';
import { Clock, CheckCircle2, XCircle, ShieldCheck, HardDrive } from 'lucide-react';

interface MetricsBadgeProps {
  result: ExecutionResult | null;
  isRunning: boolean;
}

export const MetricsBadge: React.FC<MetricsBadgeProps> = ({ result, isRunning }) => {
  if (isRunning) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          padding: '4px 10px',
          borderRadius: '6px',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          border: '1px solid rgba(99, 102, 241, 0.3)',
          fontSize: '12px',
          color: '#a5b4fc',
        }}
      >
        <span
          style={{
            width: '8px',
            height: '8px',
            borderRadius: '50%',
            backgroundColor: '#818cf8',
          }}
          className="animate-spin"
        />
        <span>Executing in isolated sandbox...</span>
      </div>
    );
  }

  if (!result) {
    return (
      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
        No execution metrics yet.
      </div>
    );
  }

  const isSuccess = result.exitCode === 0;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
      {/* Status Badge */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '5px',
          padding: '3px 8px',
          borderRadius: '4px',
          backgroundColor: isSuccess ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
          border: `1px solid ${isSuccess ? 'rgba(34, 197, 94, 0.4)' : 'rgba(239, 68, 68, 0.4)'}`,
          fontSize: '11px',
          fontWeight: 600,
          color: isSuccess ? '#4ade80' : '#f87171',
        }}
      >
        {isSuccess ? <CheckCircle2 size={13} /> : <XCircle size={13} />}
        <span>{isSuccess ? `Exit 0 (Success)` : `Exit ${result.exitCode} (${result.status})`}</span>
      </div>

      {/* Latency */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
        <Clock size={13} color="var(--accent-info)" />
        <span>Time:</span>
        <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
          {result.executionTimeMs}ms
        </strong>
      </div>

      {/* Memory */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
        <HardDrive size={13} color="#c084fc" />
        <span>Memory:</span>
        <strong style={{ color: 'var(--text-main)', fontFamily: 'var(--font-mono)' }}>
          {result.memoryUsageMb.toFixed(1)} MB
        </strong>
      </div>

      {/* Sandbox Environment */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--text-muted)' }}>
        <ShieldCheck size={13} color="#34d399" />
        <span style={{ textTransform: 'capitalize' }}>
          {result.environment.replace('-', ' ')}
        </span>
      </div>
    </div>
  );
};
