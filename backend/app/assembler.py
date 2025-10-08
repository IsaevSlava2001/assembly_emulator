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
    
    def parse_line(self, line: str) -> Tuple[Optional[str], Optional[str], Optional[int]]:
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
                if address_str.startswith('0x'):
                    operand = int(address_str, 16)
                else:
                    operand = int(address_str)
            elif operand_str.startswith('0x'):
                # Шестнадцатеричное число
                operand = int(operand_str, 16)
            else:
                # Обычное число
                operand = int(operand_str)
        
        return label, instruction, operand
    
    def assemble(self, source_code: str) -> Tuple[List[str], Dict[str, int]]:
        """Ассемблирование исходного кода"""
        lines = source_code.split('\n')
        machine_code = []
        labels = {}
        
        # Первый проход: сбор меток
        for i, line in enumerate(lines):
            label, instruction, operand = self.parse_line(line)
            if label:
                labels[label] = i
            if instruction:
                machine_code.append(f"{instruction} {operand}" if operand is not None else instruction)
        
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
                    resolved_code.append(f"{instruction} {operand}")
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
