# Use Node.js 20
FROM node:20-slim AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

FROM node:20-slim
WORKDIR /app

# Create necessary directories
RUN mkdir -p data uploads public/assets/icons public/css

# Copy dependencies from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy application files
COPY . .

EXPOSE 3000
ENV NODE_ENV=production
CMD ["node", "src/index.js"]