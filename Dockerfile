# 1) Imagen base para construir la app
FROM node:18-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build


# 2) Imagen liviana para servir los archivos
FROM nginx:alpine

# Copiamos el build estático al NGINX
COPY --from=build /app/dist /usr/share/nginx/html

# Copiamos un config de nginx que permite SPA routing
COPY ./nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 3000

CMD ["nginx", "-g", "daemon off;"]