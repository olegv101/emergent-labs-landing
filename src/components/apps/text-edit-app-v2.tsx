'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, AlignJustify, List, ListOrdered } from 'lucide-react';
import { useTextEditState } from '@/lib/use-app-state';

interface TextEditAppProps {
  className?: string;
}

type TextAlign = 'left' | 'center' | 'right' | 'justify';

export const TextEditApp: React.FC<TextEditAppProps> = ({ className }) => {
  const { documents, activeDocumentId, updateDocument } = useTextEditState();
  const activeDocument = documents[activeDocumentId];
  
  const [isBold, setIsBold] = React.useState(false);
  const [isItalic, setIsItalic] = React.useState(false);
  const [isUnderline, setIsUnderline] = React.useState(false);
  const [textAlign, setTextAlign] = React.useState<TextAlign>('left');
  const [fontSize, setFontSize] = React.useState('16');
  const [fontFamily, setFontFamily] = React.useState('Arial');
  
  const editorRef = React.useRef<HTMLDivElement>(null);

  const execCommand = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleFormat = (format: string) => {
    execCommand(format);
    
    switch(format) {
      case 'bold':
        setIsBold(!isBold);
        break;
      case 'italic':
        setIsItalic(!isItalic);
        break;
      case 'underline':
        setIsUnderline(!isUnderline);
        break;
    }
  };

  const handleAlign = (align: TextAlign) => {
    let command = '';
    switch(align) {
      case 'left':
        command = 'justifyLeft';
        break;
      case 'center':
        command = 'justifyCenter';
        break;
      case 'right':
        command = 'justifyRight';
        break;
      case 'justify':
        command = 'justifyFull';
        break;
    }
    execCommand(command);
    setTextAlign(align);
  };
  
  // Sync content with store
  const handleContentChange = () => {
    if (editorRef.current) {
      updateDocument(activeDocumentId, editorRef.current.innerHTML);
    }
  };

  return (
    <div className={cn('h-full flex flex-col bg-white', className)}>
      {/* Toolbar */}
      <div className='border-b border-gray-300 p-2 flex items-center gap-2 flex-wrap bg-gray-50'>
        {/* Font Controls */}
        <select
          value={fontFamily}
          onChange={(e) => {
            setFontFamily(e.target.value);
            execCommand('fontName', e.target.value);
          }}
          className='px-2 py-1 border border-gray-300 rounded text-sm'
        >
          <option value='Arial'>Arial</option>
          <option value='Times New Roman'>Times New Roman</option>
          <option value='Georgia'>Georgia</option>
          <option value='Courier New'>Courier New</option>
          <option value='Verdana'>Verdana</option>
        </select>
        
        <select
          value={fontSize}
          onChange={(e) => {
            setFontSize(e.target.value);
            execCommand('fontSize', '3'); // Simplified size mapping
          }}
          className='px-2 py-1 border border-gray-300 rounded text-sm'
        >
          <option value='12'>12</option>
          <option value='14'>14</option>
          <option value='16'>16</option>
          <option value='18'>18</option>
          <option value='24'>24</option>
          <option value='36'>36</option>
        </select>

        <div className='w-px h-6 bg-gray-300'></div>

        {/* Format Buttons */}
        <button
          onClick={() => handleFormat('bold')}
          data-format-bold
          className={cn(
            'p-1.5 rounded hover:bg-gray-200',
            isBold && 'bg-gray-200'
          )}
          title='Bold'
        >
          <Bold className='w-4 h-4' />
        </button>
        
        <button
          onClick={() => handleFormat('italic')}
          className={cn(
            'p-1.5 rounded hover:bg-gray-200',
            isItalic && 'bg-gray-200'
          )}
          title='Italic'
        >
          <Italic className='w-4 h-4' />
        </button>
        
        <button
          onClick={() => handleFormat('underline')}
          className={cn(
            'p-1.5 rounded hover:bg-gray-200',
            isUnderline && 'bg-gray-200'
          )}
          title='Underline'
        >
          <Underline className='w-4 h-4' />
        </button>

        <div className='w-px h-6 bg-gray-300'></div>

        {/* Alignment Buttons */}
        <button
          onClick={() => handleAlign('left')}
          className={cn(
            'p-1.5 rounded hover:bg-gray-200',
            textAlign === 'left' && 'bg-gray-200'
          )}
          title='Align left'
        >
          <AlignLeft className='w-4 h-4' />
        </button>
        
        <button
          onClick={() => handleAlign('center')}
          className={cn(
            'p-1.5 rounded hover:bg-gray-200',
            textAlign === 'center' && 'bg-gray-200'
          )}
          title='Align center'
        >
          <AlignCenter className='w-4 h-4' />
        </button>
        
        <button
          onClick={() => handleAlign('right')}
          className={cn(
            'p-1.5 rounded hover:bg-gray-200',
            textAlign === 'right' && 'bg-gray-200'
          )}
          title='Align right'
        >
          <AlignRight className='w-4 h-4' />
        </button>
        
        <button
          onClick={() => handleAlign('justify')}
          className={cn(
            'p-1.5 rounded hover:bg-gray-200',
            textAlign === 'justify' && 'bg-gray-200'
          )}
          title='Justify'
        >
          <AlignJustify className='w-4 h-4' />
        </button>

        <div className='w-px h-6 bg-gray-300'></div>

        {/* List Buttons */}
        <button
          onClick={() => execCommand('insertUnorderedList')}
          className='p-1.5 rounded hover:bg-gray-200'
          title='Bullet list'
        >
          <List className='w-4 h-4' />
        </button>
        
        <button
          onClick={() => execCommand('insertOrderedList')}
          className='p-1.5 rounded hover:bg-gray-200'
          title='Numbered list'
        >
          <ListOrdered className='w-4 h-4' />
        </button>
      </div>

      {/* Editor */}
      <div className='flex-1 overflow-auto'>
        <div
          ref={editorRef}
          contentEditable
          className='min-h-full p-8 focus:outline-none'
          style={{
            fontFamily: fontFamily,
            fontSize: fontSize + 'px',
            textAlign: textAlign
          }}
          onInput={handleContentChange}
          dangerouslySetInnerHTML={{ __html: activeDocument?.content || '' }}
        />
      </div>
      
      {/* Status Bar */}
      <div className='border-t border-gray-300 px-4 py-1 text-xs text-gray-600 bg-gray-50 flex justify-between'>
        <span>{activeDocument?.content ? activeDocument.content.replace(/<[^>]*>/g, '').length + ' characters' : '0 characters'}</span>
        <span>UTF-8</span>
      </div>
    </div>
  );
};