import * as React from 'react';
import { DebugUtils } from '../utils/debugUtils';

interface TestResult {
  isEnabled: boolean;
  logsCount: number;
  backendAvailable: boolean;
}

interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  context?: string;
  component?: string;
}

const ErrorLoggerTest: React.FC = () => {
  const [testResult, setTestResult] = React.useState<TestResult | null>(null);
  const [logs, setLogs] = React.useState<LogEntry[]>([]);

  const runTest = () => {
    const result = DebugUtils.testLogger();
    setTestResult(result);
    
    // Test verschiedene Log-Level
    DebugUtils.logError('Test Error Message', 'ErrorLoggerTest', { test: true });
    DebugUtils.logWarning('Test Warning Message', 'ErrorLoggerTest', { test: true });
    DebugUtils.logInfo('Test Info Message', 'ErrorLoggerTest', { test: true });
    DebugUtils.logDebug('Test Debug Message', 'ErrorLoggerTest', { test: true });
    
    // Update logs
    setTimeout(() => {
      setLogs(DebugUtils.errorLogger.getLogs());
    }, 1000);
  };

  const clearLogs = () => {
    DebugUtils.errorLogger.clearLogs();
    setLogs([]);
  };

  const showLogs = () => {
    setLogs(DebugUtils.errorLogger.getLogs());
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Error Logger Test</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          
          <div className="space-y-4">
            <button
              onClick={runTest}
              className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
            >
              Run Test
            </button>
            
            <button
              onClick={showLogs}
              className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600 ml-2"
            >
              Show Logs
            </button>
            
            <button
              onClick={clearLogs}
              className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 ml-2"
            >
              Clear Logs
            </button>
          </div>
          
          {testResult && (
            <div className="mt-4 p-4 bg-gray-100 rounded">
              <h3 className="font-semibold">Test Result:</h3>
              <pre className="text-sm">{JSON.stringify(testResult, null, 2)}</pre>
            </div>
          )}
        </div>
        
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Current Logs ({logs.length})</h2>
          
          <div className="max-h-96 overflow-y-auto">
            {logs.length === 0 ? (
              <p className="text-gray-500">No logs yet. Run a test to see logs.</p>
            ) : (
              <div className="space-y-2">
                {logs.map((log, index) => (
                  <div key={index} className="p-3 bg-gray-50 rounded border-l-4 border-blue-500">
                    <div className="flex justify-between items-start">
                      <span className={`px-2 py-1 rounded text-xs font-semibold ${
                        log.level === 'error' ? 'bg-red-100 text-red-800' :
                        log.level === 'warning' ? 'bg-yellow-100 text-yellow-800' :
                        log.level === 'info' ? 'bg-blue-100 text-blue-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {log.level.toUpperCase()}
                      </span>
                      <span className="text-xs text-gray-500">{log.timestamp}</span>
                    </div>
                    <p className="mt-2 font-medium">{log.message}</p>
                    {log.context && (
                      <p className="text-sm text-gray-600">Context: {log.context}</p>
                    )}
                    {log.component && (
                      <p className="text-sm text-gray-600">Component: {log.component}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6 bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">DevTools Commands</h2>
        <div className="bg-gray-100 p-4 rounded font-mono text-sm">
          <p><strong>Test Logger:</strong> window.debugUtils.testLogger()</p>
          <p><strong>Show Logs:</strong> window.errorLogger.getLogs()</p>
          <p><strong>Clear Logs:</strong> window.errorLogger.clearLogs()</p>
          <p><strong>Test Error:</strong> window.logError('Test Error')</p>
          <p><strong>Test Warning:</strong> window.logWarning('Test Warning')</p>
          <p><strong>Test Info:</strong> window.logInfo('Test Info')</p>
          <p><strong>Test Debug:</strong> window.logDebug('Test Debug')</p>
        </div>
        
        <div className="mt-4 p-4 bg-blue-50 rounded">
          <h3 className="font-semibold text-blue-800">System Info:</h3>
          <p className="text-sm text-blue-700">Frontend: http://localhost:8080</p>
          <p className="text-sm text-blue-700">Backend: http://localhost:8000</p>
          <p className="text-sm text-blue-700">Test URL: http://localhost:8080/error-logger-test</p>
        </div>
      </div>
    </div>
  );
};

export default ErrorLoggerTest; 