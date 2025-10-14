import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Button } from 'flowbite-react';
import { useEmulatorStore } from '../../store/emulatorStore';
import './MemoryView.css';

export const MemoryView: React.FC = () => {
  const { state } = useEmulatorStore();
  const { memory } = state;
  const [visibleMemoryItems, setVisibleMemoryItems] = useState(5);
  const [previousHistoryLength, setPreviousHistoryLength] = useState(0);
  const [previousRamLength, setPreviousRamLength] = useState(0);
  const [previousRamValues, setPreviousRamValues] = useState<number[]>([]);
  const [changedAddresses, setChangedAddresses] = useState<Set<number>>(new Set());
  const [highlightedAddresses, setHighlightedAddresses] = useState<Set<number>>(new Set());
  const [memoryChanges, setMemoryChanges] = useState<Map<number, { oldValue: number, newValue: number }>>(new Map());

  const historyData = memory.history.map((entry, index) => ({
    step: index + 1,
    command: entry.command || 'N/A',
    stack: `[${entry.stack ? entry.stack.join(', ') : ''}]`,
    programCounter: entry.programCounter || 0,
  }));

  // Данные для вкладки "Исполнение"
  const executionData = memory.history.map((entry, index) => {
    const prevStack = index > 0 ? memory.history[index - 1].stack || [] : [];
    const currentStack = entry.stack || [];

    return {
      step: index + 1,
      command: entry.command || 'N/A',
      stackBefore: `[${prevStack.join(', ')}]`,
      stackAfter: `[${currentStack.join(', ')}]`,
      flags: entry.flags ? `Z=${entry.flags.zero ? 1 : 0} C=${entry.flags.carry ? 1 : 0} O=${entry.flags.overflow ? 1 : 0}` : '---',
      programCounter: entry.programCounter || 0
    };
  });

  // Создаем данные для отображения: сначала стек, потом RAM
  const stackData = state.processor.stack.map((value, index) => ({
    address: `STK${index}`,
    value: value,
    type: 'stack'
  }));

  const ramData = memory.ram.map((value, index) => ({
    address: index.toString(16).padStart(4, '0'),
    value: value,
    type: 'ram'
  }));

  // Объединяем стек и RAM для отображения
  const allMemoryData = [...stackData, ...ramData];

  // Показываем все ячейки памяти, но выделяем используемые
  const displayData = allMemoryData.slice(0, visibleMemoryItems);

  const handleLoadMore = () => {
    setVisibleMemoryItems(prev => Math.min(prev + 5, allMemoryData.length));
  };

  const handleReset = () => {
    setVisibleMemoryItems(5);
  };

  const hasMoreItems = visibleMemoryItems < allMemoryData.length;

  // Подсчитываем количество используемых ячеек
  const usedStackCells = state.processor.stack.length;
  const usedRamCells = memory.ram.filter(value => value !== 0).length;
  const totalMemoryCells = allMemoryData.length;

  // Сбрасываем видимые элементы при изменении состояния памяти
  useEffect(() => {
    setVisibleMemoryItems(5);
  }, [memory.ram]);

  // Сбрасываем отслеживание изменений при сбросе процессора
  useEffect(() => {
    if (memory.ram.every(value => value === 0)) {
      setChangedAddresses(new Set());
      setHighlightedAddresses(new Set());
      setPreviousRamValues([]);
      setMemoryChanges(new Map());
    }
  }, [memory.ram]);

  // Отслеживаем изменения в истории для анимации
  useEffect(() => {
    if (memory.history.length > previousHistoryLength) {
      // Новая запись в истории - можно добавить анимацию
      setPreviousHistoryLength(memory.history.length);
    }
  }, [memory.history.length, previousHistoryLength]);

  // Отслеживаем изменения в RAM для анимации
  useEffect(() => {
    if (memory.ram.length > previousRamLength) {
      // Новая запись в RAM - можно добавить анимацию
      setPreviousRamLength(memory.ram.length);
    }
  }, [memory.ram.length, previousRamLength]);

  // Отслеживаем изменения значений в памяти
  useEffect(() => {
    if (previousRamValues.length > 0 && memory.ram.length > 0) {
      const changed = new Set<number>();
      const highlighted = new Set<number>();
      const changes = new Map<number, { oldValue: number, newValue: number }>();

      // Сравниваем текущие значения с предыдущими
      for (let i = 0; i < Math.min(previousRamValues.length, memory.ram.length); i++) {
        if (previousRamValues[i] !== memory.ram[i]) {
          changed.add(i);
          highlighted.add(i);
          changes.set(i, {
            oldValue: previousRamValues[i],
            newValue: memory.ram[i]
          });

          // Убираем подсветку через 3 секунды
          setTimeout(() => {
            setHighlightedAddresses(prev => {
              const newSet = new Set(prev);
              newSet.delete(i);
              return newSet;
            });
          }, 3000);
        }
      }

      if (changed.size > 0) {
        setChangedAddresses(changed);
        setHighlightedAddresses(highlighted);
        setMemoryChanges(changes);

        // Очищаем изменения через 5 секунд
        setTimeout(() => {
          setMemoryChanges(new Map());
        }, 5000);
      }
    }

    // Обновляем предыдущие значения
    setPreviousRamValues([...memory.ram]);
  }, [memory.ram]);

  return (
    <Card title="Память" className="memory-card">
      <div className="memory-sections">
        {/* Вкладка "Исполнение" */}
        <div className="memory-section">
            <h4 className="flex items-center mb-4">
              <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">ИСПОЛНЕНИЕ</span>
              Пошаговое выполнение программы
              {memory.history.length > 0 && (
                <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded animate-pulse">
                  Активно
                </span>
              )}
            </h4>
            <DataTable
              value={executionData}
              size="small"
              className={`history-table ${memory.history.length > previousHistoryLength ? 'animate-slide-in-up' : ''}`}
              emptyMessage="Нет данных"
            >
              <Column
                field="step"
                header="ШАГ"
                style={{ width: '60px' }}
                body={(rowData) => (
                  <span className="font-mono text-blue-600 font-bold">{rowData.step}</span>
                )}
              />
              <Column
                field="command"
                header="КОМАНДА"
                body={(rowData) => (
                  <span className="font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded">{rowData.command}</span>
                )}
              />
              <Column
                field="stackBefore"
                header="СТЕК ДО"
                body={(rowData) => (
                  <span className="font-mono text-orange-600">{rowData.stackBefore}</span>
                )}
              />
              <Column
                field="stackAfter"
                header="СТЕК ПОСЛЕ"
                body={(rowData) => (
                  <span className="font-mono text-green-600 font-bold">{rowData.stackAfter}</span>
                )}
              />
              <Column
                field="flags"
                header="ФЛАГИ"
                style={{ width: '100px' }}
                body={(rowData) => (
                  <span className="font-mono text-purple-600 text-xs">{rowData.flags}</span>
                )}
              />
            </DataTable>
          </div>

        {/* Секция результата */}
        <div className="memory-section">
          <h4 className="flex items-center">
            <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">РЕЗУЛЬТАТ</span>
            Итоговая сумма
            {state.processor.is_halted && state.processor.stack.length > 0 && state.processor.stack[state.processor.stack.length - 1] !== 0 && (
              <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded animate-pulse">
                ✓ готово
              </span>
            )}
          </h4>
          <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-4 border-2 border-green-200">
            <div className="text-center">
              <div className="text-3xl font-mono font-bold text-green-700 mb-2">
                {(() => {
                  // Проверяем вершину стека для результата
                  const stackTop = state.processor.stack.length > 0 ? state.processor.stack[state.processor.stack.length - 1] : 0;
                  if (state.processor.is_halted && stackTop !== undefined && stackTop !== 0) {
                    return stackTop;
                  } else if (state.processor.is_halted) {
                    return '0';
                  } else {
                    return '...';
                  }
                })()}
              </div>
              <div className="text-sm text-gray-600 mb-2">
                {state.processor.is_halted ? 'Сумма элементов массива' : 'Вычисляется...'}
              </div>
              <div className="text-xs text-gray-500">
                Вершина стека
              </div>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};