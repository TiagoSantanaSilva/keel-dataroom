# Use Node.js 20
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-slim
WORKDIR /app
RUN mkdir -p uploads data
COPY --from=builder /app/node_modules ./node_modules
COPY . .
EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "src/index.js"]