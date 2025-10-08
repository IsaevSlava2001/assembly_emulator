// ADD: Command editor component for assembly code input and display
import React, { useState } from 'react';
import { Card, Button, Textarea, Tabs } from 'flowbite-react';
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
        <h5 className="text-xl font-bold text-gray-900">Редактор команд</h5>
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">Редактирование</span>
        </div>
      </div>
      
      <Tabs aria-label="Command Editor Tabs">
        <Tabs.Item title="Ассемблер" icon={() => (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M12.316 3.051a1 1 0 01.633 1.265l-4 12a1 1 0 11-1.898-.632l4-12a1 1 0 011.265-.633zM5.707 6.293a1 1 0 010 1.414L3.414 10l2.293 2.293a1 1 0 11-1.414 1.414l-3-3a1 1 0 010-1.414l3-3a1 1 0 011.414 0zm8.586 0a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 11-1.414-1.414L16.586 10l-2.293-2.293a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        )}>
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
        </Tabs.Item>
        
        <Tabs.Item title="Примеры" icon={() => (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z" clipRule="evenodd" />
          </svg>
        )}>
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-blue-900 mb-3">Сумма элементов массива</h4>
              <p className="text-blue-800 text-sm mb-4">Вычислить сумму всех элементов массива из 6-15 элементов</p>
              <Button
                color="light"
                size="sm"
                onClick={() => handleCodeChange(samplePrograms.sumArray)}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Загрузить пример
              </Button>
            </div>
            
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-green-900 mb-3">Свертка двух массивов</h4>
              <p className="text-green-800 text-sm mb-4">Вычислить свертку двух массивов по 10 элементов каждый</p>
              <Button
                color="light"
                size="sm"
                onClick={() => handleCodeChange(samplePrograms.convolution)}
                className="flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Загрузить пример
              </Button>
            </div>
          </div>
        </Tabs.Item>
        
        <Tabs.Item title="Справка" icon={() => (
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
          </svg>
        )}>
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900">Доступные команды:</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-3">Пересылка данных</h5>
                <ul className="space-y-2 text-sm">
                  <li><code className="bg-gray-200 px-2 py-1 rounded">PUSH &lt;value&gt;</code> - поместить значение на стек</li>
                  <li><code className="bg-gray-200 px-2 py-1 rounded">POP</code> - извлечь значение со стека</li>
                  <li><code className="bg-gray-200 px-2 py-1 rounded">DUP</code> - дублировать верхний элемент стека</li>
                  <li><code className="bg-gray-200 px-2 py-1 rounded">SWAP</code> - поменять местами два верхних элемента</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-3">Арифметические операции</h5>
                <ul className="space-y-2 text-sm">
                  <li><code className="bg-gray-200 px-2 py-1 rounded">ADD</code> - сложение</li>
                  <li><code className="bg-gray-200 px-2 py-1 rounded">SUB</code> - вычитание</li>
                  <li><code className="bg-gray-200 px-2 py-1 rounded">MUL</code> - умножение</li>
                  <li><code className="bg-gray-200 px-2 py-1 rounded">DIV</code> - деление</li>
                  <li><code className="bg-gray-200 px-2 py-1 rounded">INC</code> - инкремент</li>
                  <li><code className="bg-gray-200 px-2 py-1 rounded">DEC</code> - декремент</li>
                </ul>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <h5 className="font-semibold text-gray-800 mb-3">Управление выполнением</h5>
                <ul className="space-y-2 text-sm">
                  <li><code className="bg-gray-200 px-2 py-1 rounded">JMP &lt;label&gt;</code> - безусловный переход</li>
                  <li><code className="bg-gray-200 px-2 py-1 rounded">JZ &lt;label&gt;</code> - переход если ноль</li>
                  <li><code className="bg-gray-200 px-2 py-1 rounded">JNZ &lt;label&gt;</code> - переход если не ноль</li>
                  <li><code className="bg-gray-200 px-2 py-1 rounded">HALT</code> - остановка выполнения</li>
                </ul>
              </div>
            </div>
          </div>
        </Tabs.Item>
      </Tabs>
    </Card>
  );
};
