# Backend для эмулятора стекового процессора

## Описание

Backend реализует эмулятор стекового процессора с Гарвардской архитектурой на Python + FastAPI.

## Особенности

- **Стековая архитектура**: Все операции выполняются над данными на стеке
- **Гарвардская архитектура**: Раздельная память для команд и данных
- **Ассемблер**: Преобразование мнемокода в машинные инструкции
- **Предустановленные задачи**: Сумма массива и свертка массивов
- **REST API**: Полный набор endpoints для фронтенда

## Установка

```bash
cd assembly_emulator/backend
pip install -r requirements.txt
```

## Запуск

### Простой запуск
```bash
python run.py
```

### Через uvicorn
```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

### Через модуль Python
```bash
python -m app.main
```

После запуска сервер будет доступен по адресу: **http://localhost:8000**

## Документация API

- **Swagger UI (интерактивная документация):** http://localhost:8000/docs
- **ReDoc (альтернативная документация):** http://localhost:8000/redoc
- **JSON схема API:** http://localhost:8000/openapi.json

## API Endpoints

### Основные
- `GET /` - Корневой endpoint
- `GET /api/state` - Получить состояние эмулятора
- `POST /api/compile` - Скомпилировать код
- `POST /api/execute` - Выполнить код
- `POST /api/step` - Выполнить один шаг
- `POST /api/reset` - Сбросить процессор

### Задачи
- `GET /api/tasks` - Получить список задач
- `GET /api/tasks/{task_id}` - Получить информацию о задаче
- `GET /api/tasks/{task_id}/program` - Получить программу задачи

## Поддерживаемые инструкции

### Пересылка данных
- `PUSH <value>` - поместить значение на стек
- `POP` - извлечь значение со стека
- `DUP` - дублировать верхний элемент стека
- `SWAP` - поменять местами два верхних элемента

### Арифметические операции
- `ADD` - сложение
- `SUB` - вычитание
- `MUL` - умножение
- `DIV` - деление
- `INC` - инкремент
- `DEC` - декремент

### Работа с памятью
- `LOAD` - загрузить из памяти
- `STORE` - сохранить в память

### Управление выполнением
- `JMP <label>` - безусловный переход
- `JZ <label>` - переход если ноль
- `JNZ <label>` - переход если не ноль
- `HALT` - остановка выполнения

## Пример использования

### Через браузер
1. Откройте http://localhost:8000/docs
2. Используйте интерактивный интерфейс Swagger UI для тестирования API

### Через Python
```python
import requests

# Получить состояние
response = requests.get("http://localhost:8000/api/state")
state = response.json()

# Выполнить задачу
response = requests.post("http://localhost:8000/api/execute", 
                        json={"task_id": 1})
result = response.json()
```

### Через curl
```bash
# Получить состояние
curl http://localhost:8000/api/state

# Выполнить задачу
curl -X POST http://localhost:8000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"task_id": 1}'
```

## Быстрый старт

1. **Установите зависимости:**
   ```bash
   pip install -r requirements.txt
   ```

2. **Запустите сервер:**
   ```bash
   python run.py
   ```

3. **Откройте документацию:**
   - http://localhost:8000/docs - Swagger UI
   - http://localhost:8000/redoc - ReDoc

4. **Протестируйте API:**
   - http://localhost:8000/api/state - состояние эмулятора
   - http://localhost:8000/api/tasks - список задач

## Структура проекта

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py          # FastAPI приложение
│   ├── models.py        # Pydantic модели
│   ├── processor.py     # Эмулятор процессора
│   ├── assembler.py     # Ассемблер
│   └── tasks.py         # Предустановленные задачи
├── run.py               # Скрипт запуска
├── requirements.txt
└── README.md
```