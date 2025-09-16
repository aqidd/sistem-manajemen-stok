# 2025-09-16: Build frontend (Vite) + backend (TypeScript) and run both via Express. SQLite stored in /app/data.

FROM node:22-bookworm-slim AS builder
WORKDIR /app

# ---- Build frontend ----
COPY frontend/package.json frontend/package-lock.json* ./frontend/
RUN cd frontend && npm install
COPY frontend/ ./frontend/
RUN cd frontend && npm run build

# ---- Build backend ----
COPY backend/package.json backend/package-lock.json* ./backend/
RUN cd backend && npm install
COPY backend/tsconfig.json ./backend/tsconfig.json
COPY backend/src ./backend/src
RUN cd backend && npm run build

# ---- Runtime image ----
FROM node:22-bookworm-slim AS runner
WORKDIR /app

# Copy backend runtime (dist + node_modules + package.json)
COPY --from=builder /app/backend/node_modules ./backend/node_modules
COPY --from=builder /app/backend/package.json ./backend/package.json
COPY --from=builder /app/backend/dist ./backend/dist

# Copy built frontend
COPY --from=builder /app/frontend/dist ./frontend/dist

# Ensure SQLite data dir exists
RUN mkdir -p /app/data

ENV NODE_ENV=production
ENV PORT=3000
EXPOSE 3000

CMD ["node", "backend/dist/server.js"]