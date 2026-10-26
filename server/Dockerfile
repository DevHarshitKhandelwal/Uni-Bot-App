# ---------- Runtime image (no build tools needed) ----------
FROM node:20-alpine AS runtime

WORKDIR /app

# Install only production dependencies
COPY server/package*.json ./
RUN npm ci --omit=dev

# Copy source files
COPY server/ .

EXPOSE 5000
CMD ["node", "server.js"]
