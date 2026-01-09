import React, { useEffect, useRef, useState } from 'react';
import { cn } from '../../utils/cn';

interface SimpleRichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: number;
  className?: string;
}

const COMMANDS: { label: string; command: string; icon?: string }[] = [
  { label: 'Bold', command: 'bold', icon: 'B' },
  { label: 'Italic', command: 'italic', icon: 'I' },
  { label: 'Underline', command: 'underline', icon: 'U' },
  { label: 'Link', command: 'createLink', icon: '🔗' },
  { label: 'List', command: 'insertUnorderedList', icon: '•' },
  { label: 'Numbered', command: 'insertOrderedList', icon: '1.' },
  { label: 'Clear', command: 'removeFormat', icon: '✕' },
];

const FONT_SIZES = [
  { label: '12px', value: '2' },
  { label: '14px', value: '3' },
  { label: '16px', value: '4' },
  { label: '20px', value: '5' },
  { label: '24px', value: '6' },
];

const BLOCK_TYPES = [
  { label: 'Paragraph', value: 'P' },
  { label: 'Heading 2', value: 'H2' },
  { label: 'Heading 3', value: 'H3' },
  { label: 'Quote', value: 'BLOCKQUOTE' },
];

export const SimpleRichTextEditor: React.FC<SimpleRichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Type HTML...',
  disabled = false,
  minHeight = 160,
  className,
}) => {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [fontSizeValue, setFontSizeValue] = useState('');
  const [textColor, setTextColor] = useState('#111827');

  const [isHtmlMode, setIsHtmlMode] = useState(false);
  // Keep local content state to sync between views
  const [content, setContent] = useState(value);

  useEffect(() => {
    setContent(value || '');
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      if (!isHtmlMode) {
        editorRef.current.innerHTML = value || '';
      }
    }
  }, [value, isHtmlMode]);

  const focusEditor = () => {
    if (!editorRef.current) return;
    editorRef.current.focus();
  };

  const handleCommand = (command: string) => {
    if (disabled || isHtmlMode) return;
    focusEditor();
    if (command === 'createLink') {
      const url = window.prompt('Enter URL');
      if (!url) {
        return;
      }
      document.execCommand(command, false, url);
    } else {
      document.execCommand(command, false);
    }
  };

  const handleInput = () => {
    if (!editorRef.current) return;
    const newContent = editorRef.current.innerHTML;
    setContent(newContent);
    onChange?.(newContent);
  };

  const handleHtmlChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange?.(newContent);
  };

  const toggleHtmlMode = () => {
    setIsHtmlMode(!isHtmlMode);
  };

  const applyFontSize = (size: string) => {
    if (disabled || isHtmlMode) return;
    setFontSizeValue(size);
    focusEditor();
    document.execCommand('fontSize', false, size);
  };

  const handleBlockChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const block = event.target.value;
    if (disabled || isHtmlMode) return;
    focusEditor();
    document.execCommand('formatBlock', false, block);
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const color = event.target.value;
    setTextColor(color);
    if (disabled || isHtmlMode) return;
    focusEditor();
    document.execCommand('foreColor', false, color);
  };

  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white shadow-sm', className)}>
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 px-3 py-2 text-xs font-medium text-gray-500">
        <div className="flex items-center gap-1">
          {COMMANDS.map(({ label, command, icon }) => (
            <button
              key={command}
              type="button"
              onClick={() => handleCommand(command)}
              disabled={disabled || isHtmlMode}
              className="rounded-md px-2 py-1 text-xs uppercase tracking-wide hover:bg-gray-100 disabled:opacity-40"
              title={label}
            >
              {icon ?? label[0]}
            </button>
          ))}
        </div>
        <div className="h-6 w-px bg-gray-200" />
        <select
          className="rounded-md border border-gray-200 bg-white px-2 py-1 text-xs text-gray-600 focus:border-primary-400 focus:outline-none disabled:opacity-50"
          onChange={handleBlockChange}
          disabled={disabled || isHtmlMode}
          defaultValue="P"
        >
          {BLOCK_TYPES.map((block) => (
            <option key={block.value} value={block.value}>
              {block.label}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-1 text-[11px] text-gray-500">
          <span>{'Size'}</span>
          <div className="flex items-center gap-1 rounded-md border border-gray-200 bg-white px-1 py-0.5">
            <button
              type="button"
              disabled={disabled || isHtmlMode}
              onClick={() => {
                setFontSizeValue('');
                focusEditor();
                document.execCommand('removeFormat', false);
              }}
              className={cn(
                'rounded px-2 py-1 text-[11px] uppercase tracking-wide disabled:opacity-50',
                fontSizeValue === '' ? 'bg-primary-50 text-primary-600 border border-primary-200' : 'text-gray-600 hover:bg-gray-100'
              )}
            >
              {'Auto'}
            </button>
            {FONT_SIZES.map((size) => (
              <button
                key={size.value}
                type="button"
                disabled={disabled || isHtmlMode}
                onClick={() => applyFontSize(size.value)}
                className={cn(
                  'rounded px-2 py-1 text-[11px] uppercase tracking-wide disabled:opacity-50',
                  fontSizeValue === size.value
                    ? 'bg-primary-50 text-primary-600 border border-primary-200'
                    : 'text-gray-600 hover:bg-gray-100'
                )}
              >
                {size.label}
              </button>
            ))}
          </div>
        </div>
        <label className="flex items-center gap-1 text-[11px] text-gray-500">
          <span>{'Color'}</span>
          <input
            type="color"
            value={textColor}
            onChange={handleColorChange}
            disabled={disabled || isHtmlMode}
            className="h-6 w-6 cursor-pointer rounded border border-gray-200 bg-white p-0 disabled:opacity-50"
          />
        </label>
        <div className="flex-1" />
        <button
          type="button"
          onClick={toggleHtmlMode}
          className={cn(
            "rounded-md px-2 py-1 text-xs font-semibold uppercase tracking-wide transition-colors",
            isHtmlMode ? "bg-primary-600 text-white" : "bg-gray-100 text-gray-700 hover:bg-gray-200"
          )}
        >
          {isHtmlMode ? 'Visual' : 'Code'}
        </button>
      </div>

      {isHtmlMode ? (
        <textarea
          value={content}
          onChange={handleHtmlChange}
          className="w-full resize-y border-0 bg-gray-50 p-4 font-mono text-xs text-gray-800 focus:ring-0 focus:outline-none rounded-b-xl"
          style={{ minHeight }}
          placeholder={placeholder}
          disabled={disabled}
        />
      ) : (
        <div
          ref={editorRef}
          contentEditable={!disabled}
          className={cn(
            'prose prose-sm max-w-none px-4 py-3 outline-none focus:ring-2 focus:ring-primary-200 rounded-b-xl',
            !content && !isFocused ? 'text-gray-400 before:content-[attr(data-placeholder)] before:pointer-events-none before:text-gray-400' : ''
          )}
          style={{ minHeight }}
          data-placeholder={placeholder}
          onInput={handleInput}
          onFocus={() => setIsFocused(true)}
          onBlur={() => {
            setIsFocused(false);
            handleInput();
          }}
          suppressContentEditableWarning
        />
      )}
    </div>
  );
};

export default SimpleRichTextEditor;
