# Gunakan base image node versi terbaru
FROM node:18.19-alpine3.18 AS build

WORKDIR /app

COPY package*.json ./

RUN npm install -g npm@latest && \
    npm install && \
    npm cache clean --force

RUN npm install bcrypt

COPY . .

# RUN npx prisma generate

EXPOSE 5000

CMD ["node", "index.js"]