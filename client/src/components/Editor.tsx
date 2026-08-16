import React from 'react';
import MonacoEditor, { OnMount } from '@monaco-editor/react';
import { CodeFile } from '../types';
import { Eye, ZoomIn, ZoomOut } from 'lucide-react';

interface EditorProps {
  files: CodeFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onContentChange: (fileId: string, content: string) => void;
  onRun: () => void;
}

export const Editor: React.FC<EditorProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onContentChange,
  onRun,
}) => {
  const [fontSize, setFontSize] = React.useState<number>(14);
  const [showMinimap, setShowMinimap] = React.useState<boolean>(true);

  const activeFile = files.find((f) => f.id === activeFileId) || files[0];

  const getMonacoLanguage = (fileName: string): string => {
    if (fileName.endsWith('.py')) return 'python';
    if (fileName.endsWith('.js')) return 'javascript';
    if (fileName.endsWith('.ts')) return 'typescript';
    if (fileName.endsWith('.cpp') || fileName.endsWith('.h') || fileName.endsWith('.hpp')) return 'cpp';
    if (fileName.endsWith('.java')) return 'java';
    if (fileName.endsWith('.go')) return 'go';
    if (fileName.endsWith('.json')) return 'json';
    if (fileName.endsWith('.html')) return 'html';
    if (fileName.endsWith('.css')) return 'css';
    if (fileName.endsWith('.md')) return 'markdown';
    return 'plaintext';
  };

  const handleEditorDidMount: OnMount = (editor, monaco) => {
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRun();
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', backgroundColor: '#1e1e1e' }}>
      {/* Tab Bar & Editor Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          backgroundColor: '#181a1f',
          borderBottom: '1px solid var(--border-subtle)',
          paddingRight: '12px',
        }}
      >
        {/* Open File Tabs */}
        <div className="tab-bar">
          {files.map((file) => (
            <div
              key={file.id}
              className={`tab-item ${file.id === activeFileId ? 'active' : ''}`}
              onClick={() => onSelectFile(file.id)}
            >
              <span>{file.name}</span>
            </div>
          ))}
        </div>

        {/* Editor Quick Settings */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {/* Font Size Zoom */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--text-muted)' }}>
            <button
              className="btn"
              style={{ padding: '2px 5px', fontSize: '11px', background: 'transparent' }}
              onClick={() => setFontSize((s) => Math.max(11, s - 1))}
              title="Decrease Font Size"
            >
              <ZoomOut size={13} />
            </button>
            <span style={{ fontSize: '11px', fontFamily: 'var(--font-mono)' }}>{fontSize}px</span>
            <button
              className="btn"
              style={{ padding: '2px 5px', fontSize: '11px', background: 'transparent' }}
              onClick={() => setFontSize((s) => Math.min(22, s + 1))}
              title="Increase Font Size"
            >
              <ZoomIn size={13} />
            </button>
          </div>

          {/* Minimap Toggle */}
          <button
            className="btn"
            style={{
              padding: '3px 6px',
              fontSize: '11px',
              backgroundColor: showMinimap ? 'var(--bg-tertiary)' : 'transparent',
              color: showMinimap ? 'var(--accent-info)' : 'var(--text-muted)',
            }}
            onClick={() => setShowMinimap(!showMinimap)}
            title="Toggle Minimap"
          >
            <Eye size={13} />
          </button>
        </div>
      </div>

      {/* Monaco Code Editor Container */}
      <div style={{ flex: 1, position: 'relative' }}>
        {activeFile && (
          <MonacoEditor
            height="100%"
            language={getMonacoLanguage(activeFile.name)}
            value={activeFile.content}
            theme="vs-dark"
            onChange={(value) => {
              if (value !== undefined) {
                onContentChange(activeFile.id, value);
              }
            }}
            onMount={handleEditorDidMount}
            options={{
              fontSize: fontSize,
              fontFamily: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
              fontLigatures: true,
              minimap: { enabled: showMinimap },
              scrollBeyondLastLine: false,
              automaticLayout: true,
              tabSize: 2,
              wordWrap: 'on',
              lineNumbers: 'on',
              renderLineHighlight: 'all',
              cursorBlinking: 'smooth',
              cursorSmoothCaretAnimation: 'on',
              smoothScrolling: true,
              bracketPairColorization: { enabled: true },
              padding: { top: 12, bottom: 12 },
            }}
          />
        )}
      </div>
    </div>
  );
};
