import React from 'react';
import MonacoEditor, { OnChange } from '@monaco-editor/react';

interface JsonEditorProps {
    value: string;
    onChange: (value: string) => void;
    error?: string;
    height?: string;
    placeholder?: string;
    readOnly?: boolean;
}

export const JsonEditor: React.FC<JsonEditorProps> = ({
    value,
    onChange,
    error,
    height = '300px',
    readOnly = false
}) => {
    const handleEditorChange: OnChange = (newValue) => {
        onChange(newValue || '');
    };

    // Cast to any to resolve React 19 type incompatibility
    const Editor = MonacoEditor as any;

    return (
        <div className={`rounded-lg border ${error ? 'border-red-500' : 'border-neutral-200'} overflow-hidden focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 transition-colors bg-white`}>
            <div className="py-2">
                <Editor
                    height={height}
                    defaultLanguage="json"
                    value={value}
                    onChange={handleEditorChange}
                    theme="light"
                    options={{
                        minimap: { enabled: false },
                        scrollBeyondLastLine: false,
                        fontSize: 13,
                        tabSize: 2,
                        wordWrap: 'on',
                        readOnly,
                        formatOnPaste: true,
                        formatOnType: true,
                        lineNumbers: 'on',
                        renderLineHighlight: 'all',
                        padding: { top: 8, bottom: 8 },
                        overviewRulerBorder: false,
                        folding: true,
                    }}
                />
            </div>
            {error && (
                <div className="border-t border-red-100 bg-red-50 px-3 py-2">
                    <p className="text-xs font-medium text-red-600">{error}</p>
                </div>
            )}
        </div>
    );
};
