FROM node:18-alpine

WORKDIR /app

# Копируем package файлы
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код
COPY . .

# Открываем порт
EXPOSE 5173

# Запускаем dev сервер
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
