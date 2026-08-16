import { useState, useEffect, useRef } from 'react';
import { Navbar } from './components/Navbar';
import { FileExplorer } from './components/FileExplorer';
import { Editor } from './components/Editor';
import { OutputPanel } from './components/OutputPanel';
import { WORKSPACE_TEMPLATES } from './constants/templates';
import { CodeFile, SupportedLanguage, ExecutionResult, SandboxStatus } from './types';

export function App() {
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('python');
  const [files, setFiles] = useState<CodeFile[]>(WORKSPACE_TEMPLATES.python.files);
  const [activeFileId, setActiveFileId] = useState<string>(WORKSPACE_TEMPLATES.python.files[0].id);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [logs, setLogs] = useState<string>('');
  const [lastResult, setLastResult] = useState<ExecutionResult | null>(null);
  const [stdinBuffer, setStdinBuffer] = useState<string>('');
  const [dockerAvailable, setDockerAvailable] = useState<boolean>(false);
  const [activeEnvironment, setActiveEnvironment] = useState<'docker-sandbox' | 'process-sandbox'>('process-sandbox');
  const [connected, setConnected] = useState<boolean>(false);

  const socketRef = useRef<WebSocket | null>(null);

  // Connect WebSocket & fetch engine status on mount
  useEffect(() => {
    fetchServerStatus();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.port === '5173' ? 'localhost:5000' : window.location.host;
    const wsUrl = `${protocol}//${host}/ws`;

    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      setConnected(true);
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);

        if (message.type === 'STDOUT') {
          setLogs((prev) => prev + message.data);
        } else if (message.type === 'STDERR') {
          setLogs((prev) => prev + `\x1b[31m${message.data}\x1b[0m`);
        } else if (message.type === 'EXECUTION_START') {
          setLogs((prev) => prev + `\x1b[36m🚀 Starting execution in ${message.environment} [Job: ${message.jobId}]...\x1b[0m\r\n`);
        } else if (message.type === 'EXECUTION_COMPLETE') {
          setIsRunning(false);
          const result: ExecutionResult = message.result;
          setLastResult(result);
          setLogs((prev) => prev + `\r\n\x1b[32m✨ Process finished with exit code ${result.exitCode} (${result.executionTimeMs}ms, memory: ${result.memoryUsageMb.toFixed(1)}MB)\x1b[0m\r\n`);
        } else if (message.type === 'ERROR') {
          setIsRunning(false);
          setLogs((prev) => prev + `\r\n\x1b[31m❌ Execution Error: ${message.message}\x1b[0m\r\n`);
        }
      } catch {
        setLogs((prev) => prev + event.data);
      }
    };

    ws.onclose = () => {
      setConnected(false);
    };

    socketRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  const fetchServerStatus = async () => {
    try {
      const res = await fetch('http://localhost:5000/api/status');
      if (res.ok) {
        const data: SandboxStatus = await res.json();
        setDockerAvailable(data.dockerAvailable);
        if (data.dockerAvailable) {
          setActiveEnvironment('docker-sandbox');
        }
      }
    } catch (err) {
      console.warn('Backend server not yet ready, using fallback:', err);
    }
  };

  const handleLanguageChange = (lang: SupportedLanguage) => {
    setCurrentLanguage(lang);
    const template = WORKSPACE_TEMPLATES[lang];
    if (template) {
      setFiles(template.files);
      setActiveFileId(template.files[0].id);
    }
  };

  const handleResetTemplate = () => {
    const template = WORKSPACE_TEMPLATES[currentLanguage];
    if (template) {
      setFiles(template.files);
      setActiveFileId(template.files[0].id);
      setLogs(`\x1b[33m🔄 Workspace reset to ${template.name} starter template.\x1b[0m\r\n`);
    }
  };

  const handleCreateFile = (fileName: string) => {
    const newFile: CodeFile = {
      id: `file_${Date.now()}`,
      name: fileName,
      language: currentLanguage,
      content: `// ${fileName}\n`,
    };
    setFiles((prev) => [...prev, newFile]);
    setActiveFileId(newFile.id);
  };

  const handleDeleteFile = (fileId: string) => {
    setFiles((prev) => {
      const updated = prev.filter((f) => f.id !== fileId);
      if (activeFileId === fileId && updated.length > 0) {
        setActiveFileId(updated[0].id);
      }
      return updated;
    });
  };

  const handleContentChange = (fileId: string, newContent: string) => {
    setFiles((prev) =>
      prev.map((f) => (f.id === fileId ? { ...f, content: newContent } : f))
    );
  };

  const handleRunCode = () => {
    if (isRunning) return;

    setIsRunning(true);
    setLogs('');

    const mainFile = files.find((f) => f.isMain) || files[0];
    const payload = {
      type: 'RUN_CODE',
      language: currentLanguage,
      environment: activeEnvironment,
      files: files,
      entryFile: mainFile.name,
      stdin: stdinBuffer,
    };

    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(payload));
    } else {
      fetch('http://localhost:5000/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then((res) => res.json())
        .then((result: ExecutionResult) => {
          setLastResult(result);
          if (result.stdout) setLogs((prev) => prev + result.stdout);
          if (result.stderr) setLogs((prev) => prev + `\x1b[31m${result.stderr}\x1b[0m`);
          setLogs((prev) => prev + `\r\n\x1b[32m✨ Finished in ${result.executionTimeMs}ms (Exit ${result.exitCode})\x1b[0m\r\n`);
        })
        .catch((err) => {
          setLogs((prev) => prev + `\x1b[31m❌ Connection failed: ${err.message}\x1b[0m\r\n`);
        })
        .finally(() => {
          setIsRunning(false);
        });
    }
  };

  const handleStopExecution = () => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify({ type: 'STOP_EXECUTION' }));
    }
    setIsRunning(false);
    setLogs((prev) => prev + '\r\n\x1b[33m⏹️ Execution cancelled by user.\x1b[0m\r\n');
  };

  const handleSendInput = (input: string) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN && isRunning) {
      socketRef.current.send(JSON.stringify({ type: 'STDIN_INPUT', data: input }));
    }
  };

  const handleDownloadProject = () => {
    const mainFile = files.find((f) => f.isMain) || files[0];
    const blob = new Blob([mainFile.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = mainFile.name;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="app-container">
      <Navbar
        currentLanguage={currentLanguage}
        onLanguageChange={handleLanguageChange}
        isRunning={isRunning}
        onRun={handleRunCode}
        onStop={handleStopExecution}
        onResetTemplate={handleResetTemplate}
        onDownloadProject={handleDownloadProject}
        dockerAvailable={dockerAvailable}
        activeEnvironment={activeEnvironment}
        onEnvironmentChange={setActiveEnvironment}
        connected={connected}
      />

      <div className="main-workspace">
        <FileExplorer
          files={files}
          activeFileId={activeFileId}
          onSelectFile={setActiveFileId}
          onCreateFile={handleCreateFile}
          onDeleteFile={handleDeleteFile}
          currentLanguage={currentLanguage}
        />

        <div className="editor-terminal-container">
          <div className="editor-pane">
            <Editor
              files={files}
              activeFileId={activeFileId}
              onSelectFile={setActiveFileId}
              onContentChange={handleContentChange}
              onRun={handleRunCode}
            />
          </div>

          <div className="pane-resizer" />

          <OutputPanel
            logs={logs}
            onClear={() => setLogs('')}
            onSendInput={handleSendInput}
            isRunning={isRunning}
            lastResult={lastResult}
            stdinBuffer={stdinBuffer}
            onStdinChange={setStdinBuffer}
          />
        </div>
      </div>

      <footer className="status-bar">
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>CodeSphere Sandbox Engine v1.0.0</span>
          <span>Runtime: {currentLanguage.toUpperCase()}</span>
          <span>Mode: {activeEnvironment}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span>UTF-8</span>
          <span>Tab Size: 2</span>
          <span>Docker Isolation: {dockerAvailable ? 'Active' : 'Disabled'}</span>
        </div>
      </footer>
    </div>
  );
}
export default App;
