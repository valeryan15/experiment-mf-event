FROM node:20-alpine AS builder

WORKDIR /app

# Скопируем pnpm-lock.yaml из корня монорепозитория
COPY pnpm-lock.yaml ./
# Скопируем package.json и tsconfig.json для host-server
COPY packages/host-server/package.json packages/host-server/tsconfig.json ./

# Установим pnpm
RUN npm install -g pnpm

# Установим ТОЛЬКО dependencies и devDependencies для host-server
# Из-за несоответствия конфигурации pnpm используем --no-frozen-lockfile
ENV CI=true
 # pnpm найдёт package.json в /app и разрешит зависимости
RUN pnpm install --no-frozen-lockfile

# Скопируем исходный код host-server
COPY packages/host-server ./packages/host-server

# Собираем host-server из корня (/app), указав путь к tsconfig.json (опционально)
# pnpm --filter может не сработать без pnpm-workspace.yaml, но package.json есть
# Попробуем запустить скрипт build напрямую из директории пакета
RUN cd packages/host-server && pnpm run build
# Альтернатива: RUN npx tsc --project tsconfig.json (если tsc установлен в корне или пакете)

# --- Production Stage ---
FROM node:20-alpine AS production

WORKDIR /app

# Скопируем package.json host-server и pnpm-lock.yaml
COPY --from=builder /app/package.json ./
COPY --from=builder /app/pnpm-lock.yaml ./

# Установим pnpm
RUN npm install -g pnpm

# Установим ТОЛЬКО production зависимости для host-server
ENV NODE_ENV=production
RUN pnpm install --prod --frozen-lockfile

# Скопируем скомпилированный код host-server из builder stage
COPY --from=builder /app/packages/host-server/dist ./dist

EXPOSE 3001

CMD ["node", "dist/server.js"]