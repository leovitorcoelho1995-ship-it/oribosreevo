# Stage 1: Build
FROM node:18-alpine as builder

WORKDIR /app

# Install dependencies based on package-lock.json
COPY package.json package-lock.json ./
# Use --legacy-peer-deps if needed, or normal install
RUN npm ci --legacy-peer-deps

# Copy source
COPY . .

# Build for production
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine

# Copy custom nginx config
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy build artifacts
COPY --from=builder /app/dist /usr/share/nginx/html

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
