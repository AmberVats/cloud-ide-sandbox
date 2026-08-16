import React, { useState } from 'react';
import {
  FolderTree,
  Plus,
  Trash2,
  FileText,
  FilePlus,
} from 'lucide-react';
import { CodeFile, SupportedLanguage } from '../types';

interface FileExplorerProps {
  files: CodeFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (fileName: string) => void;
  onDeleteFile: (fileId: string) => void;
  currentLanguage: SupportedLanguage;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onDeleteFile,
  currentLanguage,
}) => {
  const [isCreating, setIsCreating] = useState(false);
  const [newFileName, setNewFileName] = useState('');

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newFileName.trim()) {
      onCreateFile(newFileName.trim());
      setNewFileName('');
      setIsCreating(false);
    }
  };

  const getFileIcon = (fileName: string) => {
    if (fileName.endsWith('.py')) return <span style={{ color: '#3b82f6' }}>🐍</span>;
    if (fileName.endsWith('.js')) return <span style={{ color: '#facc15' }}>🟨</span>;
    if (fileName.endsWith('.ts')) return <span style={{ color: '#38bdf8' }}>🔷</span>;
    if (fileName.endsWith('.cpp') || fileName.endsWith('.h')) return <span style={{ color: '#ec4899' }}>⚙️</span>;
    if (fileName.endsWith('.java')) return <span style={{ color: '#f97316' }}>☕</span>;
    if (fileName.endsWith('.go')) return <span style={{ color: '#06b6d4' }}>🐹</span>;
    if (fileName.endsWith('.json')) return <span style={{ color: '#a855f7' }}>📋</span>;
    return <FileText size={15} color="var(--text-muted)" />;
  };

  return (
    <aside className="sidebar">
      {/* Sidebar Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px 14px',
          borderBottom: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FolderTree size={15} color="var(--accent-info)" />
          <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Explorer
          </span>
        </div>
        <button
          className="btn"
          style={{
            padding: '4px 6px',
            backgroundColor: 'var(--bg-tertiary)',
            color: 'var(--text-main)',
            borderRadius: '4px',
          }}
          onClick={() => setIsCreating(true)}
          title="New File"
        >
          <Plus size={14} />
        </button>
      </div>

      {/* New File Inline Form */}
      {isCreating && (
        <form onSubmit={handleCreateSubmit} style={{ padding: '8px 12px', borderBottom: '1px solid var(--border-subtle)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <FilePlus size={14} color="var(--accent-primary)" />
            <input
              type="text"
              value={newFileName}
              onChange={(e) => setNewFileName(e.target.value)}
              placeholder="e.g. script.py"
              autoFocus
              onBlur={() => {
                if (!newFileName.trim()) setIsCreating(false);
              }}
              style={{
                width: '100%',
                backgroundColor: 'var(--bg-primary)',
                color: 'var(--text-main)',
                border: '1px solid var(--border-focus)',
                borderRadius: '4px',
                padding: '4px 8px',
                fontSize: '12px',
                fontFamily: 'var(--font-mono)',
                outline: 'none',
              }}
            />
          </div>
        </form>
      )}

      {/* File List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {files.map((file) => {
          const isActive = file.id === activeFileId;
          return (
            <div
              key={file.id}
              onClick={() => onSelectFile(file.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '7px 14px',
                cursor: 'pointer',
                backgroundColor: isActive ? 'var(--bg-tertiary)' : 'transparent',
                borderLeft: isActive ? '3px solid var(--accent-primary)' : '3px solid transparent',
                transition: 'all 0.1s ease',
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'var(--bg-hover)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', overflow: 'hidden' }}>
                {getFileIcon(file.name)}
                <span
                  style={{
                    fontSize: '13px',
                    fontFamily: 'var(--font-mono)',
                    color: isActive ? '#ffffff' : 'var(--text-main)',
                    fontWeight: isActive ? 600 : 400,
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                  }}
                >
                  {file.name}
                </span>
                {file.isMain && (
                  <span
                    style={{
                      fontSize: '9px',
                      padding: '1px 4px',
                      borderRadius: '3px',
                      backgroundColor: 'rgba(35, 134, 54, 0.2)',
                      color: '#4ade80',
                      border: '1px solid rgba(74, 222, 128, 0.3)',
                    }}
                  >
                    entry
                  </span>
                )}
              </div>

              {files.length > 1 && !file.isMain && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFile(file.id);
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: '2px',
                    borderRadius: '3px',
                    display: 'flex',
                    alignItems: 'center',
                  }}
                  title="Delete file"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {/* Workspace Environment Info Footer */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid var(--border-subtle)',
          backgroundColor: 'var(--bg-secondary)',
          fontSize: '11px',
          color: 'var(--text-muted)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
          <span>Active Language</span>
          <span style={{ color: 'var(--accent-info)', fontWeight: 600, textTransform: 'capitalize' }}>
            {currentLanguage}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span>Files in workspace</span>
          <span style={{ color: 'var(--text-main)', fontWeight: 500 }}>{files.length}</span>
        </div>
      </div>
    </aside>
  );
};
