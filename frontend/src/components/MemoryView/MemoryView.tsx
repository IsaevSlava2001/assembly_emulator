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


    // Данные для вкладки "Исполнение"
    const executionData = memory.history.map((entry, index) => {
        const prevStack = index > 0 ? memory.history[index - 1].stack || [] : [];
        const currentStack = entry.stack || [];

        // Пытаемся извлечь текст команды из доступных полей
        const candidates: Array<unknown> = [
            (entry as any).instruction,
            (entry as any).command,
            (entry as any).opcode,
            (entry as any).mnemonic,
            (entry as any).line,
            (entry as any).text,
            (entry as any).raw
        ];
        const baseCmd = (candidates.find(v => typeof v === 'string' && (v as string).trim().length > 0) as string | undefined) || '';
        const operandSrc: unknown = (entry as any).operand ?? (entry as any).operands ?? (entry as any).args ?? (entry as any).argument;
        let operandText = '';
        if (Array.isArray(operandSrc)) {
            operandText = operandSrc.map(v => String(v)).join(', ');
        } else if (operandSrc !== undefined && operandSrc !== null) {
            operandText = String(operandSrc);
        }
        const commandText = [baseCmd, operandText].filter(Boolean).join(' ').trim();

        return {
            step: index + 1,
            command: commandText || '-',
            stackBefore: formatStack(prevStack),
            stackAfter: formatStack(currentStack),
            flags: `Z=${entry.flags?.zero ? 1 : 0} C=${entry.flags?.carry ? 1 : 0} O=${entry.flags?.overflow ? 1 : 0}`
        };
    });

    // Отслеживаем изменения для анимации
    useEffect(() => {
        if (memory.history.length > previousHistoryLength) {
            setPreviousHistoryLength(memory.history.length);
        }
    }, [memory.history.length, previousHistoryLength]);

    useEffect(() => {
        if (state.memory.ram && state.memory.ram.length > previousRamLength) {
            setPreviousRamLength(state.memory.ram.length);
        }
    }, [state.memory.ram, previousRamLength]);

    return (
        <Card title="Память" className="memory-card">
            <div className="memory-sections">
                {current_task === 2 ? (
                    <div className="memory-section">
                        {/* Шаги выполнения для задачи 2 */}
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
                                            <span className="font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded">{rowData.command || '-'}</span>
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
                                            <span className="font-mono text-green-600">{rowData.stackAfter}</span>
                                        )}
                                    />
                                    <Column
                                        field="flags"
                                        header="ФЛАГИ"
                                        body={(rowData) => (
                                            <span className="font-mono text-purple-600">{rowData.flags}</span>
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


                    </div>
                ) : (
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
                                    <span className="font-mono text-gray-800 bg-gray-50 px-2 py-1 rounded">{rowData.command || '-'}</span>
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
                                    <span className="font-mono text-green-600">{rowData.stackAfter}</span>
                                )}
                            />
                            <Column
                                field="flags"
                                header="ФЛАГИ"
                                body={(rowData) => (
                                    <span className="font-mono text-purple-600">{rowData.flags}</span>
                                )}
                            />
                        </DataTable>
                    </div>
                )}
            </div>
        </Card>
    );
};
