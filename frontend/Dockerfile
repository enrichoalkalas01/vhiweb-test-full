# Use node:18-alpine as base for the builder
FROM node:18-alpine AS builder

# Set the work directory
WORKDIR /app

# Copy only necessary files to leverage caching
COPY package.json package-lock.json next.config.mjs ./

# Install all dependencies (including devDependencies for build)
RUN npm install

# Copy the rest of the application source code
COPY . .

# Build the Next.js app
RUN npm run build

# Production image
FROM node:18-alpine

# Set work directory
WORKDIR /app

# Copy only the built application and necessary files from the builder stage
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
COPY --from=builder /app/package-lock.json ./package-lock.json
COPY --from=builder /app/next.config.mjs ./next.config.mjs

# Install only production dependencies
RUN npm install --only=production --frozen-lockfile

# Expose the port used by the Next.js application
EXPOSE 3000

# Start the application
CMD ["npm", "start"]
