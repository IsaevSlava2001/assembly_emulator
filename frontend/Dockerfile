# Используем базовый образ Node.js
FROM node:20-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем файлы package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем все файлы проекта внутрь контейнера
COPY . .

RUN npm i
# Собираем приложение React
RUN npm run build

# Устанавливаем сервер статических файлов
RUN npm install -g serve

EXPOSE 3000

CMD ["serve", "-s", "dist"]