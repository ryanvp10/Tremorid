FROM node:20-slim

WORKDIR /app

# Install dependencies first (better caching)
COPY package*.json ./
RUN npm install --production

# Copy source
COPY . .

# Set env
ENV NODE_ENV=production
ENV HF_SPACE=1

# Expose port
EXPOSE 7860

# Start backend
CMD ["node", "src/server.js"]
