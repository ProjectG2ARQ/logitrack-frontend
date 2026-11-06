# Etapa 1: Build de la aplicación Angular con Node 26
FROM node:26-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install --legacy-peer-deps

COPY . .
RUN npm run build -- --configuration production

# Etapa 2: Servidor web liviano de producción
FROM nginx:alpine

# Copia los archivos estáticos generados por el build
COPY --from=build /app/dist/logitrack-frontend/browser /usr/share/nginx/html

# Configuración de Nginx para soportar enrutamiento de SPA
RUN echo 'server { \
    listen 80; \
    location / { \
        root /usr/share/nginx/html; \
        index index.html index.htm; \
        try_files $uri $uri/ /index.html; \
    } \
}' > /etc/nginx/conf.d/default.conf

EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
