import React, { useState, useRef, useEffect } from 'react';
import { Editor } from '@tinymce/tinymce-react';
import { Code2, Eye } from 'lucide-react';

// Declare global tinymce
declare global {
  interface Window {
    tinymce: any;
  }
}

// Set TinyMCE to use GPL license to avoid cloud license check
if (typeof window !== 'undefined') {
  (window as any).tinymce_license_key = 'gpl';
}

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  minHeight?: string;
}

export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = 'Enter your content...',
  disabled = false,
  className = '',
  minHeight = '400px'
}) => {
  const [isHtmlMode, setIsHtmlMode] = useState(false);
  const [content, setContent] = useState(value);
  const editorRef = useRef<any>(null);

  // Update content when value prop changes
  useEffect(() => {
    setContent(value);
    if (!isHtmlMode && editorRef.current) {
      editorRef.current.setContent(value);
    }
  }, [value, isHtmlMode]);

  const toggleMode = () => {
    if (isHtmlMode) {
      // Switching from HTML to Visual mode
      setIsHtmlMode(false);
      if (editorRef.current) {
        editorRef.current.setContent(content);
      }
    } else {
      // Switching from Visual to HTML mode
      if (editorRef.current) {
        const editorContent = editorRef.current.getContent();
        setContent(editorContent);
      }
      setIsHtmlMode(true);
    }
  };

  const handleEditorChange = (newContent: string) => {
    setContent(newContent);
    onChange?.(newContent);
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    onChange?.(newContent);
  };

  // Self-hosted TinyMCE configuration
  const editorConfig = {
    height: minHeight,
    
    // Self-hosted configuration - all paths point to local files
    base_url: '/tinymce',  // Base URL for TinyMCE resources
    suffix: '.min',        // Use minified versions
    
    // Explicitly set paths for self-hosted resources
    skin_url: '/tinymce/skins/ui/oxide',
    content_css: '/tinymce/skins/content/default/content.min.css',
    
    // Disable any cloud features
    cloud_image_cors_hosts: [],
    images_upload_handler: undefined,
    automatic_uploads: false,
    
    // UI Configuration
    skin: 'oxide',
    menubar: 'file edit view insert format tools table help',
    branding: false,
    statusbar: true,
    resize: true,
    placeholder,

    // Enhanced plugins for comprehensive rich text editing
    plugins: [
      'advlist', 'autolink', 'lists', 'link', 'image', 'charmap', 'preview',
      'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
      'insertdatetime', 'media', 'table', 'help', 'wordcount', 'quickbars',
      'codesample', 'emoticons', 'importcss', 'autoresize'
    ],

    // Enhanced toolbar with more options
    toolbar1: 'undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | alignleft aligncenter alignright alignjustify',
    toolbar2: 'outdent indent | numlist bullist | forecolor backcolor | link image media table | codesample emoticons charmap | fullscreen preview code help',
    
    // Menu configuration
    menu: {
      file: { title: 'File', items: 'newdocument | preview | export print' },
      edit: { title: 'Edit', items: 'undo redo | cut copy paste | selectall | searchreplace' },
      view: { title: 'View', items: 'code | visualaid visualchars visualblocks | preview fullscreen' },
      insert: { title: 'Insert', items: 'image link media template codesample inserttable | charmap emoticons hr | pagebreak nonbreaking anchor' },
      format: { title: 'Format', items: 'bold italic underline strikethrough superscript subscript codeformat | formats blockformats fontformats fontsizes align lineheight | forecolor backcolor | removeformat' },
      tools: { title: 'Tools', items: 'spellchecker spellcheckerlanguage | wordcount' },
      table: { title: 'Table', items: 'inserttable | cell row column | tableprops deletetable' },
      help: { title: 'Help', items: 'help' }
    },

    // Block and font formats
    block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4; Heading 5=h5; Heading 6=h6; Preformatted=pre; Blockquote=blockquote; Div=div',
    font_family_formats: 'Arial=arial,helvetica,sans-serif; Courier New=courier new,courier,monospace; Georgia=georgia,palatino,serif; Helvetica=helvetica; Impact=impact,chicago; Tahoma=tahoma,arial,helvetica,sans-serif; Times New Roman=times new roman,times,serif; Verdana=verdana,geneva,sans-serif',
    font_size_formats: '8px 10px 12px 14px 16px 18px 20px 24px 28px 32px 36px 48px 60px 72px 96px',

    // Content handling - preserve all HTML and CSS
    valid_elements: '*[*]',
    extended_valid_elements: '*[*]',
    invalid_elements: '',
    verify_html: false,
    cleanup: false,
    convert_urls: false,
    relative_urls: false,
    remove_script_host: false,
    entity_encoding: 'raw' as const,
    
    // Allow all attributes and styles
    allow_html_data_urls: true,
    allow_conditional_comments: true,
    allow_unsafe_link_target: true,
    custom_elements: '*',
    
    // Advanced content handling
    paste_data_images: true,
    paste_webkit_styles: 'all',
    paste_retain_style_properties: 'all',
    paste_merge_formats: true,
    smart_paste: true,
    
    // Image handling
    image_advtab: true,
    image_caption: true,
    image_title: true,
    
    // Table options
    table_default_attributes: {
      border: '1'
    },
    table_default_styles: {
      'border-collapse': 'collapse',
      width: '100%'
    },
    table_responsive_width: true,
    table_resize_bars: true,
    
    // Link options
    link_assume_external_targets: true,
    link_context_toolbar: true,
    
    // Auto-resize
    autoresize_max_height: 800,
    autoresize_min_height: parseInt(minHeight),
    
    // Quick toolbar
    quickbars_selection_toolbar: 'bold italic | quicklink h2 h3 blockquote quickimage quicktable',
    quickbars_insert_toolbar: 'quickimage quicktable | hr',
    
    // Setup function with enhanced initialization
    setup: (editor: any) => {
      editor.on('init', () => {
        console.log('Self-hosted TinyMCE editor initialized successfully');
        if (content) {
          editor.setContent(content);
        }
        
        // Add custom styles for better dark mode support
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
          editor.dom.addClass(editor.getBody(), 'dark-mode');
        }
      });

      // Preserve HTML comments and other special content
      editor.on('BeforeSetContent', (e: any) => {
        if (e.content && typeof e.content === 'string') {
          // Preserve HTML comments
          e.content = e.content.replace(/<!--[\s\S]*?-->/g, (match) => {
            return match;
          });
        }
      });
      
      // Add custom button for email template variables
      editor.ui.registry.addButton('templatevars', {
        text: 'Variables',
        tooltip: 'Insert template variables',
        onAction: () => {
          editor.insertContent('<span class="template-var">{{variable_name}}</span>');
        }
      });
      
      // Handle paste events to maintain formatting
      editor.on('paste', (e: any) => {
        // Allow rich paste by default, but clean up if needed
        setTimeout(() => {
          const content = editor.getContent();
          // Clean up any problematic elements while preserving structure
          const cleanContent = content.replace(/<o:p[^>]*>|<\/o:p>/g, ''); // Remove Outlook-specific tags
          if (content !== cleanContent) {
            editor.setContent(cleanContent);
          }
        }, 10);
      });
    },

    // Content styles for better appearance
    content_style: `
      body { 
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif; 
        font-size: 14px; 
        line-height: 1.6;
        color: #333;
        margin: 1rem;
      }
      .template-var {
        background-color: #e3f2fd;
        color: #1976d2;
        padding: 2px 6px;
        border-radius: 4px;
        font-weight: 500;
        border: 1px solid #bbdefb;
      }
      .dark-mode body {
        background-color: #1f2937;
        color: #f9fafb;
      }
      .dark-mode .template-var {
        background-color: #1e3a8a;
        color: #93c5fd;
        border-color: #3b82f6;
      }
      blockquote {
        border-left: 4px solid #e5e7eb;
        margin: 1rem 0;
        padding: 0.5rem 1rem;
        background-color: #f9fafb;
      }
      code {
        background-color: #f3f4f6;
        color: #374151;
        padding: 0.125rem 0.25rem;
        border-radius: 0.25rem;
        font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
      }
      pre {
        background-color: #1f2937;
        color: #f9fafb;
        padding: 1rem;
        border-radius: 0.5rem;
        overflow-x: auto;
      }
      pre code {
        background-color: transparent;
        color: inherit;
        padding: 0;
      }
    `
  };

  return (
    <div className={`border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden bg-white dark:bg-gray-800 ${className}`}>
      {/* Header with mode toggle */}
      <div className="px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center gap-3">
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
          
          <div className="text-xs text-gray-500 dark:text-gray-400 hidden sm:block">
            {isHtmlMode ? 'Edit raw HTML code' : 'Rich text editing with formatting tools'}
          </div>
        </div>

        <div className="flex items-center gap-2">
          {!isHtmlMode && (
            <div className="text-xs text-gray-500 dark:text-gray-400 hidden md:block">
              Self-hosted TinyMCE
            </div>
          )}
          
          <button
            type="button"
            onClick={toggleMode}
            disabled={disabled}
            className={`px-3 py-1 text-xs font-medium rounded transition-colors ${
              disabled
                ? 'opacity-50 cursor-not-allowed bg-gray-200 dark:bg-gray-700 text-gray-500'
                : 'bg-blue-100 hover:bg-blue-200 text-blue-700 dark:bg-blue-900 dark:hover:bg-blue-800 dark:text-blue-300'
            }`}
          >
            Switch to {isHtmlMode ? 'Visual' : 'HTML'}
          </button>
        </div>
      </div>

      {/* Editor content */}
      <div className="bg-white dark:bg-gray-800">
        {isHtmlMode ? (
          <div className="relative">
            <textarea
              value={content}
              onChange={handleTextareaChange}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full p-4 border-0 resize-none focus:outline-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-mono text-sm leading-relaxed"
              style={{ minHeight }}
              spellCheck={false}
              wrap="soft"
            />
            <div className="absolute top-3 right-3 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-500 dark:text-gray-400 pointer-events-none">
              {content.split('\n').length} lines • {content.length} chars
            </div>
          </div>
        ) : (
          <div className="tinymce-container">
            <Editor
              // KEY: Load TinyMCE from local self-hosted files
              tinymceScriptSrc="/tinymce/tinymce.min.js"
              licenseKey="gpl"
              onInit={(evt, editor) => {
                editorRef.current = editor;
                console.log('Self-hosted TinyMCE React Editor initialized');
              }}
              value={content}
              init={editorConfig}
              onEditorChange={handleEditorChange}
              disabled={disabled}
            />
          </div>
        )}
      </div>
      
      {/* Status bar for additional info */}
      {!isHtmlMode && (
        <div className="px-3 py-1 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span>Self-hosted • No external dependencies</span>
            {content.length > 0 && (
              <span>{content.length} characters</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300 rounded text-xs">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
              Local
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default RichTextEditor;