import React, { useState, useMemo } from 'react';
import { Editor } from '@monaco-editor/react';
import { FileText, Play, Folder, Settings, AlertCircle } from 'lucide-react';

// Threads Parser Class
class ThreadsParser {
  constructor() {
    this.elementMap = {
      'section': 'section', 'div': 'div', 'h1': 'h1', 'h2': 'h2', 'h3': 'h3', 'h4': 'h4', 'h5': 'h5', 'h6': 'h6',
      'p': 'p', 'span': 'span', 'button': 'button', 'input': 'input', 'img': 'img', 'a': 'a', 'ul': 'ul', 'ol': 'ol',
      'li': 'li', 'nav': 'nav', 'header': 'header', 'footer': 'footer', 'main': 'main', 'article': 'article', 'aside': 'aside'
    };
  }

  parse(threadsCode) {
    try {
      if (!threadsCode || typeof threadsCode !== 'string') return [];
      
      const lines = threadsCode.split('\n').filter(line => line.trim());
      const result = [];
      const stack = [];

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const indent = this.getIndentLevel(line);
        const trimmed = line.trim();

        if (!trimmed || trimmed.startsWith('//')) continue;

        while (stack.length > 0 && stack[stack.length - 1].indent >= indent) {
          stack.pop();
        }

        const element = this.parseLine(trimmed);
        element.indent = indent;
        element.children = [];

        if (stack.length === 0) {
          result.push(element);
        } else {
          stack[stack.length - 1].element.children.push(element);
        }

        stack.push({ element, indent });
      }

      return result;
    } catch (error) {
      return [{
        type: 'div',
        classes: ['text-red-500', 'p-4', 'border', 'border-red-300', 'bg-red-50', 'rounded'],
        content: `Parser Error: ${error.message}`,
        children: []
      }];
    }
  }

  getIndentLevel(line) {
    let indent = 0;
    for (let char of line) {
      if (char === ' ') indent += 1;
      else if (char === '\t') indent += 2;
      else break;
    }
    return indent;
  }

  parseLine(line) {
    if (!this.startsWithElement(line)) {
      return { type: 'text', content: line, classes: [], children: [] };
    }

    const parts = line.split(' ');
    const elementPart = parts[0];
    const content = parts.slice(1).join(' ');
    const { element, classes, id } = this.parseElementAndClasses(elementPart);

    return { type: element, classes: classes, id: id, content: content, children: [] };
  }

  startsWithElement(line) {
    const firstWord = line.split(' ')[0].split('.')[0];
    return this.elementMap.hasOwnProperty(firstWord) || firstWord.startsWith('.');
  }

  parseElementAndClasses(elementString) {
    const parts = elementString.split('.');
    let element = 'div';
    let classes = [];
    let id = null;

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];
      if (i === 0 && part && this.elementMap.hasOwnProperty(part)) {
        element = part;
      } else if (part.startsWith('#')) {
        id = part.substring(1);
      } else if (part) {
        classes.push(part);
      }
    }

    return { element, classes, id };
  }
}

// Threads Renderer Component
const ThreadsRenderer = ({ layoutData }) => {
  if (!layoutData || !Array.isArray(layoutData)) {
    return (
      <div className="p-4 text-gray-500 text-center">
        <AlertCircle className="h-8 w-8 mx-auto mb-2" />
        <p>No layout data to render</p>
      </div>
    );
  }

  const renderElement = (element, index) => {
    if (element.type === 'text') {
      return <span key={index}>{element.content}</span>;
    }

    const Component = element.type;
    const props = {
      key: index,
      className: element.classes.join(' '),
    };

    if (element.id) props.id = element.id;

    if (['img', 'input', 'hr', 'br'].includes(element.type)) {
      return <Component {...props} />;
    }

    return (
      <Component {...props}>
        {element.content && <span>{element.content}</span>}
        {element.children && element.children.map((child, childIndex) => 
          renderElement(child, `${index}-${childIndex}`)
        )}
      </Component>
    );
  };

  return (
    <div className="threads-rendered-content">
      {layoutData.map((element, index) => renderElement(element, index))}
    </div>
  );
};

// Monaco Editor Component
const LoomEditor = ({ value, onChange }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 text-white px-4 py-2 text-sm font-medium border-b border-gray-700">
        Loom Editor - Threads
      </div>
      <Editor
        height="100%"
        defaultLanguage="plaintext"
        value={value}
        onChange={(value) => onChange(value || '')}
        theme="vs-dark"
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          wordWrap: 'on',
          automaticLayout: true,
          scrollBeyondLastLine: false,
          padding: { top: 16, bottom: 16 }
        }}
      />
    </div>
  );
};

// Preview Component with Live Rendering
const WarpPreview = ({ content, parsedLayout }) => {
  return (
    <div className="h-full flex flex-col">
      <div className="bg-gray-100 border-b border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 flex items-center justify-between">
        <span>Warp Preview</span>
        <span className="text-xs text-gray-500">
          {parsedLayout.length} element{parsedLayout.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="flex-1 bg-white overflow-auto">
        {parsedLayout.length > 0 ? (
          <div className="p-6">
            <ThreadsRenderer layoutData={parsedLayout} />
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Play className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Live Preview</h3>
              <p className="text-gray-500">Start typing Threads syntax to see your layout</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Sidebar Component
const Sidebar = () => {
  return (
    <div className="w-60 bg-gray-900 text-white flex flex-col">
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white">Spindle</h2>
        <p className="text-xs text-gray-400 mt-1">Layout Builder</p>
      </div>
      
      <div className="flex-1 p-4">
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
            <Folder className="h-4 w-4 mr-2" />
            Bobbin Projects
          </h3>
          <div className="text-sm text-gray-500 italic">
            No projects yet
          </div>
        </div>
        
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-300 mb-3 flex items-center">
            <FileText className="h-4 w-4 mr-2" />
            Fiber Library
          </h3>
          <div className="text-sm text-gray-500 italic">
            Components coming soon...
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t border-gray-700">
        <button className="w-full flex items-center justify-center px-3 py-2 bg-blue-600 hover:bg-blue-700 rounded-md text-sm font-medium transition-colors">
          <Settings className="h-4 w-4 mr-2" />
          New Project
        </button>
      </div>
    </div>
  );
};

// Header Component
const Header = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-3">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Spindle</h1>
          <p className="text-sm text-gray-500">Web-based Layout Builder</p>
        </div>
        <div className="flex items-center space-x-3">
          <button className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors">
            Save
          </button>
          <button className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors">
            Export
          </button>
        </div>
      </div>
    </header>
  );
};

// Main App Component
const App = () => {
  const [editorContent, setEditorContent] = useState(
    `section.bg-white.p-6.text-center
  h1.text-3xl.font-bold Hello, Layout Editor!
  p.text-gray-600 Start typing your layout here...
  
  .mt-8.grid.grid-cols-2.gap-4
    .bg-blue-50.p-4.rounded-lg
      h3.font-semibold Welcome to Spindle
      p.text-sm.text-gray-600 Build layouts with Threads syntax
    
    .bg-green-50.p-4.rounded-lg
      h3.font-semibold Live Preview
      p.text-sm.text-gray-600 See your changes in real-time`
  );

  // Initialize parser
  const parser = useMemo(() => new ThreadsParser(), []);
  
  // Parse layout in real-time
  const parsedLayout = useMemo(() => {
    return parser.parse(editorContent);
  }, [editorContent, parser]);

  const handleEditorChange = (value) => {
    setEditorContent(value);
  };

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      <Header />
      
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        
        <div className="flex-1 flex">
          {/* Editor Panel */}
          <div className="flex-1 border-r border-gray-200">
            <LoomEditor 
              value={editorContent} 
              onChange={handleEditorChange} 
            />
          </div>
          
          {/* Preview Panel */}
          <div className="flex-1">
            <WarpPreview 
              content={editorContent} 
              parsedLayout={parsedLayout}
            />
          </div>
        </div>
      </div>
      
      {/* Status Bar */}
      <div className="bg-gray-800 text-white px-4 py-1 text-xs flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <span>Ready</span>
          <span className="text-gray-400">|</span>
          <span>Threads Syntax</span>
          <span className="text-gray-400">|</span>
          <span className="text-green-400">{parsedLayout.length} elements parsed</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-gray-400">Lines: {editorContent.split('\n').length}</span>
          <span className="text-gray-400">Chars: {editorContent.length}</span>
        </div>
      </div>
    </div>
  );
};

export default App;