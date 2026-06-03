FROM node:20-slim

# Install build tools for native modules (better-sqlite3)
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source
COPY . .

# Set env
ENV NODE_ENV=production
ENV HF_SPACE=1

# Expose port
EXPOSE 7860

# Start backend
CMD ["node", "src/server.js"]
