# =============================================================================
# Stage 1 — Build Next.js frontend as static files
# =============================================================================
FROM node:18.19-alpine3.18 AS frontend-builder

WORKDIR /frontend

COPY frontend/package*.json ./
RUN npm install

COPY frontend/ .

# Pass at build time via --build-arg:
#   Local Docker  : defaults below (served at /)
#   Kubernetes    : --build-arg NEXT_BASE_PATH=/portofolio/show/vhiweb-test-full
#                   --build-arg NEXT_PUBLIC_BASE_URL_API=/portofolio/show/vhiweb-test-full/api/v1
ARG NEXT_BASE_PATH=""
ARG NEXT_PUBLIC_BASE_URL_API=/api/v1

ENV NEXT_BASE_PATH=${NEXT_BASE_PATH}
ENV NEXT_PUBLIC_BASE_URL_API=${NEXT_PUBLIC_BASE_URL_API}

# Output goes to /frontend/out
RUN npm run build


# =============================================================================
# Stage 2 — Install backend dependencies (with native bcrypt build)
# =============================================================================
FROM node:18.19-alpine3.18 AS backend-builder

WORKDIR /backend

COPY backend/package*.json ./
RUN npm install && npm install bcrypt


# =============================================================================
# Stage 3 — Final image: Express serves API + Next.js static files
# =============================================================================
FROM node:18.19-alpine3.18

WORKDIR /app

# Copy backend source
COPY backend/ .

# Copy backend node_modules (includes native bcrypt)
COPY --from=backend-builder /backend/node_modules ./node_modules

# Copy Next.js static output → public/ (Express serves this)
COPY --from=frontend-builder /frontend/out ./public

EXPOSE 5000

CMD ["node", "index.js"]
