FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm

ENV CI=true
# RUN pnpm install --frozen-lockfile # <-- Закомментируем

COPY . .

# Установим зависимости заново в контейнере
RUN pnpm install --no-frozen-lockfile

RUN cd packages/event-bus && pnpm run build

RUN cd packages/microfrontends/dashboard-mf && pnpm run build

FROM nginx:alpine AS production
# Копируем наш кастомный конфиг nginx ВМЕСТО стандартного
# (стандартный находится в /etc/nginx/conf.d/default.conf, наш заменит его)
COPY --from=builder /app/packages/microfrontends/dashboard-mf/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/packages/microfrontends/dashboard-mf/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]