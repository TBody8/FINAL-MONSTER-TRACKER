# Stage 1: Build the React frontend
FROM node:20-alpine AS frontend-builder
WORKDIR /app

# Enable Corepack and Yarn 1.x
RUN corepack enable && corepack prepare yarn@1.22.22 --activate

# Copy dependency files
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile --network-timeout 1000000

# Copy the rest of the frontend source code and build
COPY . .
RUN yarn build

# Stage 2: Setup the Python backend and serve
FROM python:3.10-slim

WORKDIR /app

# Install system dependencies if required for python packages
RUN apt-get update && apt-get install -y --no-install-recommends gcc && rm -rf /var/lib/apt/lists/*

# Copy backend requirements and install
COPY backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copy backend code
COPY backend/ ./backend/

# Copy the built frontend from Stage 1 into the 'build' directory at the root
COPY --from=frontend-builder /app/build ./build

# Expose port
EXPOSE 8000

# Unbuffered output for better logging in Dokploy
ENV PYTHONUNBUFFERED=1

# Start the FastAPI server
WORKDIR /app/backend
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8000"]
