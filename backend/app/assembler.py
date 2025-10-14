"""
Ассемблер для преобразования кода в машинные инструкции
"""
import re
from typing import List, Dict, Tuple, Optional

class Assembler:
    """Ассемблер для стекового процессора"""
    
    def __init__(self):
        self.instructions = {
            'PUSH': 0x01,
            'POP': 0x02,
            'DUP': 0x03,
            'SWAP': 0x04,
            'ADD': 0x10,
            'SUB': 0x11,
            'MUL': 0x12,
            'DIV': 0x13,
            'INC': 0x14,
            'DEC': 0x15,
            'LOAD': 0x20,
            'STORE': 0x21,
            'JMP': 0x30,
            'JZ': 0x31,
            'JNZ': 0x32,
            'HALT': 0xFF
        }
    
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
    
    def parse_line(self, line: str, resolve_labels: bool = False, labels: Dict[str, int] = None) -> Tuple[Optional[str], Optional[str], Optional[int]]:
        """Парсинг строки ассемблера"""
        line = line.strip()
        
        # Пропускаем пустые строки и комментарии
        if not line or line.startswith(';'):
            return None, None, None
        
        # Удаляем комментарии
        if ';' in line:
            line = line[:line.index(';')].strip()
        
        # Парсим метки
        label = None
        if ':' in line:
            parts = line.split(':', 1)
            label = parts[0].strip()
            line = parts[1].strip()
        
        # Парсим инструкцию и операнд
        parts = line.split()
        if not parts:
            return label, None, None
        
        instruction = parts[0].upper()
        operand = None
        
        if len(parts) > 1:
            operand_str = parts[1]
            
            # Обработка операндов
            if operand_str.startswith('[') and operand_str.endswith(']'):
                # Загрузка из памяти [address]
                address_str = operand_str[1:-1]
                operand = self._parse_number(address_str)
            else:
                # Проверяем, является ли операнд меткой
                if resolve_labels and labels and operand_str in labels:
                    operand = labels[operand_str]
                elif not resolve_labels:
                    # В первом проходе пытаемся распарсить как число, иначе сохраняем как строку
                    try:
                        operand = self._parse_number(operand_str)
                    except ValueError:
                        # Если не число, то это метка
                        operand = operand_str
                else:
                    # Во втором проходе пытаемся распарсить как число
                    try:
                        operand = self._parse_number(operand_str)
                    except ValueError:
                        # Неизвестная метка или некорректный операнд
                        raise ValueError(f"Неизвестная метка или некорректный операнд: {operand_str}")
        
        return label, instruction, operand
    
    def _format_operand(self, instruction: str, operand) -> str:
        """Форматирование операнда для отображения"""
        if instruction in ['PUSH', 'LOAD', 'STORE', 'JMP', 'JZ', 'JNZ'] and operand is not None:
            # Для команд с адресами отображаем в шестнадцатеричном формате
            if isinstance(operand, int) and operand >= 0x1000:  # Если это адрес памяти
                return f"{instruction} 0x{operand:04X}"
            else:
                return f"{instruction} {operand}"
        elif operand is not None:
            return f"{instruction} {operand}"
        else:
            return instruction

    def assemble(self, source_code: str) -> Tuple[List[str], Dict[str, int]]:
        """Ассемблирование исходного кода"""
        lines = source_code.split('\n')
        machine_code = []
        labels = {}
        
        # Первый проход: сбор меток
        for i, line in enumerate(lines):
            label, instruction, operand = self.parse_line(line, resolve_labels=False)
            if label:
                labels[label] = i
            if instruction:
                # В первом проходе сохраняем как есть, форматирование будет во втором проходе
                if operand is not None:
                    machine_code.append(f"{instruction} {operand}")
                else:
                    machine_code.append(instruction)
        
        # Второй проход: замена меток на адреса
        resolved_code = []
        for i, instruction_line in enumerate(machine_code):
            parts = instruction_line.split()
            if len(parts) >= 2:
                instruction = parts[0]
                operand_str = parts[1]
                
                # Проверяем, является ли операнд меткой
                if operand_str in labels:
                    operand = labels[operand_str]
                    resolved_code.append(self._format_operand(instruction, operand))
                else:
                    resolved_code.append(instruction_line)
            else:
                resolved_code.append(instruction_line)
        
        return resolved_code, labels
    
    def disassemble(self, machine_code: List[str]) -> str:
        """Дизассемблирование машинного кода"""
        result = []
        for i, instruction in enumerate(machine_code):
            result.append(f"{i:04X}: {instruction}")
        return '\n'.join(result)
