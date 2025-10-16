import React, { useState, useEffect } from 'react';
import { Card } from 'flowbite-react';
import { useEmulatorStore } from '../../store/emulatorStore';
import './ProcessorView.css';

export const ProcessorView: React.FC = () => {
  const { state, current_task } = useEmulatorStore();
  const { processor } = state;
  const [previousCounter, setPreviousCounter] = useState(processor.program_counter);
  const [animateCounter, setAnimateCounter] = useState(false);

  // Функция форматирования стека для задачи 2 (hex) или обычного (decimal)
  const formatStackItem = (item: number) => {
    console.log('ProcessorView formatStackItem called with:', { item, current_task, isTask2: current_task === 2 });
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

  // Состояния для отслеживания изменений флагов
  const [previousFlags, setPreviousFlags] = useState(processor.flags);
  const [animateFlags, setAnimateFlags] = useState({
    zero: false,
    carry: false,
    overflow: false
  });


  // Отслеживаем изменения счетчика команд для анимации
  useEffect(() => {
    if (processor.program_counter !== previousCounter) {
      setAnimateCounter(true);
      setPreviousCounter(processor.program_counter);

      // Сбрасываем анимацию через 600ms
      setTimeout(() => setAnimateCounter(false), 600);
    }
  }, [processor.program_counter]);

  // Отслеживаем изменения флагов для анимации
  useEffect(() => {
    const flagsChanged = {
      zero: processor.flags.zero !== previousFlags.zero,
      carry: processor.flags.carry !== previousFlags.carry,
      overflow: processor.flags.overflow !== previousFlags.overflow
    };

    // Если какой-либо флаг изменился
    if (flagsChanged.zero || flagsChanged.carry || flagsChanged.overflow) {
      setAnimateFlags(flagsChanged);
      setPreviousFlags(processor.flags);

      // Сбрасываем анимации через 800ms
      setTimeout(() => {
        setAnimateFlags({
          zero: false,
          carry: false,
          overflow: false
        });
      }, 800);
    }
  }, [processor.flags, previousFlags]);

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h5 className="text-xl font-bold text-white-900 font-heading">Процессор</h5>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Активен</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-body">
              Счётчик команд
              {animateCounter && (
                <span className="ml-2 text-xs text-blue-600 animate-pulse">↑ увеличивается</span>
              )}
            </label>
            <div className={`text-2xl font-mono font-bold text-primary-600 bg-white rounded-lg p-3 text-center transition-all duration-300 ${animateCounter ? 'animate-counter-increase' : ''
              }`}>
              {processor.program_counter}
            </div>
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-body">
              Стек
              {state.current_task === 2 && (
                <span className="ml-2 text-xs text-orange-600 font-bold">(HEX формат)</span>
              )}
              {processor.stack.length > 0 && (
                <span className="ml-2 text-xs text-green-600 animate-pulse">
                  {processor.stack.length} элементов
                </span>
              )}
            </label>
            <div className="text-lg font-mono text-gray-800 bg-white rounded-lg p-3 min-h-[3rem] flex items-center animate-slide-in-up">
              <span className="text-gray-400">[</span>
              <span className="mx-2">
                {processor.stack.length > 0 ? (
                  processor.stack.map((item, index) => (
                    <span key={index} className="text-green-600 font-bold">
                      {formatStackItem(item)}{index < processor.stack.length - 1 ? ', ' : ''}
                    </span>
                  ))
                ) : (
                  <span className="text-gray-400">пуст</span>
                )}
              </span>
              <span className="text-gray-400">]</span>
            </div>
            {state.current_task === 2 && processor.stack.length > 0 && (
              <div className="mt-2 text-xs text-gray-500 text-center">
                Вершина: {formatStackItem(processor.stack[processor.stack.length - 1])}
              </div>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 font-body">
              Флаги состояния
              {(animateFlags.zero || animateFlags.carry || animateFlags.overflow) && (
                <span className="ml-2 text-xs text-orange-600 animate-pulse">↑ обновляются</span>
              )}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {/* Zero Flag */}
              <div className="bg-white rounded-lg p-2 border border-gray-200 text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300 mx-auto mb-1 ${processor.flags.zero
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-gray-400'
                  } ${animateFlags.zero ? 'animate-counter-increase' : ''}`}>
                  {processor.flags.zero ? '1' : '0'}
                </div>
                <div className="text-xs font-semibold text-gray-800 mb-1">Zero</div>
                <div className="text-xs text-gray-500">
                  {processor.flags.zero ? 'ноль' : 'не ноль'}
                </div>
                {animateFlags.zero && (
                  <div className="text-xs text-orange-600 animate-bounce mt-1">↑</div>
                )}
              </div>

              {/* Carry Flag */}
              <div className="bg-white rounded-lg p-2 border border-gray-200 text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300 mx-auto mb-1 ${processor.flags.carry
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-gray-400'
                  } ${animateFlags.carry ? 'animate-counter-increase' : ''}`}>
                  {processor.flags.carry ? '1' : '0'}
                </div>
                <div className="text-xs font-semibold text-gray-800 mb-1">Carry</div>
                <div className="text-xs text-gray-500">
                  {processor.flags.carry ? 'перенос' : 'нет переноса'}
                </div>
                {animateFlags.carry && (
                  <div className="text-xs text-orange-600 animate-bounce mt-1">↑</div>
                )}
              </div>

              {/* Overflow Flag */}
              <div className="bg-white rounded-lg p-2 border border-gray-200 text-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm transition-all duration-300 mx-auto mb-1 ${processor.flags.overflow
                  ? 'bg-green-500 animate-pulse'
                  : 'bg-gray-400'
                  } ${animateFlags.overflow ? 'animate-counter-increase' : ''}`}>
                  {processor.flags.overflow ? '1' : '0'}
                </div>
                <div className="text-xs font-semibold text-gray-800 mb-1">Overflow</div>
                <div className="text-xs text-gray-500">
                  {processor.flags.overflow ? 'переполнение' : 'нет переполнения'}
                </div>
                {animateFlags.overflow && (
                  <div className="text-xs text-orange-600 animate-bounce mt-1">↑</div>
                )}
              </div>
            </div>
          </div>




        </div>
      </div>
    </Card>
  );
};