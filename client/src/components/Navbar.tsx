import React from 'react';
import {
  Play,
  Square,
  ShieldCheck,
  Download,
  RotateCcw,
  Terminal as TerminalIcon,
  Layers,
} from 'lucide-react';
import { SupportedLanguage } from '../types';

interface NavbarProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (lang: SupportedLanguage) => void;
  isRunning: boolean;
  onRun: () => void;
  onStop: () => void;
  onResetTemplate: () => void;
  onDownloadProject: () => void;
  dockerAvailable: boolean;
  activeEnvironment: 'docker-sandbox' | 'process-sandbox';
  onEnvironmentChange: (env: 'docker-sandbox' | 'process-sandbox') => void;
  connected: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentLanguage,
  onLanguageChange,
  isRunning,
  onRun,
  onStop,
  onResetTemplate,
  onDownloadProject,
  dockerAvailable,
  activeEnvironment,
  onEnvironmentChange,
  connected,
}) => {
  return (
    <header
      style={{
        height: 'var(--header-height)',
        backgroundColor: 'var(--bg-secondary)',
        borderBottom: '1px solid var(--border-subtle)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        userSelect: 'none',
      }}
    >
      {/* Brand & Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px',
            borderRadius: '8px',
            background: 'linear-gradient(135deg, #6366f1 0%, #a855f7 100%)',
            boxShadow: '0 2px 8px rgba(99, 102, 241, 0.4)',
          }}
        >
          <TerminalIcon size={18} color="#ffffff" />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ fontWeight: 700, fontSize: '15px', letterSpacing: '-0.02em', color: '#ffffff' }}>
              CodeSphere
            </span>
            <span
              style={{
                fontSize: '10px',
                fontWeight: 600,
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                color: '#a5b4fc',
                border: '1px solid rgba(99, 102, 241, 0.4)',
                borderRadius: '4px',
                padding: '1px 6px',
                textTransform: 'uppercase',
              }}
            >
              Cloud IDE
            </span>
          </div>
        </div>
      </div>

      {/* Center Controls: Language Selector & Run Button */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        {/* Language Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Layers size={15} color="var(--text-muted)" />
          <select
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            disabled={isRunning}
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '13px',
              fontFamily: 'var(--font-sans)',
              cursor: isRunning ? 'not-allowed' : 'pointer',
              outline: 'none',
            }}
          >
            <option value="python">Python 3.11</option>
            <option value="javascript">Node.js (JavaScript)</option>
            <option value="typescript">TypeScript 5.x</option>
            <option value="cpp">C++ 17 (GCC)</option>
            <option value="java">Java 17 (OpenJDK)</option>
            <option value="go">Go 1.22</option>
          </select>
        </div>

        {/* Sandbox Runtime Mode */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <ShieldCheck
            size={16}
            color={activeEnvironment === 'docker-sandbox' ? '#34d399' : '#fbbf24'}
          />
          <select
            value={activeEnvironment}
            onChange={(e) => onEnvironmentChange(e.target.value as 'docker-sandbox' | 'process-sandbox')}
            disabled={isRunning}
            style={{
              backgroundColor: 'var(--bg-tertiary)',
              color: 'var(--text-main)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '6px',
              padding: '6px 10px',
              fontSize: '12px',
              fontFamily: 'var(--font-sans)',
              cursor: 'pointer',
              outline: 'none',
            }}
          >
            <option value="process-sandbox">Safe Process Sandbox (Ultra-fast)</option>
            <option value="docker-sandbox" disabled={!dockerAvailable}>
              Docker cgroups Sandbox {dockerAvailable ? '(Isolated)' : '(Daemon offline)'}
            </option>
          </select>
        </div>

        {/* Run / Stop Button */}
        {isRunning ? (
          <button
            className="btn"
            onClick={onStop}
            style={{
              backgroundColor: 'var(--accent-danger)',
              color: '#ffffff',
              minWidth: '100px',
            }}
          >
            <Square size={14} fill="#ffffff" />
            <span>Stop</span>
          </button>
        ) : (
          <button
            className="btn btn-primary"
            onClick={onRun}
            style={{ minWidth: '110px' }}
            title="Execute Code (Ctrl + Enter)"
          >
            <Play size={14} fill="#ffffff" />
            <span>Run Code</span>
          </button>
        )}
      </div>

      {/* Right Controls: Reset, Download, Status */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button
          className="btn btn-secondary"
          onClick={onResetTemplate}
          title="Reset to language starter template"
          style={{ padding: '6px 10px' }}
        >
          <RotateCcw size={14} />
          <span style={{ fontSize: '12px' }}>Template</span>
        </button>

        <button
          className="btn btn-secondary"
          onClick={onDownloadProject}
          title="Download workspace files"
          style={{ padding: '6px 10px' }}
        >
          <Download size={14} />
          <span style={{ fontSize: '12px' }}>Export</span>
        </button>

        {/* Server Connection Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 8px',
            borderRadius: '6px',
            backgroundColor: 'var(--bg-tertiary)',
            border: '1px solid var(--border-subtle)',
            fontSize: '11px',
          }}
          title={connected ? 'Connected to execution engine' : 'Disconnected from server'}
        >
          <div
            style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: connected ? '#22c55e' : '#ef4444',
              boxShadow: connected ? '0 0 6px rgba(34, 197, 94, 0.6)' : 'none',
            }}
          />
          <span style={{ color: 'var(--text-muted)' }}>
            {connected ? 'Engine Ready' : 'Connecting...'}
          </span>
        </div>
      </div>
    </header>
  );
};
