'use client';

import React, { useState, useRef } from 'react';
import { cn } from '@/lib/utils';

interface Cell {
  value: string;
  formula?: string;
}

interface SpreadsheetAppProps {
  className?: string;
}

export const SpreadsheetApp: React.FC<SpreadsheetAppProps> = ({ className }) => {
  const [cells, setCells] = useState<Record<string, Cell>>({});
  const [selectedCell, setSelectedCell] = useState<string | null>(null);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [formulaBar, setFormulaBar] = useState('');
  
  const rows = 20;
  const cols = 10;
  
  const getCellId = (row: number, col: number): string => {
    return `${String.fromCharCode(65 + col)}${row + 1}`;
  };
  
  const getCellValue = (cellId: string): string => {
    const cell = cells[cellId];
    if (!cell) return '';
    
    if (cell.formula && cell.formula.startsWith('=')) {
      // Simple formula evaluation (just for demo)
      try {
        if (cell.formula.toUpperCase().startsWith('=SUM(')) {
          // Basic SUM implementation
          const range = cell.formula.match(/\((.*?)\)/)?.[1];
          if (range) {
            const [start, end] = range.split(':');
            // This is a simplified implementation
            return 'SUM';
          }
        }
        // Basic arithmetic
        const formula = cell.formula.substring(1);
        // In a real app, you'd use a proper formula parser
        return eval(formula).toString();
      } catch {
        return '#ERROR';
      }
    }
    
    return cell.value;
  };
  
  const handleCellClick = (cellId: string) => {
    if (editingCell && editingCell !== cellId) {
      handleCellBlur();
    }
    setSelectedCell(cellId);
    const cell = cells[cellId];
    setFormulaBar(cell?.formula || cell?.value || '');
  };
  
  const handleCellDoubleClick = (cellId: string) => {
    setEditingCell(cellId);
    const cell = cells[cellId];
    setFormulaBar(cell?.formula || cell?.value || '');
  };
  
  const handleCellChange = (cellId: string, value: string) => {
    setCells(prev => ({
      ...prev,
      [cellId]: {
        value: value,
        formula: value.startsWith('=') ? value : undefined
      }
    }));
  };
  
  const handleCellBlur = () => {
    if (editingCell) {
      handleCellChange(editingCell, formulaBar);
      setEditingCell(null);
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent, cellId: string) => {
    if (e.key === 'Enter') {
      handleCellBlur();
      // Move to next row
      const match = cellId.match(/([A-Z])(\d+)/);
      if (match) {
        const col = match[1];
        const row = parseInt(match[2]);
        if (row < rows) {
          const nextCell = `${col}${row + 1}`;
          setSelectedCell(nextCell);
        }
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      handleCellBlur();
      // Move to next column
      const match = cellId.match(/([A-Z])(\d+)/);
      if (match) {
        const col = match[1].charCodeAt(0) - 65;
        const row = parseInt(match[2]) - 1;
        if (col < cols - 1) {
          const nextCell = getCellId(row, col + 1);
          setSelectedCell(nextCell);
        }
      }
    }
  };
  
  return (
    <div className={cn('h-full flex flex-col bg-white', className)}>
      {/* Toolbar */}
      <div className='border-b border-gray-300 p-2 bg-gray-50'>
        <div className='flex items-center gap-2'>
          <span className='text-sm font-medium px-2'>{selectedCell || 'A1'}</span>
          <input
            type='text'
            value={formulaBar}
            onChange={(e) => setFormulaBar(e.target.value)}
            onBlur={handleCellBlur}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && selectedCell) {
                handleCellChange(selectedCell, formulaBar);
                handleCellBlur();
              }
            }}
            className='flex-1 px-2 py-1 border border-gray-300 rounded text-sm'
            placeholder='Enter value or formula (e.g., =A1+B1)'
          />
        </div>
      </div>
      
      {/* Spreadsheet Grid */}
      <div className='flex-1 overflow-auto'>
        <table className='border-collapse'>
          <thead>
            <tr>
              <th className='sticky top-0 left-0 z-20 bg-gray-100 border border-gray-300 w-12 h-8 text-xs font-medium'></th>
              {Array.from({ length: cols }, (_, i) => (
                <th
                  key={i}
                  className='sticky top-0 z-10 bg-gray-100 border border-gray-300 w-24 h-8 text-xs font-medium'
                >
                  {String.fromCharCode(65 + i)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {Array.from({ length: rows }, (_, rowIndex) => (
              <tr key={rowIndex}>
                <td className='sticky left-0 z-10 bg-gray-100 border border-gray-300 w-12 h-8 text-xs font-medium text-center'>
                  {rowIndex + 1}
                </td>
                {Array.from({ length: cols }, (_, colIndex) => {
                  const cellId = getCellId(rowIndex, colIndex);
                  const isSelected = selectedCell === cellId;
                  const isEditing = editingCell === cellId;
                  
                  return (
                    <td
                      key={cellId}
                      data-cell-id={cellId}
                      className={cn(
                        'border border-gray-300 w-24 h-8 p-0 relative',
                        isSelected && 'ring-2 ring-blue-500'
                      )}
                      onClick={() => handleCellClick(cellId)}
                      onDoubleClick={() => handleCellDoubleClick(cellId)}
                    >
                      {isEditing ? (
                        <input
                          type='text'
                          value={formulaBar}
                          onChange={(e) => setFormulaBar(e.target.value)}
                          onBlur={handleCellBlur}
                          onKeyDown={(e) => handleKeyDown(e, cellId)}
                          className='w-full h-full px-1 text-sm outline-none'
                          autoFocus
                        />
                      ) : (
                        <div className='w-full h-full px-1 text-sm truncate flex items-center'>
                          {getCellValue(cellId)}
                        </div>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Status Bar */}
      <div className='border-t border-gray-300 px-4 py-1 text-xs text-gray-600 bg-gray-50 flex justify-between'>
        <span>Ready</span>
        <span>{Object.keys(cells).length} cells with data</span>
      </div>
    </div>
  );
};