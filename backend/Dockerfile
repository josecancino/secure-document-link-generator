# Use the official Bun image
FROM oven/bun:latest

# Set working directory
WORKDIR /app

# Copy package.json and bun.lock
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy the rest of the application
COPY . .

# Expose the API port
EXPOSE 3000

# Start the application
CMD ["bun", "run", "start:dev"]
