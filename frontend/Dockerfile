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

# Expose the frontend port
EXPOSE 5173

# Start the application in dev mode with host binding
CMD ["bun", "run", "dev", "--host"]
