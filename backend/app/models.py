from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from enum import Enum

class FlagType(str, Enum):
    ZERO = "zero"
    CARRY = "carry"
    OVERFLOW = "overflow"

class ProcessorState(BaseModel):
    """Состояние процессора"""
    program_counter: int = 0
    stack: List[int] = []
    flags: Dict[FlagType, bool] = {
        FlagType.ZERO: False,
        FlagType.CARRY: False,
        FlagType.OVERFLOW: False
    }
    current_command: str = ""
    is_halted: bool = False

class MemoryState(BaseModel):
    """Состояние памяти"""
    ram: List[int] = []
    history: List[Dict[str, Any]] = []

class EmulatorState(BaseModel):
    """Общее состояние эмулятора"""
    processor: ProcessorState
    memory: MemoryState
    source_code: str = ""
    machine_code: List[str] = []
    current_task: Optional[int] = None

class TaskInfo(BaseModel):
    """Информация о задаче"""
    id: int
    title: str
    description: str

class CompileRequest(BaseModel):
    """Запрос на компиляцию кода"""
    source_code: str

class ExecuteRequest(BaseModel):
    """Запрос на выполнение"""
    task_id: Optional[int] = None
    step_by_step: bool = False

class ResetRequest(BaseModel):
    """Запрос на сброс"""
    pass

class TaskData(BaseModel):
    """Данные для задачи"""
    array_a: List[int]
    array_b: Optional[List[int]] = None
    result_address: int = 0x1100
