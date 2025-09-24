# Это папка бэкенда
Для запуска отдельно бэкенда можно использовать два пути:
- Docker
- Ручной запуск
## Docker
run
1. `docker build -t fastapi-app`
2. `docker run -d --name fastapi-container -p 80:8000 fastapi-app`
## Ручной запуск
run
1. `pip install requirements.txt`
2. `uvicorn app.main:app --reload`
