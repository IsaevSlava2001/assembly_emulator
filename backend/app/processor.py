"""
Эмулятор стекового процессора с Гарвардской архитектурой
"""
from typing import List, Dict, Any, Optional
from .models import ProcessorState, MemoryState

class StackProcessor:
    """Эмулятор стекового процессора"""
    
    def __init__(self, memory_size: int = 4096):
        self.memory_size = memory_size
        self.processor = ProcessorState()
        self.memory = MemoryState()
        self.memory.ram = [0] * memory_size
        self.program_memory = [0] * memory_size  # Память команд
        self.labels = {}  # Метки для переходов
        
    def reset(self):
        """Сброс процессора в начальное состояние"""
        self.processor = ProcessorState()
        self.memory = MemoryState()
        self.memory.ram = [0] * self.memory_size
        self.program_memory = [0] * self.memory_size
        self.labels = {}
    
    def push(self, value: int):
        """Поместить значение на стек"""
        if len(self.processor.stack) >= 256:  # Ограничение стека
            raise Exception("Stack overflow")
        self.processor.stack.append(value)
    
    def pop(self) -> int:
        """Извлечь значение со стека"""
        if not self.processor.stack:
            raise Exception("Stack underflow")
        return self.processor.stack.pop()
    
    def peek(self) -> int:
        """Посмотреть верхний элемент стека без извлечения"""
        if not self.processor.stack:
            raise Exception("Stack is empty")
        return self.processor.stack[-1]
    
    def _parse_operand(self, operand_str: str) -> int:
        """Парсинг операнда с поддержкой разных форматов чисел"""
        return self._parse_number(operand_str)
    
    def _parse_number(self, value: str) -> int:
        """
        Парсит числовые значения в разных форматах:
        - Десятичные: 100, 255
        - Шестнадцатеричные: 0x100, 0xFF
        - Двоичные: 0b1010 (опционально)
        """
        value = value.strip().lower()
        
        if value.startswith('0x'):
            # Шестнадцатеричный формат
            return int(value[2:], 16)
        elif value.startswith('0b'):
            # Двоичный формат (опционально)
            return int(value[2:], 2)
        else:
            # Десятичный формат по умолчанию
            return int(value)
    
    def load_from_memory(self, address: int) -> int:
        """Загрузить значение из памяти"""
        if 0 <= address < self.memory_size:
            return self.memory.ram[address]
        return 0
    
    def store_to_memory(self, address: int, value: int):
        """Сохранить значение в память"""
        if 0 <= address < self.memory_size:
            self.memory.ram[address] = value
    
    def update_flags(self, result: int):
        """Обновить флаги после операции"""
        self.processor.flags["zero"] = (result == 0)
        self.processor.flags["carry"] = (result < 0)  # Упрощенная логика
        self.processor.flags["overflow"] = (result > 32767 or result < -32768)
    
    def execute_instruction(self, instruction: str, operand: Optional[int] = None):
        """Выполнить одну инструкцию"""
        instruction = instruction.upper().strip()
        
        if instruction == "PUSH":
            if operand is not None:
                self.push(operand)
            else:
                raise Exception("PUSH requires operand")
        
        elif instruction == "POP":
            self.pop()
        
        elif instruction == "DUP":
            if self.processor.stack:
                self.push(self.peek())
            else:
                raise Exception("Cannot DUP empty stack")
        
        elif instruction == "SWAP":
            if len(self.processor.stack) >= 2:
                a = self.pop()
                b = self.pop()
                self.push(a)
                self.push(b)
            else:
                raise Exception("Cannot SWAP with less than 2 elements")
        
        elif instruction == "ROT":
            if len(self.processor.stack) >= 3:
                c = self.pop()  # Третий элемент (верхний)
                b = self.pop()  # Второй элемент
                a = self.pop()  # Первый элемент (нижний)
                # Ротация: [a, b, c] → [b, c, a]
                self.push(b)
                self.push(c)
                self.push(a)
            else:
                raise Exception("Cannot ROT with less than 3 elements")
        
        elif instruction == "ADD":
            if len(self.processor.stack) >= 2:
                b = self.pop()
                a = self.pop()
                result = a + b
                self.update_flags(result)
                self.push(result)
            else:
                raise Exception("ADD requires 2 operands on stack")
        
        elif instruction == "SUB":
            if len(self.processor.stack) >= 2:
                b = self.pop()
                a = self.pop()
                result = a - b
                self.update_flags(result)
                self.push(result)
            else:
                raise Exception("SUB requires 2 operands on stack")
        
        elif instruction == "MUL":
            if len(self.processor.stack) >= 2:
                b = self.pop()
                a = self.pop()
                result = a * b
                self.update_flags(result)
                self.push(result)
            else:
                raise Exception("MUL requires 2 operands on stack")
        
        elif instruction == "DIV":
            if len(self.processor.stack) >= 2:
                b = self.pop()
                a = self.pop()
                if b == 0:
                    raise Exception("Division by zero")
                result = a // b
                self.update_flags(result)
                self.push(result)
            else:
                raise Exception("DIV requires 2 operands on stack")
        
        elif instruction == "INC":
            if self.processor.stack:
                value = self.pop()
                result = value + 1
                self.update_flags(result)
                self.push(result)
            else:
                raise Exception("INC requires operand on stack")
        
        elif instruction == "DEC":
            if self.processor.stack:
                value = self.pop()
                result = value - 1
                self.update_flags(result)
                self.push(result)
            else:
                raise Exception("DEC requires operand on stack")
        
        elif instruction == "LOAD":
            if self.processor.stack:
                address = self.pop()
                value = self.load_from_memory(address)
                self.push(value)
            else:
                raise Exception("LOAD requires address on stack")
        
        elif instruction == "STORE":
            if len(self.processor.stack) >= 2:
                address = self.pop()
                value = self.pop()
                self.store_to_memory(address, value)
            else:
                raise Exception("STORE requires address and value on stack")
        
        elif instruction == "JMP":
            if operand is not None:
                self.processor.program_counter = operand
            else:
                raise Exception("JMP requires operand")
        
        elif instruction == "JZ":
            if operand is not None and self.processor.flags["zero"]:
                self.processor.program_counter = operand
            elif operand is not None:
                self.processor.program_counter += 1
            else:
                raise Exception("JZ requires operand")
        
        elif instruction == "JNZ":
            if operand is not None and not self.processor.flags["zero"]:
                self.processor.program_counter = operand
            elif operand is not None:
                self.processor.program_counter += 1
            else:
                raise Exception("JNZ requires operand")
        
        elif instruction == "HALT":
            self.processor.is_halted = True
        
        else:
            raise Exception(f"Unknown instruction: {instruction}")
        
        # Увеличиваем счетчик команд, если не было перехода
        if instruction not in ["JMP", "JZ", "JNZ"]:
            self.processor.program_counter += 1
    
    def step(self) -> bool:
        """Выполнить один шаг программы. Возвращает True если выполнение продолжается"""
        if self.processor.is_halted:
            return False
        
        # Получаем следующую инструкцию из скомпилированного кода
        if not hasattr(self, 'compiled_code') or not self.compiled_code:
            return False
        
        if self.processor.program_counter >= len(self.compiled_code):
            self.processor.is_halted = True
            return False
        
        # Получаем инструкцию
        instruction_line = self.compiled_code[self.processor.program_counter]
        parts = instruction_line.split()
        instruction = parts[0]
        operand = self._parse_operand(parts[1]) if len(parts) > 1 else None
        
        # Сохраняем текущую команду для отображения
        self.processor.current_command = instruction_line
        
        # Выполняем инструкцию
        try:
            self.execute_instruction(instruction, operand)
            
            # Сохраняем состояние в историю
            self.memory.history.append({
                'command': instruction_line,
                'stack': self.processor.stack.copy(),
                'programCounter': self.processor.program_counter,
                'flags': self.processor.flags.copy()
            })
            
            return not self.processor.is_halted
            
        except Exception as e:
            self.processor.is_halted = True
            self.processor.current_command = f"ERROR: {str(e)}"
            return False
    
    def load_program(self, compiled_code: List[str], source_code: str = ""):
        """Загрузить скомпилированную программу"""
        self.compiled_code = compiled_code
        self.source_code = source_code
        self.processor.program_counter = 0
        self.processor.is_halted = False
        self.processor.current_command = ""
        self.memory.history = []
    
    def get_state(self) -> Dict[str, Any]:
        """Получить текущее состояние процессора"""
        return {
            "processor": {
                "program_counter": self.processor.program_counter,
                "stack": self.processor.stack.copy(),
                "flags": self.processor.flags,
                "current_command": self.processor.current_command,
                "is_halted": self.processor.is_halted
            },
            "memory": {
                "ram": self.memory.ram.copy(),
                "history": self.memory.history.copy()
            },
            "source_code": getattr(self, 'source_code', ''),
            "machine_code": getattr(self, 'compiled_code', []),
            "current_task": None
        }
