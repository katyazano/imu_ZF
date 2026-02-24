FROM node:22-alpine

# Instalar OpenSSL (Requerido por Prisma en Alpine Linux)
RUN apk add --no-cache openssl

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

CMD ["node", "src/index.js"]