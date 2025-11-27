# ---- Build stage ----
FROM node:22-alpine AS builder

# Create app directory
WORKDIR /usr/src/app

# Install dependencies (only package*.json first to leverage Docker cache)
COPY package*.json ./
# If you use pnpm or yarn, adjust this command
RUN npm install --production=false

# Copy the rest of the source code
COPY . .

# Build the NestJS app
RUN npm run build

# ---- Production stage ----
FROM node:22-alpine AS runner

WORKDIR /usr/src/app
ENV NODE_ENV=production

# Only install production dependencies
COPY package*.json ./
RUN npm install --only=production

# Copy built files from builder
COPY --from=builder /usr/src/app/dist ./dist

# Expose Nest default port
EXPOSE 3000

# Run the app
CMD ["node", "dist/main.js"]