FROM node:24-alpine

WORKDIR /app

# 1. Copiar archivos de dependencias
COPY package*.json ./

# 2. Instalar TODO (incluyendo prisma y @prisma/client)
RUN npm install

# 3. Copiar configuración y esquema
COPY prisma ./prisma/

# 4. Generar el cliente de Prisma
RUN npx prisma generate

# 5. Copiar el resto del código
COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]