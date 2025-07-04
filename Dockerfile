# Build stage
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN chmod -R +x node_modules/.bin
RUN npm run build

# Production stage
FROM nginx:1.25-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
# COPY public /usr/share/nginx/html   # REMOVED to prevent overwriting build output
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"] 