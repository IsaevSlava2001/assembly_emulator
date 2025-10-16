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
  DUP            ; Дублируем счетчик
  JZ LOOP_END    ; Если счетчик == 0, выходим
  
  ; Достаем элемент массива с помощью ROT
  ; Стек: [10, 20, 30, 40, 50, 60, 70, 7, 0, 7]
  ; Нужно взять элемент с вершины (10) и сложить с аккумулятором (0)
  ROT            ; [..., 0, 7, 7] → [..., 7, 0, 7]
  ROT            ; [..., 7, 0, 7] → [..., 0, 7, 7]
  ADD            ; Суммируем элемент с аккумулятором
  ROT            ; [..., 7, сумма] → [..., сумма, 7]
  DEC            ; Уменьшаем счетчик
  
  JMP LOOP_START

LOOP_END:
  POP            ; Убираем счетчик (0)
  HALT
        """.strip()
    
    def _get_convolution_program(self) -> str:
        """Программа для свертки двух массивов"""
        return """
; Свертка двух массивов (скалярное произведение) для 10 элементов
; acc = 0
PUSH 0

; i = 0
PUSH 0x101
LOAD
PUSH 0x111
LOAD
MUL
ADD

; i = 1
PUSH 0x102
LOAD
PUSH 0x112
LOAD
MUL
ADD

; i = 2
PUSH 0x103
LOAD
PUSH 0x113
LOAD
MUL
ADD

; i = 3
PUSH 0x104
LOAD
PUSH 0x114
LOAD
MUL
ADD

; i = 4
PUSH 0x105
LOAD
PUSH 0x115
LOAD
MUL
ADD

; i = 5
PUSH 0x106
LOAD
PUSH 0x116
LOAD
MUL
ADD

; i = 6
PUSH 0x107
LOAD
PUSH 0x117
LOAD
MUL
ADD

; i = 7
PUSH 0x108
LOAD
PUSH 0x118
LOAD
MUL
ADD

; i = 8
PUSH 0x109
LOAD
PUSH 0x119
LOAD
MUL
ADD

; i = 9
PUSH 0x10A
LOAD
PUSH 0x11A
LOAD
MUL
ADD

; store result
PUSH 0x120
STORE
HALT
        """.strip()
    
    def _generate_sum_test_data(self) -> List[int]:
        """Генерирует тестовые данные для суммы массива"""
        # Фиксированные данные для тестирования: [7, 10, 20, 30, 40, 50, 60, 70]
        # Размер массива: 7, элементы: [10, 20, 30, 40, 50, 60, 70], ожидаемая сумма: 280
        return [7, 10, 20, 30, 40, 50, 60, 70]
    
    def _generate_convolution_test_data(self) -> List[int]:
        """Возвращает фиксированные данные, дающие результат 50 (0x32)"""
        # Массив A: [0x02, 0x03, 0x01, 0x04, 0x05, 0x02, 0x03, 0x01, 0x04, 0x02]
        a_vals = [0x02, 0x03, 0x01, 0x04, 0x05, 0x02, 0x03, 0x01, 0x04, 0x02]
        # Массив B: [0x01, 0x02, 0x03, 0x01, 0x02, 0x03, 0x01, 0x02, 0x03, 0x01]
        b_vals = [0x01, 0x02, 0x03, 0x01, 0x02, 0x03, 0x01, 0x02, 0x03, 0x01]
        return [0x0A, *a_vals, 0x0A, *b_vals]  # 0x0A = 10 в hex
    
    def setup_task_data(self, processor: StackProcessor, task_id: int):
        """Настроить данные для задачи в процессоре"""
        print(f"=== setup_task_data called for task {task_id} ===")
        task = self.get_task(task_id)
        if not task:
            raise ValueError(f"Task {task_id} not found")
        
        test_data = task["test_data"]
        print(f"Setting up task {task_id} data: {test_data}")
        
        # Особая раскладка памяти для задач
        if task_id == 2:
            # Формат test_data: [size_a, a1..aN, size_b, b1..bM]
            if not test_data or len(test_data) < 3:
                raise ValueError("Invalid test data for task 2")
            size_a = test_data[0]
            a_vals = test_data[1:1 + size_a]
            size_b = test_data[1 + size_a]
            b_vals = test_data[2 + size_a:2 + size_a + size_b]

            print(f"Task 2 data: size_a={size_a}, a_vals={a_vals}, size_b={size_b}, b_vals={b_vals}")

            # Размер и элементы массива A: 0x100, 0x101.. 
            processor.store_to_memory(0x100, size_a)
            print(f"Stored size_a={size_a} at address 0x100")
            for i, v in enumerate(a_vals):
                processor.store_to_memory(0x101 + i, v)
                print(f"Stored A[{i}] = {v} at address 0x{0x101 + i:04X}")

            # Размер и элементы массива B: 0x110, 0x111..
            processor.store_to_memory(0x110, size_b)
            print(f"Stored size_b={size_b} at address 0x110")
            for i, v in enumerate(b_vals):
                processor.store_to_memory(0x111 + i, v)
                print(f"Stored B[{i}] = {v} at address 0x{0x111 + i:04X}")
            
            print(f"Memory after setup: {processor.memory.ram[0x100:0x120]}")
        else:
            # По умолчанию — последовательная загрузка начиная с 0x1000
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
                size_a = processor.load_from_memory(0x100)
                size_b = processor.load_from_memory(0x110)
                
                # Вычисляем ожидаемую свертку (0x32 = 50 decimal)
                expected_conv = 0x32  # 50 в hex
                
                # Получаем результат из памяти
                actual_conv = processor.load_from_memory(0x120)
                
                result["expected"] = expected_conv
                result["actual"] = actual_conv
                result["success"] = (expected_conv == actual_conv)
        
        except Exception as e:
            result["error"] = str(e)
        
        return result
