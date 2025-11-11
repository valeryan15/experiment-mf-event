FROM node:20-alpine AS builder

WORKDIR /app

COPY package.json pnpm-lock.yaml ./
RUN npm install -g pnpm

ENV CI=true
# Установим зависимости с --frozen-lockfile, но не запускаем postinstall
# Попробуем установить заново *внутри* контейнера, чтобы получить правильные платформо-специфичные зависимости
# Уберём флаг --frozen-lockfile для установки в контейнере
# RUN pnpm install --frozen-lockfile # <-- Закомментируем предыдущую установку

COPY . .

# Установим зависимости заново в контейнере (альтернатива pnpm rebuild)
# Это может заново установить нативные модули под платформу контейнера
# Важно: это может изменить pnpm-lock.yaml, если зависимости отличаются между платформами
# Для воспроизводимости часто нужно использовать --frozen-lockfile, но в данном случае это конфликтует с alpine/musl
# Попробуем без --frozen-lockfile внутри контейнера
RUN pnpm install --no-frozen-lockfile

# Соберём event-bus (его .d.ts нужны host-app при сборке)
RUN cd packages/event-bus && pnpm run build

# Выполним сборку host-app
RUN cd packages/host-app && pnpm run build

# --- Production Stage ---
FROM nginx:alpine AS production

# Копируем наш кастомный конфиг nginx
COPY --from=builder /app/packages/host-app/nginx.conf /etc/nginx/conf.d/default.conf

COPY --from=builder /app/packages/host-app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]