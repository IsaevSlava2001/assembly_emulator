"""
Эмулятор безадресной стековой архитектуры
"""
from typing import List, Dict, Optional, Any
from enum import Enum
from dataclasses import dataclass, field

class OpCode(Enum):
    """Коды операций для безадресной стековой архитектуры"""
    # Арифметические операции (безадресные)
    ADD = 0x01      # сложение: pop b, pop a, push(a+b)
    SUB = 0x02      # вычитание: pop b, pop a, push(a-b)
    MUL = 0x03      # умножение: pop b, pop a, push(a*b)
    DIV = 0x04      # деление: pop b, pop a, push(a/b), push(a%b)

    # Логические операции
    AND = 0x05      # логическое И
    OR = 0x06       # логическое ИЛИ
    XOR = 0x07      # исключающее ИЛИ
    NOT = 0x08      # логическое НЕ

    # Операции сравнения
    CMP = 0x09      # сравнение: pop b, pop a, установить флаги

    # Стековые операции
    PUSH = 0x10     # push значение на стек
    POP = 0x11      # pop значение со стека
    DUP = 0x12      # дублировать вершину стека
    SWAP = 0x13     # поменять местами два верхних элемента

    # Операции с памятью
    LOAD = 0x20     # загрузить из памяти данных: pop addr, push [addr]
    STORE = 0x21    # сохранить в память данных: pop value, pop addr, [addr] = value

    # Операции перехода
    JMP = 0x30      # безусловный переход
    JZ = 0x31       # переход если zero flag
    JNZ = 0x32      # переход если не zero flag
    JL = 0x33       # переход если less flag
    JG = 0x34       # переход если greater flag
    JLE = 0x35      # переход если less or equal
    JGE = 0x36      # переход если greater or equal

    # Системные операции
    HALT = 0x99     # остановка выполнения
    NOP = 0x00      # нет операции

@dataclass
class ExecutionState:
    """Состояние выполнения программы"""
    stack: List[int] = field(default_factory=list)  # Стек данных
    data_memory: List[int] = field(default_factory=lambda: [0] * 30)  # Память данных
    instruction_memory: List[int] = field(default_factory=lambda: [0] * 30)  # Память команд
    instruction_preview: List[int] = field(default_factory=lambda: [0] * 30)  # Память команд в формате 0x...
    pc: int = 0  # Program Counter (указатель команд)
    sp: int = -1  # Stack Pointer (указатель стека)
    flags: Dict[str, bool] = field(default_factory=lambda: {
        'zero': False, 'negative': False, 'overflow': False, 'carry': False
    })
    halted: bool = False
    error: Optional[str] = None
    cycles: int = 0

    def push(self, value: int):
        """Поместить значение на стек"""
        self.stack.append(value)
        self.sp += 1

    def pop(self) -> int:
        """Извлечь значение со стека"""
        if not self.stack:
            raise RuntimeError("Stack underflow")
        self.sp -= 1
        return self.stack.pop()

    def peek(self) -> int:
        """Посмотреть значение на вершине стека без извлечения"""
        if not self.stack:
            raise RuntimeError("Stack is empty")
        return self.stack[-1]

    def set_flags(self, value: int):
        """Установить флаги на основе значения"""
        self.flags['zero'] = value == 0
        self.flags['negative'] = value < 0
        # Упрощенная логика для overflow и carry
        self.flags['overflow'] = abs(value) > 2**31 - 1
        self.flags['carry'] = value < 0

class StackEmulator:
    """Эмулятор безадресной стековой архитектуры"""

    def __init__(self):
        self.reset()

    def reset(self):
        """Сброс эмулятора в начальное состояние"""
        self.state = ExecutionState()

    def load_program(self, instructions: List[int]):
        """Загрузить программу в память команд"""
        self.state.instruction_memory = instructions.copy()
        self.state.instruction_preview = [hex(x) for x in self.state.instruction_memory[:5]] if self.state.instruction_memory else []
        self.state.pc = 0

    def load_data(self, data: List[int], start_addr: int = 0):
        """Загрузить данные в память данных"""
        for i, value in enumerate(data):
            if start_addr + i < len(self.state.data_memory):
                self.state.data_memory[start_addr + i] = value

    def step(self) -> bool:
        """Выполнить одну инструкцию. Возвращает True если выполнение продолжается"""
        if self.state.halted or self.state.pc >= len(self.state.instruction_memory):
            return False

        try:
            instruction = self.state.instruction_memory[self.state.pc]
            opcode = OpCode(instruction & 0xFF)  # Младший байт - код операции
            operand = instruction >> 8  # Старшие байты - операнд (если нужен)

            self.state.cycles += 1
            self.state.pc += 1

            self._execute_instruction(opcode, operand)

            return not self.state.halted

        except Exception as e:
            self.state.error = str(e)
            self.state.halted = True
            return False

    def _execute_instruction(self, opcode: OpCode, operand: int):
        """Выполнить конкретную инструкцию"""

        if opcode == OpCode.PUSH:
            self.state.push(operand)

        elif opcode == OpCode.POP:
            if self.state.stack:
                self.state.pop()

        elif opcode == OpCode.DUP:
            if self.state.stack:
                value = self.state.peek()
                self.state.push(value)

        elif opcode == OpCode.SWAP:
            if len(self.state.stack) >= 2:
                a = self.state.pop()
                b = self.state.pop()
                self.state.push(a)
                self.state.push(b)

        elif opcode == OpCode.ADD:
            if len(self.state.stack) >= 2:
                b = self.state.pop()
                a = self.state.pop()
                result = a + b
                self.state.push(result)
                self.state.set_flags(result)

        elif opcode == OpCode.SUB:
            if len(self.state.stack) >= 2:
                b = self.state.pop()
                a = self.state.pop()
                result = a - b
                self.state.push(result)
                self.state.set_flags(result)

        elif opcode == OpCode.MUL:
            if len(self.state.stack) >= 2:
                b = self.state.pop()
                a = self.state.pop()
                result = a * b
                self.state.push(result)
                self.state.set_flags(result)
            else:
                raise RuntimeError("not enough items")

        elif opcode == OpCode.DIV:
            if len(self.state.stack) >= 2:
                b = self.state.pop()
                a = self.state.pop()
                if b == 0:
                    raise RuntimeError("Division by zero")
                quotient = a // b
                remainder = a % b
                self.state.push(quotient)
                self.state.push(remainder)
                self.state.set_flags(quotient)

        elif opcode == OpCode.AND:
            if len(self.state.stack) >= 2:
                b = self.state.pop()
                a = self.state.pop()
                result = a & b
                self.state.push(result)
                self.state.set_flags(result)

        elif opcode == OpCode.OR:
            if len(self.state.stack) >= 2:
                b = self.state.pop()
                a = self.state.pop()
                result = a | b
                self.state.push(result)
                self.state.set_flags(result)

        elif opcode == OpCode.XOR:
            if len(self.state.stack) >= 2:
                b = self.state.pop()
                a = self.state.pop()
                result = a ^ b
                self.state.push(result)
                self.state.set_flags(result)

        elif opcode == OpCode.NOT:
            if self.state.stack:
                a = self.state.pop()
                result = ~a
                self.state.push(result)
                self.state.set_flags(result)

        elif opcode == OpCode.CMP:
            if len(self.state.stack) >= 2:
                b = self.state.pop()
                a = self.state.peek()
                result = a - b
                self.state.set_flags(result)

        elif opcode == OpCode.LOAD:
            if self.state.stack:
                addr = self.state.pop()
                if 0 <= addr < len(self.state.data_memory):
                    value = self.state.data_memory[addr]
                    self.state.push(value)
                else:
                    raise RuntimeError(f"Invalid memory address: {addr}")

        elif opcode == OpCode.STORE:
            if len(self.state.stack) >= 2:
                value = self.state.pop()
                addr = self.state.pop()
                if 0 <= addr < len(self.state.data_memory):
                    self.state.data_memory[addr] = value
                else:
                    raise RuntimeError(f"Invalid memory address: {addr}")

        elif opcode == OpCode.JMP:
            self.state.pc = operand

        elif opcode == OpCode.JZ:
            if self.state.flags['zero']:
                self.state.pc = operand

        elif opcode == OpCode.JNZ:
            if not self.state.flags['zero']:
                self.state.pc = operand

        elif opcode == OpCode.JL:
            if self.state.flags['negative']:
                self.state.pc = operand

        elif opcode == OpCode.JG:
            if not self.state.flags['negative'] and not self.state.flags['zero']:
                self.state.pc = operand

        elif opcode == OpCode.JLE:
            if self.state.flags['negative'] or self.state.flags['zero']:
                self.state.pc = operand

        elif opcode == OpCode.JGE:
            if not self.state.flags['negative']:
                self.state.pc = operand

        elif opcode == OpCode.HALT:
            self.state.halted = True

        elif opcode == OpCode.NOP:
            pass  # Ничего не делаем

        else:
            raise RuntimeError(f"Unknown opcode: {opcode}")

    def run_until_halt(self, max_cycles: int = 10000) -> Dict[str, Any]:
        """Выполнить программу до остановки или превышения лимита циклов"""
        cycles = 0
        while cycles < max_cycles and self.step():
            cycles += 1

        return self.get_state()

    def get_state(self) -> Dict[str, Any]:
        """Получить текущее состояние эмулятора"""
        return {
            'stack': self.state.stack.copy(),  # ИСПРАВЛЕНО
            'data_memory': self.state.data_memory[:50],
            'instruction_memory': self.state.instruction_memory,
            'instruction_preview': [hex(x) for x in self.state.instruction_memory],  # ДОБАВЛЕНО
            'pc': self.state.pc,
            'sp': self.state.sp,
            'flags': self.state.flags.copy(),
            'halted': self.state.halted,
            'error': self.state.error,
            'cycles': self.state.cycles
        }

