// ADD: Command editor component for assembly code input and display
import React, { useState, useEffect } from 'react';
import { Card, Button, Textarea } from 'flowbite-react';
import { useEmulatorStore } from '../../store/emulatorStore';
import { apiService } from '../../services/api';
import './CommandEditor.css';

export const CommandEditor: React.FC = () => {
  const { state, setSourceCode, compileCode, loading, error, current_task } = useEmulatorStore();
  const [assemblyCode, setAssemblyCode] = useState(state.source_code);
  const [activeTab, setActiveTab] = useState<'editor' | 'examples' | 'help'>('editor');
  const [exampleCode, setExampleCode] = useState<string>('');
  const [loadingExample, setLoadingExample] = useState(false);
  const [compileSuccess, setCompileSuccess] = useState(false);

  const handleCodeChange = (code: string) => {
    setAssemblyCode(code);
    setSourceCode(code);
  };

  const handleCompile = async () => {
    setCompileSuccess(false);
    try {
      await compileCode(assemblyCode);
      setCompileSuccess(true);
      // Автоматически скрываем сообщение об успехе через 3 секунды
      setTimeout(() => setCompileSuccess(false), 3000);
    } catch (error) {
      setCompileSuccess(false);
    }
  };

  const handleLoadExample = async () => {
    if (!current_task) {
      console.warn('Не выбрана задача для загрузки примера');
      return;
    }

    try {
      setLoadingExample(true);
      const result = await apiService.getTaskProgram(current_task);
      setExampleCode(result.program);
      setActiveTab('examples');
    } catch (error) {
      console.error('Ошибка загрузки примера:', error);
    } finally {
      setLoadingExample(false);
    }
  };

  const handleLoadTaskExample = (taskId: number) => {
    const examples = {
      1: `; Инициализация размера массива
PUSH 7           ; Размер массива (7 элементов)

; Инициализация элементов массива
PUSH 10          ; Элемент 1
PUSH 20          ; Элемент 2
PUSH 30          ; Элемент 3
PUSH 40          ; Элемент 4
PUSH 50          ; Элемент 5
PUSH 60          ; Элемент 6
PUSH 70          ; Элемент 7

; Программа суммирования массива
; Стек: [70, 60, 50, 40, 30, 20, 10, 7]
PUSH 0           ; Аккумулятор для суммы = 0

LOOP_START:
  ; Проверка условия выхода
  DUP            ; Дублируем счетчик: [..., 0, 7, 7]
  JZ LOOP_END    ; Если счетчик == 0, выходим
  
  ; Берем элемент массива и складываем с аккумулятором
  ; Стек: [70, 60, 50, 40, 30, 20, 10, 7, 0, 7]
  ; Нужно взять элемент с вершины (70) и сложить с аккумулятором (0)
  ROT            ; [..., 0, 7, 7] → [..., 7, 0, 7]
  ROT            ; [..., 7, 0, 7] → [..., 0, 7, 7]
  ADD            ; Суммируем элемент с аккумулятором
  ROT            ; [..., 7, сумма] → [..., сумма, 7]
  DEC            ; Уменьшаем счетчик: 7-1=6
  
  JMP LOOP_START ; Повторяем цикл

LOOP_END:
  ; Завершение
  POP            ; Убираем счетчик (0)
  HALT           ; Завершаем выполнение, сумма на вершине стека

; Простая логика цикла:
; 1. Проверяем счетчик (JZ)
; 2. Берем элемент с вершины стека
; 3. Складываем с аккумулятором
; 4. Уменьшаем счетчик
; 5. Повторяем цикл
; Результат: программа корректно вычислит сумму 10+20+30+40+50+60+70 = 280`,

      2: `; Свертка двух массивов
PUSH [0x1000]    ; Размер массива A
PUSH [0x1010]    ; Размер массива B
PUSH 0           ; Инициализируем результат

CONV_LOOP:
  DUP            ; Дублируем счетчик
  JZ CONV_EXIT   ; Если счетчик = 0, выходим
  DEC            ; Уменьшаем счетчик
  
  ; Загружаем элементы массивов
  PUSH [0x1001]  ; Базовый адрес A
  ADD            ; Добавляем смещение
  LOAD           ; Загружаем A[i]
  
  PUSH [0x1011]  ; Базовый адрес B
  ADD            ; Добавляем смещение
  LOAD           ; Загружаем B[i]
  
  MUL            ; Умножаем A[i] * B[i]
  ADD            ; Добавляем к результату
  JMP CONV_LOOP  ; Повторяем цикл

CONV_EXIT:
  POP            ; Убираем счетчик со стека
  PUSH 0x1100    ; Адрес для результата
  STORE          ; Сохраняем результат
  HALT           ; Завершаем выполнение`
    };

    setExampleCode(examples[taskId as keyof typeof examples] || '');
  };

  const handleInsertExample = () => {
    setAssemblyCode(exampleCode);
    setSourceCode(exampleCode);
    setActiveTab('editor');
  };

  // Сбрасываем состояние компиляции при сбросе процессора
  useEffect(() => {
    if (state.processor.program_counter === 0 && state.processor.stack.length === 0) {
      setCompileSuccess(false);
    }
  }, [state.processor.program_counter, state.processor.stack.length]);

  return (
    <Card className="glass-card p-6">
      <div className="flex items-center justify-between mb-6">
        <h5 className="text-xl font-bold text-white-900 font-heading">Редактор команд</h5>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Редактирование</span>
        </div>
      </div>

      <div className="space-y-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              className={`border-b-2 py-2 px-1 text-sm font-medium ${activeTab === 'editor'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setActiveTab('editor')}
            >
              Ассемблер
            </button>
            <button
              className={`border-b-2 py-2 px-1 text-sm font-medium ${activeTab === 'examples'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setActiveTab('examples')}
            >
              Примеры
            </button>
            <button
              className={`border-b-2 py-2 px-1 text-sm font-medium ${activeTab === 'help'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              onClick={() => setActiveTab('help')}
            >
              Справка
            </button>
          </nav>
        </div>

        {activeTab === 'editor' ? (
          <div className="space-y-4">
            <Textarea
              value={assemblyCode}
              onChange={(e) => handleCodeChange(e.target.value)}
              rows={15}
              className="font-mono text-sm"
              placeholder="Введите код на ассемблере..."
            />
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                <p className="text-red-800 text-sm">{error}</p>
              </div>
            )}

            {compileSuccess && !error && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4 animate-fade-in">
                <div className="flex items-center">
                  <svg className="w-5 h-5 text-green-600 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <p className="text-green-800 text-sm font-medium">Ошибок нет</p>
                </div>
              </div>
            )}

            <div className="flex space-x-3">
              <Button
                color="info"
                size="sm"
                onClick={handleCompile}
                disabled={loading}
                className="flex items-center space-x-2"
              >
                {loading ? (
                  <svg className="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )}
                {loading ? 'Компиляция...' : 'Компилировать'}
              </Button>
              <Button
                color="light"
                size="sm"
                onClick={() => handleCodeChange('')}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Очистить
              </Button>
            </div>
          </div>
        ) : activeTab === 'examples' ? (
          <div className="space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-lg font-semibold text-blue-900 font-heading">
                  Примеры кода для задач
                </h4>
                <Button
                  color="info"
                  size="sm"
                  onClick={handleLoadExample}
                  disabled={loadingExample || !current_task}
                  className="flex items-center space-x-2"
                >
                  {loadingExample ? (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  ) : (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                    </svg>
                  )}
                  {loadingExample ? 'Загрузка...' : 'Загрузить пример'}
                </Button>
              </div>
              <p className="text-blue-800 text-sm mb-4 font-body">
                Готовые примеры кода для задач 1 и 2. Скопируйте и вставьте в редактор.
              </p>

              {/* Кнопки для выбора примера */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <Button
                  style={{ backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
                  size="sm"
                  onClick={() => handleLoadTaskExample(1)}
                  className="flex items-center justify-center space-x-2 h-12 text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                  </svg>
                  <div className="text-left">
                    <div className="font-semibold">Задача 1</div>
                    <div className="text-xs opacity-90">Сумма массива</div>
                  </div>
                </Button>

                <Button
                  style={{ backgroundColor: '#3b82f6', borderColor: '#3b82f6' }}
                  size="sm"
                  onClick={() => handleLoadTaskExample(2)}
                  className="flex items-center justify-center space-x-2 h-12 text-white"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                  <div className="text-left">
                    <div className="font-semibold">Задача 2</div>
                    <div className="text-xs opacity-90">Свертка массивов</div>
                  </div>
                </Button>
              </div>
            </div>

            {exampleCode && (
              <div className="space-y-4">
                <Textarea
                  value={exampleCode}
                  readOnly
                  rows={15}
                  className="font-mono text-sm bg-gray-50"
                  placeholder="Код примера появится здесь..."
                />
                <div className="flex space-x-3">
                  <Button
                    color="success"
                    size="sm"
                    onClick={handleInsertExample}
                    className="flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                    </svg>
                    Вставить в редактор
                  </Button>
                  <Button
                    color="light"
                    size="sm"
                    onClick={() => setExampleCode('')}
                    className="flex items-center space-x-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Очистить
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h4 className="text-xl font-bold text-green-900 font-heading mb-4">
                📚 Справочник по ассемблеру
              </h4>
              <p className="text-green-800 text-sm mb-4 font-body">
                Полное руководство по всем поддерживаемым инструкциям стекового процессора
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Пересылка данных */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h5 className="text-lg font-semibold text-gray-900 font-heading mb-3 flex items-center">
                  <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">ДАННЫЕ</span>
                  Пересылка данных
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <code className="font-mono text-blue-600">PUSH &lt;value&gt;</code>
                    <span className="text-gray-600">поместить значение на стек</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <code className="font-mono text-blue-600">POP</code>
                    <span className="text-gray-600">извлечь значение со стека</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <code className="font-mono text-blue-600">DUP</code>
                    <span className="text-gray-600">дублировать верхний элемент</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <code className="font-mono text-blue-600">SWAP</code>
                    <span className="text-gray-600">поменять местами два элемента</span>
                  </div>
                </div>
              </div>

              {/* Арифметические операции */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h5 className="text-lg font-semibold text-gray-900 font-heading mb-3 flex items-center">
                  <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">МАТЕМАТИКА</span>
                  Арифметические операции
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <code className="font-mono text-blue-600">ADD</code>
                    <span className="text-gray-600">сложение</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <code className="font-mono text-blue-600">SUB</code>
                    <span className="text-gray-600">вычитание</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <code className="font-mono text-blue-600">MUL</code>
                    <span className="text-gray-600">умножение</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <code className="font-mono text-blue-600">DIV</code>
                    <span className="text-gray-600">деление</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <code className="font-mono text-blue-600">INC</code>
                    <span className="text-gray-600">инкремент</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <code className="font-mono text-blue-600">DEC</code>
                    <span className="text-gray-600">декремент</span>
                  </div>
                </div>
              </div>

              {/* Работа с памятью */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h5 className="text-lg font-semibold text-gray-900 font-heading mb-3 flex items-center">
                  <span className="bg-purple-100 text-purple-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">ПАМЯТЬ</span>
                  Работа с памятью
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <code className="font-mono text-blue-600">LOAD</code>
                    <span className="text-gray-600">загрузить из памяти</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <code className="font-mono text-blue-600">STORE</code>
                    <span className="text-gray-600">сохранить в память</span>
                  </div>
                </div>
              </div>

              {/* Управление выполнением */}
              <div className="bg-white rounded-lg border border-gray-200 p-4">
                <h5 className="text-lg font-semibold text-gray-900 font-heading mb-3 flex items-center">
                  <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded mr-2">УПРАВЛЕНИЕ</span>
                  Управление выполнением
                </h5>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <code className="font-mono text-blue-600">JMP &lt;label&gt;</code>
                    <span className="text-gray-600">безусловный переход</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <code className="font-mono text-blue-600">JZ &lt;label&gt;</code>
                    <span className="text-gray-600">переход если ноль</span>
                  </div>
                  <div className="flex justify-between items-center py-1 border-b border-gray-100">
                    <code className="font-mono text-blue-600">JNZ &lt;label&gt;</code>
                    <span className="text-gray-600">переход если не ноль</span>
                  </div>
                  <div className="flex justify-between items-center py-1">
                    <code className="font-mono text-blue-600">HALT</code>
                    <span className="text-gray-600">остановка выполнения</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Примеры использования */}
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-6">
              <h5 className="text-lg font-semibold text-gray-900 font-heading mb-4">
                💡 Примеры использования
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h6 className="font-medium text-gray-800 mb-2">Простое сложение:</h6>
                  <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                    {`PUSH 5
PUSH 3
ADD
HALT`}
                  </pre>
                </div>
                <div>
                  <h6 className="font-medium text-gray-800 mb-2">Условный переход:</h6>
                  <pre className="bg-gray-800 text-green-400 p-3 rounded text-xs font-mono overflow-x-auto">
                    {`PUSH 0
JZ end
PUSH 1
end:
HALT`}
                  </pre>
                </div>
              </div>
            </div>

            {/* Архитектура процессора */}
            <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
              <h5 className="text-lg font-semibold text-blue-900 font-heading mb-4">
                🏗️ Архитектура процессора
              </h5>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div className="text-center">
                  <div className="bg-blue-100 rounded-lg p-3 mb-2">
                    <div className="text-blue-800 font-medium">Стековая архитектура</div>
                  </div>
                  <p className="text-blue-700">Все операции выполняются над данными на стеке</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-lg p-3 mb-2">
                    <div className="text-blue-800 font-medium">Гарвардская архитектура</div>
                  </div>
                  <p className="text-blue-700">Раздельная память для команд и данных</p>
                </div>
                <div className="text-center">
                  <div className="bg-blue-100 rounded-lg p-3 mb-2">
                    <div className="text-blue-800 font-medium">RISC-подобная</div>
                  </div>
                  <p className="text-blue-700">Простой набор инструкций</p>
                </div>
              </div>
            </div>

            {/* Как работает выполнение программы */}
            <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border border-purple-200 p-6">
              <h5 className="text-xl font-bold text-purple-900 font-heading mb-4 flex items-center">
                <span className="mr-2">🎯</span>
                Как работает выполнение программы
              </h5>

              <div className="space-y-4">
                {/* Шаг 1 */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h6 className="font-bold text-purple-800 mb-2">1️⃣ Компиляция кода</h6>
                  <p className="text-sm text-gray-700 mb-2">
                    Нажмите <strong>"Компилировать"</strong> — код преобразуется в машинные инструкции и загружается в процессор.
                  </p>
                  <div className="bg-green-50 border-l-4 border-green-500 p-2 text-sm">
                    <strong className="text-green-800">✅ Ошибок нет</strong> — код готов к выполнению!
                  </div>
                </div>

                {/* Шаг 2 */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h6 className="font-bold text-purple-800 mb-2">2️⃣ Пошаговое выполнение</h6>
                  <p className="text-sm text-gray-700 mb-2">
                    Нажимайте <strong>"Следующий шаг"</strong> для выполнения одной команды:
                  </p>
                  <ul className="text-sm text-gray-700 space-y-1 ml-4">
                    <li>📊 <strong>Счётчик команд</strong> увеличивается на 1</li>
                    <li>🔧 <strong>Текущая команда</strong> показывает, что выполняется</li>
                    <li>📚 <strong>Стек</strong> обновляется с новыми данными</li>
                    <li>🚩 <strong>Флаги</strong> меняются в зависимости от результата</li>
                  </ul>
                </div>

                {/* Шаг 3 */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h6 className="font-bold text-purple-800 mb-2">3️⃣ Визуализация в блоке "Память"</h6>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="bg-blue-50 p-3 rounded">
                      <strong className="text-blue-800">Память по времени:</strong>
                      <p className="text-gray-700 mt-1">
                        История каждого шага выполнения с состоянием стека и счётчика команд
                      </p>
                    </div>
                    <div className="bg-purple-50 p-3 rounded">
                      <strong className="text-purple-800">Состояние памяти:</strong>
                      <p className="text-gray-700 mt-1">
                        Текущие данные в памяти с адресами и значениями ячеек
                      </p>
                    </div>
                  </div>
                </div>

                {/* Пример */}
                <div className="bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg p-4 border border-orange-200">
                  <h6 className="font-bold text-orange-800 mb-2">📝 Пример: PUSH 15, PUSH 3, ADD</h6>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-500 text-white px-2 py-1 rounded font-mono text-xs">Шаг 1</span>
                      <span className="text-gray-700">PUSH 15 → Стек: <code className="text-green-600 font-bold">[15]</code></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-500 text-white px-2 py-1 rounded font-mono text-xs">Шаг 2</span>
                      <span className="text-gray-700">PUSH 3 → Стек: <code className="text-green-600 font-bold">[15, 3]</code></span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="bg-blue-500 text-white px-2 py-1 rounded font-mono text-xs">Шаг 3</span>
                      <span className="text-gray-700">ADD → Стек: <code className="text-green-600 font-bold">[18]</code> (15+3)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};
