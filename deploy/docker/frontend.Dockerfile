FROM node:22-alpine AS build

ARG VITE_API_BASE_URL=/api
ARG VITE_PROMO_VIDEO_URL=

ENV VITE_API_BASE_URL=$VITE_API_BASE_URL
ENV VITE_PROMO_VIDEO_URL=$VITE_PROMO_VIDEO_URL

WORKDIR /app

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ ./
RUN npm run build

FROM nginx:1.27-alpine

COPY deploy/docker/frontend-nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
