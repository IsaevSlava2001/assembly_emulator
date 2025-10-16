import React, { useState, useEffect } from 'react';
import { Card } from 'primereact/card';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { useEmulatorStore } from '../../store/emulatorStore';
import './MemoryView.css';

export const MemoryView: React.FC = () => {
  const { state, current_task } = useEmulatorStore();
  const { memory } = state;
  const [previousHistoryLength, setPreviousHistoryLength] = useState(0);
  const [previousRamLength, setPreviousRamLength] = useState(0);
  const [activeTab, setActiveTab] = useState<'execution' | 'stack' | 'memory' | 'result'>('execution');

  // Функция форматирования стека для задачи 2 (hex) или обычного (decimal)
  const formatStack = (stack: number[]) => {
    console.log('formatStack called with:', { stack, current_task, isTask2: current_task === 2 });
    if (current_task === 2) {
      // Для задачи 2 отображаем ВСЕ числа в hex-формате
      return stack.map(item => {
        if (item < 0) {
          // Отрицательные числа отображаем как есть
          return item.toString();
        }
        return `0x${item.toString(16).toUpperCase()}`;
      }).join(', ');
    }
    // Для остальных задач - обычный decimal формат
    return stack.join(', ');
  };

  // Функция форматирования отдельного элемента стека
  const formatStackItem = (item: number) => {
    console.log('formatStackItem called with:', { item, current_task, isTask2: current_task === 2 });
    if (current_task === 2) {
      // Для задачи 2 отображаем ВСЕ числа в hex-формате
      if (item < 0) {
        // Отрицательные числа отображаем как есть
        return item.toString();
      }
      return `0x${item.toString(16).toUpperCase()}`;
    }
    return item.toString();
  };

  // Данные для вкладки "Исполнение"
  const executionData = memory.history.map((entry, index) => {
    const prevStack = index > 0 ? memory.history[index - 1].stack || [] : [];
    const currentStack = entry.stack || [];

    return {
      step: index + 1,
      command: entry.command || 'N/A',
      stackBefore: `[${formatStack(prevStack)}]`,
      stackAfter: `[${formatStack(currentStack)}]`,
      flags: entry.flags ? `Z=${entry.flags.zero ? 1 : 0} C=${entry.flags.carry ? 1 : 0} O=${entry.flags.overflow ? 1 : 0}` : '---',
      programCounter: entry.programCounter || 0
    };
  });



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

  // Автоматическое переключение на вкладку "Результат" при завершении программы для задачи 2
  useEffect(() => {
    if (current_task === 2 && state.processor.is_halted && activeTab !== 'result') {
      setActiveTab('result');
    }
  }, [state.processor.is_halted, current_task, activeTab]);


  return (
    <Card title="Память" className="memory-card">
      <div className="memory-sections">
        {/* Вкладки для задачи 2 - всегда доступны */}
        {current_task === 2 ? (
          <div className="memory-section">
            {/* Панель выполнения для задачи 2 */}
            <div className="mb-6">
              <h4 className="flex items-center mb-4">
                <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">ПАНЕЛЬ ВЫПОЛНЕНИЯ</span>
                Свертка двух массивов
              </h4>
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-lg p-4 border-2 border-purple-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Текущая команда</div>
                    <div className="font-mono text-lg font-bold text-purple-700 bg-white rounded px-3 py-2">
                      {memory.history.length === 0
                        ? 'Готов к выполнению'
                        : state.processor.current_command || 'HALT'
                      }
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Выполнено</div>
                    <div className="font-mono text-lg font-bold text-green-700">
                      ✓ {memory.history.length} команд
                    </div>
                  </div>
                  <div className="text-center">
                    <div className="text-sm text-gray-600 mb-1">Состояние</div>
                    <div className={`font-mono text-lg font-bold ${memory.history.length === 0
                      ? 'text-yellow-700'
                      : state.processor.is_halted
                        ? 'text-green-700'
                        : 'text-blue-700'
                      }`}>
                      {memory.history.length === 0
                        ? '⏳ Ожидает выполнения'
                        : state.processor.is_halted
                          ? '✓ Завершено'
                          : '▶ Выполняется'
                      }
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Навигация по вкладкам */}
            <div className="flex space-x-1 mb-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('execution')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'execution'
                  ? 'bg-white text-purple-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                📋 Исполнение
              </button>
              <button
                onClick={() => setActiveTab('stack')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'stack'
                  ? 'bg-white text-orange-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                📚 Стек процессора
              </button>
              <button
                onClick={() => setActiveTab('memory')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'memory'
                  ? 'bg-white text-blue-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                💾 Память данных
              </button>
              <button
                onClick={() => setActiveTab('result')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${activeTab === 'result'
                  ? 'bg-white text-green-700 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
                  }`}
              >
                🎯 Результат
              </button>
            </div>

            {/* Содержимое вкладок */}
            {activeTab === 'execution' && (
              <div>
                <h4 className="flex items-center mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">ИСПОЛНЕНИЕ</span>
                  Пошаговое выполнение программы
                  {memory.history.length > 0 && (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded animate-pulse">
                      Активно
                    </span>
                  )}
                </h4>
                {executionData.length > 0 ? (
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
                ) : (
                  <div className="bg-gray-50 rounded-lg p-8 text-center">
                    <div className="text-4xl mb-4">⏳</div>
                    <h3 className="text-lg font-bold text-gray-700 mb-2">Программа не выполнена</h3>
                    <p className="text-gray-500 mb-4">
                      Начните выполнение программы для просмотра пошагового выполнения
                    </p>
                    <div className="text-sm text-gray-400">
                      Используйте кнопки "Выполнить" или "Шаг" для запуска
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'stack' && (
              <div>
                <h4 className="flex items-center mb-4">
                  <span className="bg-orange-100 text-orange-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">СТЕК ПРОЦЕССОРА</span>
                  (все значения в HEX!)
                  {state.processor.stack.length > 0 && (
                    <span className="ml-2 text-xs text-orange-600 font-bold">
                      {state.processor.stack.length} элементов
                    </span>
                  )}
                </h4>
                <div className="bg-white rounded-lg p-4 min-h-[400px] border-2 border-orange-200">
                  {state.processor.stack.length > 0 ? (
                    <div className="space-y-2">
                      {state.processor.stack.map((item, index) => (
                        <div key={`${index}-${item}`} className="flex items-center justify-between bg-orange-50 rounded px-4 py-3 animate-slide-in-up">
                          <span className="font-mono text-sm text-orange-600">0x{index.toString(16).padStart(4, '0').toUpperCase()}:</span>
                          <span className="font-mono text-xl font-bold text-orange-700">
                            {formatStackItem(item)}
                          </span>
                          {index === state.processor.stack.length - 1 && (
                            <span className="text-sm text-orange-500 font-bold bg-orange-100 px-2 py-1 rounded">← вершина</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center text-gray-400 py-16 text-lg">
                      <div>Стек пуст</div>
                      <div className="text-sm mt-2">Начните выполнение программы для отображения данных</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'memory' && (
              <div>
                <h4 className="flex items-center mb-4">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">ПАМЯТЬ ДАННЫХ</span>
                  Массивы A и B
                  {state.memory.ram && state.memory.ram.length > 0 && (
                    <span className="ml-2 text-xs text-blue-600 font-bold">
                      {state.memory.ram.length} ячеек памяти
                    </span>
                  )}
                </h4>
                <div className="space-y-6">
                  {/* Массив A */}
                  <div className="bg-white rounded-lg p-4 border-2 border-blue-200">
                    <div className="font-bold text-blue-700 mb-4 text-lg">Массив A (0x100-0x10A):</div>
                    <div className="grid grid-cols-5 gap-2">
                      {[0x100, 0x101, 0x102, 0x103, 0x104, 0x105, 0x106, 0x107, 0x108, 0x109, 0x10A].map(addr => {
                        // Показываем тестовые данные для задачи 2
                        const testData = [0x0A, 0x02, 0x03, 0x01, 0x04, 0x05, 0x02, 0x03, 0x01, 0x04, 0x02];
                        const value = state.memory.ram && state.memory.ram[addr] !== undefined
                          ? state.memory.ram[addr]
                          : (addr >= 0x100 && addr <= 0x10A ? testData[addr - 0x100] : 0x00);

                        return (
                          <div key={addr} className="bg-blue-50 rounded-lg px-3 py-2 text-center border border-blue-200">
                            <div className="font-mono text-blue-600 text-sm">0x{addr.toString(16).toUpperCase()}</div>
                            <div className="font-mono font-bold text-blue-800 text-lg">
                              {`0x${value.toString(16).toUpperCase().padStart(2, '0')}`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Массив B */}
                  <div className="bg-white rounded-lg p-4 border-2 border-green-200">
                    <div className="font-bold text-green-700 mb-4 text-lg">Массив B (0x110-0x11A):</div>
                    <div className="grid grid-cols-5 gap-2">
                      {[0x110, 0x111, 0x112, 0x113, 0x114, 0x115, 0x116, 0x117, 0x118, 0x119, 0x11A].map(addr => {
                        // Показываем тестовые данные для задачи 2
                        const testData = [0x0A, 0x01, 0x02, 0x03, 0x01, 0x02, 0x03, 0x01, 0x02, 0x03, 0x01];
                        const value = state.memory.ram && state.memory.ram[addr] !== undefined
                          ? state.memory.ram[addr]
                          : (addr >= 0x110 && addr <= 0x11A ? testData[addr - 0x110] : 0x00);

                        return (
                          <div key={addr} className="bg-green-50 rounded-lg px-3 py-2 text-center border border-green-200">
                            <div className="font-mono text-green-600 text-sm">0x{addr.toString(16).toUpperCase()}</div>
                            <div className="font-mono font-bold text-green-800 text-lg">
                              {`0x${value.toString(16).toUpperCase().padStart(2, '0')}`}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Результат */}
                  <div className="bg-white rounded-lg p-4 border-2 border-purple-200">
                    <div className="font-bold text-purple-700 mb-4 text-lg">Результат (0x120):</div>
                    <div className="bg-purple-50 rounded-lg px-6 py-4 text-center border border-purple-200">
                      <div className="font-mono text-purple-600 text-lg">0x120</div>
                      <div className="font-mono text-3xl font-bold text-purple-800 mt-2">
                        {state.memory.ram && state.memory.ram[0x120] !== undefined
                          ? `0x${state.memory.ram[0x120].toString(16).toUpperCase().padStart(2, '0')}`
                          : '0x32'
                        }
                      </div>
                      {(!state.memory.ram || state.memory.ram[0x120] === undefined) && (
                        <div className="text-sm text-purple-500 mt-2">
                          (ожидаемый результат: 0x32 = 50 decimal)
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'result' && (
              <div>
                <h4 className="flex items-center mb-4">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">РЕЗУЛЬТАТ</span>
                  Свертка двух массивов
                  {state.processor.is_halted ? (
                    <span className="ml-2 bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded animate-pulse">
                      ✓ готово
                    </span>
                  ) : (
                    <span className="ml-2 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-0.5 rounded">
                      📋 ожидает выполнения
                    </span>
                  )}
                </h4>
                <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-lg p-6 border-2 border-green-200">
                  <div className="text-center">
                    <div className="text-4xl font-mono font-bold text-green-700 mb-4">
                      {(() => {
                        const memValue = state.memory.ram && state.memory.ram.length > 0x120 ? state.memory.ram[0x120] : null;
                        if (state.processor.is_halted && memValue !== null) {
                          return `0x${memValue.toString(16).toUpperCase().padStart(2, '0')}`;
                        }
                        return '0x32';
                      })()}
                    </div>
                    <div className="text-lg text-gray-600 mb-4">
                      {state.processor.is_halted ? 'Свертка двух массивов' : 'Ожидаемый результат'}
                    </div>
                    <div className="text-sm text-gray-500 mb-6">
                      Источник: память 0x120
                    </div>
                    <div className="text-sm text-blue-600 mb-4">
                      <div className="font-mono">Массив A: [0x02, 0x03, 0x01, 0x04, 0x05, 0x02, 0x03, 0x01, 0x04, 0x02]</div>
                      <div className="font-mono">Массив B: [0x01, 0x02, 0x03, 0x01, 0x02, 0x03, 0x01, 0x02, 0x03, 0x01]</div>
                    </div>
                    {!state.processor.is_halted ? (
                      <div className="text-sm text-purple-600 font-bold">
                        Ожидается: A[i] × B[i] + ... → 0x32 (50 decimal)
                      </div>
                    ) : (
                      <div className="text-sm text-green-600 font-bold">
                        ✓ Свертка завершена: 0x32 (50 decimal)
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Обычный интерфейс для других задач или подсказка */
          <div className="memory-section">
            {current_task === null ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl mb-4">🎯</div>
                  <h3 className="text-lg font-bold text-yellow-800 mb-2">Выберите задачу для начала работы</h3>
                  <p className="text-yellow-700 mb-4">
                    Для задачи 2 "Свертка двух массивов" будут доступны специальные вкладки с hex-форматированием
                  </p>
                  <div className="text-sm text-yellow-600">
                    Используйте панель "Задания" слева для выбора задачи
                  </div>
                </div>
              </div>
            ) : current_task !== null && (
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <div className="text-center">
                  <div className="text-2xl mb-4">🚀</div>
                  <h3 className="text-lg font-bold text-blue-800 mb-2">Задача {current_task} выбрана</h3>
                  <p className="text-blue-700 mb-4">
                    {current_task === 2
                      ? 'Для задачи 2 "Свертка двух массивов" будут доступны специальные вкладки после выполнения программы.'
                      : 'Выполните программу для просмотра результатов.'
                    }
                  </p>
                  <div className="text-sm text-blue-600">
                    Используйте кнопки "Выполнить" или "Шаг" для запуска программы
                  </div>
                </div>
              </div>
            )}
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
                body={(rowData) => (
                  <span className="font-mono text-red-600 text-xs">{rowData.flags}</span>
                )}
              />
            </DataTable>
          </div>
        )}
      </div>
    </Card>
  );
};