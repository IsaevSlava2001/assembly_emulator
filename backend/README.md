# Это папка бэкенда
Для запуска отдельно бэкенда можно использовать два пути:
- Docker
- Ручной запуск
## Docker
    1. run `docker build -t fastapi-app .`
    2. run `docker run -d --name fastapi-container -p 80:8000 fastapi-app`
## Ручной запуск
    1.  run `pip install requirements.txt`
    2.  uvicorn main:app --reload