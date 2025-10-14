"""
Предустановленные задачи для эмулятора
"""
from typing import List, Dict, Any
from .processor import StackProcessor

class TaskManager:
    """Менеджер задач для эмулятора"""
    
    def __init__(self):
        self.tasks = {
            1: {
                "id": 1,
                "title": "Сумма элементов массива",
                "description": "Вычислить сумму всех элементов массива из 6-15 элементов. Использовать цикл LOOP для итерации по элементам. Чтение из памяти в стек.",
                "program": self._get_sum_array_program(),
                "test_data": self._generate_sum_test_data()
            },
            2: {
                "id": 2,
                "title": "Свертка двух массивов",
                "description": "Вычислить свертку двух массивов по 10 элементов каждый. Результат сохранить в память по адресу 0x1100.",
                "program": self._get_convolution_program(),
                "test_data": self._generate_convolution_test_data()
            }
        }
    
    def get_task(self, task_id: int) -> Dict[str, Any]:
        """Получить информацию о задаче"""
        return self.tasks.get(task_id)
    
    def get_all_tasks(self) -> List[Dict[str, Any]]:
        """Получить все задачи"""
        return list(self.tasks.values())
    
    def _get_sum_array_program(self) -> str:
        """Программа для суммы элементов массива"""
        return """
; Инициализация размера массива
PUSH 7

; Элементы массива (в обратном порядке для последовательного доступа)
PUSH 70
PUSH 60  
PUSH 50
PUSH 40
PUSH 30
PUSH 20
PUSH 10

; Стек: [10, 20, 30, 40, 50, 60, 70, 7]
PUSH 0           ; Аккумулятор = 0

LOOP_START:
  ; Проверка условия выхода
  SWAP           ; [элементы, аккумулятор, счетчик] → [элементы, счетчик, аккумулятор]
  DUP            ; Дублируем счетчик
  JZ LOOP_END    ; Если счетчик == 0, выходим
  
  ; Достаем элемент массива с помощью ROT
  SWAP           ; [элементы, счетчик, аккумулятор] → [элементы, аккумулятор, счетчик]
  ROT            ; [..., аккумулятор, счетчик] → [..., счетчик, аккумулятор]
  ROT            ; [..., счетчик, аккумулятор] → [..., аккумулятор, счетчик]
  ROT            ; [..., аккумулятор, счетчик] → [..., счетчик, аккумулятор] - элемент теперь наверху
  
  ADD            ; Суммируем элемент с аккумулятором
  SWAP           ; [..., счетчик, сумма] → [..., сумма, счетчик]
  DEC            ; Уменьшаем счетчик
  
  JMP LOOP_START

LOOP_END:
  POP            ; Убираем счетчик (0)
  HALT
        """.strip()
    
    def _get_convolution_program(self) -> str:
        """Программа для свертки двух массивов"""
        return """
; Свертка двух массивов
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
  HALT           ; Завершаем выполнение
        """.strip()
    
    def _generate_sum_test_data(self) -> List[int]:
        """Генерирует тестовые данные для суммы массива"""
        # Фиксированные данные для тестирования: [7, 10, 20, 30, 40, 50, 60, 70]
        # Размер массива: 7, элементы: [10, 20, 30, 40, 50, 60, 70], ожидаемая сумма: 280
        return [7, 10, 20, 30, 40, 50, 60, 70]
    
    def _generate_convolution_test_data(self) -> List[int]:
        """Генерирует тестовые данные для свертки"""
        import random
        data = [10]  # Размер массива A
        data.extend([random.randint(1, 50) for _ in range(10)])  # Массив A
        data.append(10)  # Размер массива B
        data.extend([random.randint(1, 50) for _ in range(10)])  # Массив B
        return data
    
    def setup_task_data(self, processor: StackProcessor, task_id: int):
        """Настроить данные для задачи в процессоре"""
        task = self.get_task(task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")
        
        test_data = task["test_data"]
        
        # Загружаем данные в память
        for i, value in enumerate(test_data):
            processor.store_to_memory(0x1000 + i, value)
    
    def verify_task_result(self, processor: StackProcessor, task_id: int) -> Dict[str, Any]:
        """Проверить результат выполнения задачи"""
        task = self.get_task(task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")
        
        result = {
            "task_id": task_id,
            "success": False,
            "expected": None,
            "actual": None,
            "error": None
        }
        
        try:
            if task_id == 1:  # Сумма массива
                # Ожидаемая сумма: 10+20+30+40+50+60+70 = 280
                expected_sum = 280
                # Получаем результат со стека (последний элемент)
                if processor.processor.stack:
                    actual_sum = processor.processor.stack[-1]
                else:
                    actual_sum = 0
                
                result["expected"] = expected_sum
                result["actual"] = actual_sum
                result["success"] = (expected_sum == actual_sum)
                
            elif task_id == 2:  # Свертка массивов
                # Получаем размеры массивов
                size_a = processor.load_from_memory(0x1000)
                size_b = processor.load_from_memory(0x1010)
                
                # Вычисляем ожидаемую свертку
                expected_conv = 0
                for i in range(min(size_a, size_b)):
                    a_val = processor.load_from_memory(0x1001 + i)
                    b_val = processor.load_from_memory(0x1011 + i)
                    expected_conv += a_val * b_val
                
                # Получаем результат из памяти
                actual_conv = processor.load_from_memory(0x1100)
                
                result["expected"] = expected_conv
                result["actual"] = actual_conv
                result["success"] = (expected_conv == actual_conv)
        
        except Exception as e:
            result["error"] = str(e)
        
        return result
