FROM node:22-alpine

WORKDIR /app

RUN addgroup -g 1001 appgroup && adduser -u 1001 -G appgroup -s /bin/sh -D appuser

COPY package*.json ./
RUN npm install --production

COPY --chown=appuser:appgroup . .

USER appuser

EXPOSE 3000

CMD ["node", "server.js"]