FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies (including dev dependencies for build)
RUN npm ci

# Copy source code
COPY . .

# Build the Next.js application
RUN npm run build

# Keep TypeScript and essential dev dependencies that Next.js needs at runtime
RUN npm prune --production && npm install typescript

# Expose port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]