import React, { useRef, useState, useEffect } from 'react';
import UnlayerEmailEditor, { EditorRef, EmailEditorProps as UnlayerEmailEditorProps } from 'react-email-editor';
import { Code2, Eye } from 'lucide-react';

interface EmailEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: string;
}

export const EmailEditor: React.FC<EmailEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter your email template...',
  disabled = false,
  className = '',
  minHeight = '400px'
}) => {
  const [isHtmlMode, setIsHtmlMode] = useState(true);
  const [htmlContent, setHtmlContent] = useState(value);
  const [isModeSwitching, setIsModeSwitching] = useState(false);
  const emailEditorRef = useRef<EditorRef>(null);
  const preventOnChangeRef = useRef(false);

  // Update content when value changes from outside
  useEffect(() => {
    if (preventOnChangeRef.current) return;
    setHtmlContent(value);
  }, [value]);

  const toggleMode = async () => {
    if (isModeSwitching) return;
    
    setIsModeSwitching(true);
    preventOnChangeRef.current = true;
    
    try {
      if (isHtmlMode) {
        // Switching from HTML to Visual mode
        if (emailEditorRef.current?.editor) {
          const design = convertHtmlToDesign(htmlContent);
          emailEditorRef.current.editor.loadDesign(design);
          setIsHtmlMode(false);
        }
      } else {
        // Switching from Visual to HTML mode
        if (emailEditorRef.current?.editor) {
          emailEditorRef.current.editor.exportHtml((data) => {
            const { html } = data;
            setHtmlContent(html);
            onChange?.(html);
            setIsHtmlMode(true);
          });
        }
      }
    } catch (error) {
      console.error('Error switching editor mode:', error);
    } finally {
      setTimeout(() => {
        preventOnChangeRef.current = false;
        setIsModeSwitching(false);
      }, 100);
    }
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    setHtmlContent(newValue);
    
    if (!isModeSwitching && !preventOnChangeRef.current) {
      onChange?.(newValue);
    }
  };

  const onDesignLoad = (data: any) => {
    console.log('Design loaded:', data);
  };

  const onLoad = (unlayer: any) => {
    console.log('Email editor loaded:', unlayer);
  };

  const onReady = (unlayer: any) => {
    console.log('Email editor ready');
    
    // Configure editor for better email template support
    unlayer.registerCallback('image', (file: any, done: any) => {
      const reader = new FileReader();
      reader.onload = (e: any) => {
        done({ url: e.target.result });
      };
      reader.readAsDataURL(file);
    });

    // Auto-export HTML when design changes
    unlayer.addEventListener('design:updated', (updates: any) => {
      if (!isHtmlMode && !preventOnChangeRef.current) {
        unlayer.exportHtml((data: any) => {
          const { html } = data;
          setHtmlContent(html);
          onChange?.(html);
        });
      }
    });
  };

  // Convert HTML to basic Unlayer design format
  const convertHtmlToDesign = (html: string) => {
    return {
      counters: {},
      body: {
        id: 'body',
        rows: [
          {
            id: 'row-1',
            cells: [1],
            columns: [
              {
                id: 'column-1',
                contents: [
                  {
                    id: 'text-1',
                    type: 'text',
                    values: {
                      containerPadding: '20px',
                      anchor: '',
                      fontSize: '14px',
                      color: '#000000',
                      lineHeight: '150%',
                      linkColor: '#0066cc',
                      fontFamily: {
                        label: 'Arial',
                        value: 'arial,helvetica,sans-serif'
                      },
                      text: html || '<p>Your email content here...</p>'
                    }
                  }
                ],
                values: {}
              }
            ],
            values: {}
          }
        ],
        headers: [],
        footers: [],
        values: {
          backgroundColor: '#ffffff',
          backgroundImage: {
            url: '',
            fullWidth: true,
            repeat: false,
            center: true,
            cover: false
          },
          contentWidth: '600px',
          contentAlign: 'center',
          fontFamily: {
            label: 'Arial',
            value: 'arial,helvetica,sans-serif'
          },
          preheaderText: '',
          linkColor: '#0066cc'
        }
      }
    };
  };

  const editorOptions: UnlayerEmailEditorProps['options'] = {
    appearance: {
      theme: 'light',
      panels: {
        tools: {
          dock: 'left'
        }
      }
    },
    features: {
      preview: true,
      imageEditor: true,
      undoRedo: true,
      stockImages: false
    },
    tools: {
      text: { enabled: true },
      button: { enabled: true },
      image: { enabled: true },
      divider: { enabled: true },
      spacer: { enabled: true },
      html: { enabled: true },
      video: { enabled: false },
      social: { enabled: true },
      menu: { enabled: false },
      timer: { enabled: false },
      form: { enabled: false }
    },
    editor: {
      minRows: 1,
      maxRows: 0
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800">
      {/* Mode indicator */}
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs font-medium ${
            isHtmlMode 
              ? 'bg-orange-100 text-orange-700 dark:bg-orange-900 dark:text-orange-300'
              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
          }`}>
            {isHtmlMode ? (
              <>
                <Code2 className="w-3 h-3" />
                HTML Source
              </>
            ) : (
              <>
                <Eye className="w-3 h-3" />
                Visual Editor
              </>
            )}
          </div>
        </div>
        <button
          onClick={toggleMode}
          disabled={isModeSwitching || disabled}
          className={`
            px-3 py-1 text-xs font-medium rounded transition-colors
            ${isModeSwitching || disabled
              ? 'opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-500'
              : 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300'
            }
          `}
        >
          {isModeSwitching ? (
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 border border-gray-400 border-t-transparent rounded-full animate-spin" />
              Switching...
            </div>
          ) : (
            `Switch to ${isHtmlMode ? 'Visual' : 'HTML'}`
          )}
        </button>
      </div>

      {/* Editor Content */}
      <div className="bg-white dark:bg-gray-800" style={{ minHeight }}>
        {isHtmlMode ? (
          <div className="relative">
            <textarea
              value={htmlContent}
              onChange={handleHtmlChange}
              placeholder={placeholder}
              disabled={disabled}
              className={`
                w-full p-3 border-0 resize-none focus:outline-none
                bg-white dark:bg-gray-800
                text-gray-900 dark:text-gray-100
                font-mono text-sm leading-relaxed
                ${className}
              `}
              style={{ minHeight }}
              spellCheck={false}
            />
            <div className="absolute top-2 right-2 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500 dark:text-gray-400 pointer-events-none">
              {htmlContent.split('\n').length} lines
            </div>
          </div>
        ) : (
          <div style={{ minHeight }}>
            <UnlayerEmailEditor
              ref={emailEditorRef}
              onLoad={onLoad}
              onReady={onReady}
              options={editorOptions}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailEditor;