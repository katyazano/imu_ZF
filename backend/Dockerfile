# 1. Cambiamos de 'alpine' a 'slim' para evitar problemas con OpenSSL y Prisma
FROM node:18-slim

# 2. Instalamos OpenSSL manualmente por si acaso Prisma lo necesita
RUN apt-get update -y && apt-get install -y openssl

# Crea el directorio de trabajo en el contenedor
WORKDIR /app

# Copia los archivos de dependencias
COPY package*.json ./

# Instala las dependencias
RUN npm install

# Copia la carpeta de Prisma y genera el cliente
COPY prisma ./prisma/
RUN npx prisma generate

# Copia el resto del código del backend
COPY . .

# Expone el puerto donde corre tu API
EXPOSE 4000

# Comando para iniciar el servidor
CMD ["npm", "start"]