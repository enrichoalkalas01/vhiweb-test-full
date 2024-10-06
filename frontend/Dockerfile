# Gunakan image Node.js sebagai base image
FROM node:18-alpine AS builder

# Set work directory
WORKDIR /app

# Copy package.json dan package-lock.json
COPY package.json package-lock.json ./

COPY next.config.mjs ./

# Install dependencies
RUN npm install --only=production

# Copy seluruh source code
COPY . .

# Install dependencies untuk development
RUN npm install

# Build aplikasi
RUN npm run build

# Tahap kedua untuk image final
FROM node:18-alpine

# Set work directory
WORKDIR /app

# Copy hasil build dari tahap pertama
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/next.config.mjs ./

# Install hanya production dependencies
RUN npm install --only=production

# Expose port yang digunakan oleh aplikasi Next.js
EXPOSE 3000

# Jalankan aplikasi
CMD ["npm", "start"]