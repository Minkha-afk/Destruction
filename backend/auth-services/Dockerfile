# syntax=docker/dockerfile:1
# ---- build stage: install all deps + compile TypeScript ----
FROM node:22-alpine AS build
WORKDIR /app

# Install dependencies first for better layer caching
COPY package*.json ./
RUN npm ci

# Compile TypeScript -> dist/
COPY tsconfig.json ./
COPY src ./src
RUN npm run build

# Drop devDependencies for a smaller runtime image
RUN npm prune --omit=dev

# ---- runtime stage: prod deps + compiled output only ----
FROM node:22-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist

# The PaaS injects PORT; the server binds process.env.PORT. EXPOSE is just a hint.
EXPOSE 8080
CMD ["node", "dist/server.js"]
