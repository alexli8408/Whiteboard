FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 5858

CMD ["npx", "tsx", "src/index.ts"]
