import MonacoEditor from '@monaco-editor/react';

const CodeEditor = () => {
    return (
        <MonacoEditor theme='dark' language='javascript' height={500} options={{
            wordWrap: 'on',
            minimap: { enabled: false },
            showUnused: false,
            folding: false,
            lineNumbersMinChars: 3,
            scrollBeyondLastLine: false,
            automaticLayout: true
        }} />
    );
}

export default CodeEditor;