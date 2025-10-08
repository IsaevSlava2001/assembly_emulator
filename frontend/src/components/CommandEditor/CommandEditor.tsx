// ADD: Command editor component for assembly code input and display
import React, { useState } from 'react';
import { Card, Button, Textarea } from 'flowbite-react';
import { useEmulatorStore } from '../../store/emulatorStore';
import './CommandEditor.css';

export const CommandEditor: React.FC = () => {
  const { state, setSourceCode } = useEmulatorStore();
  const [assemblyCode, setAssemblyCode] = useState(state.sourceCode);

  const handleCodeChange = (code: string) => {
    setAssemblyCode(code);
    setSourceCode(code);
  };

  const handleCompile = () => {
    // TODO: Implement compilation logic
    console.log('Compiling assembly code:', assemblyCode);
  };

  const samplePrograms = {
    sumArray: `; Сумма элементов массива
PUSH [0x1000]    ; Загружаем размер массива
PUSH 0           ; Инициализируем аккумулятор

LOOP:
  DUP            ; Дублируем счетчик
  JZ EXIT        ; Если счетчик = 0, выходим
  DEC            ; Уменьшаем счетчик
  SWAP           ; Меняем счетчик и аккумулятор местами
  
  ; Загружаем следующий элемент массива
  PUSH [0x1001]  ; Базовый адрес массива
  ADD            ; Добавляем смещение
  LOAD           ; Загружаем значение элемента
  
  ADD            ; Добавляем к аккумулятору
  SWAP           ; Возвращаем счетчик на вершину
  JMP LOOP       ; Повторяем цикл

EXIT:
  POP            ; Убираем счетчик со стека
  PUSH [0x1100]  ; Адрес для результата
  STORE          ; Сохраняем результат
  HALT           ; Завершаем выполнение`,

    convolution: `; Свертка двух массивов
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
  PUSH [0x1100]  ; Адрес для результата
  STORE          ; Сохраняем результат
  HALT           ; Завершаем выполнение`
  };

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
            <button className="border-b-2 border-blue-500 py-2 px-1 text-sm font-medium text-blue-600">
              Ассемблер
            </button>
            <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Примеры
            </button>
            <button className="border-b-2 border-transparent py-2 px-1 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300">
              Справка
            </button>
          </nav>
        </div>

        <div className="space-y-4">
          <Textarea
            value={assemblyCode}
            onChange={(e) => handleCodeChange(e.target.value)}
            rows={15}
            className="font-mono text-sm"
            placeholder="Введите код на ассемблере..."
          />
          <div className="flex space-x-3">
            <Button
              color="info"
              size="sm"
              onClick={handleCompile}
              className="flex items-center space-x-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Компилировать
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
      </div>
    </Card>
  );
};
