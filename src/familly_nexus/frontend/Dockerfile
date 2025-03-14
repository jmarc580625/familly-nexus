# Use a minimal Node.js image
FROM node:18-alpine as builder

# Set working directory
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the application code
COPY . .

# Build the React app
RUN npm run build

# Use a smaller production image
FROM nginx:alpine

# Copy the built React app into Nginx's static directory
COPY --from=builder /app/build /usr/share/nginx/html

# Expose the port
EXPOSE 80
