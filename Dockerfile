FROM node:20-bookworm-slim

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run prisma:generate

EXPOSE 3000

CMD ["sh", "-c", "npm run migrate:deploy && npm start"]
