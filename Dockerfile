FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

ARG NPM_CONFIG_IGNORE_SCRIPTS=true
RUN npm ci --omit=dev && npm cache clean --force

RUN addgroup -S app && adduser -S app -G app && chown -R app:app /app
USER app

ENTRYPOINT ["node", "dist/index.js"]
