# ETAPA 1: Construcción (Build) con Node.js
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
# Compila el proyecto de Vite a la carpeta /dist
RUN npm run build

# ETAPA 2: Servidor de Producción con Nginx
FROM nginx:alpine
# Copiamos la carpeta /dist de la etapa anterior al servidor Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Opcional pero recomendado para React Router: 
# Redirige todo el tráfico al index.html para evitar errores 404 al recargar la página
RUN echo "server { listen 80; location / { root /usr/share/nginx/html; index index.html index.htm; try_files \$uri \$uri/ /index.html; } }" > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]