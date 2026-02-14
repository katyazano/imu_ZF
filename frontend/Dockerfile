FROM node:24-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

# Vite usa el puerto 5173 por defecto
EXPOSE 5173

CMD ["npm", "run", "dev", "--", "--host"]