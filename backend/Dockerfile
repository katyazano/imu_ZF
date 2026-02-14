FROM node:24-alpine

WORKDIR /app

# Instalar dependencias
COPY package*.json ./
RUN npm install

# Copiar el esquema de Prisma y generar el cliente
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar el resto del código
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]