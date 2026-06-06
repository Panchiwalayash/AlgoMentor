# Use an official Node.js runtime as the base image
FROM node:20-alpine

# Set the working directory in the container
WORKDIR /app

ARG LIVEKIT_URL
ARG LIVEKIT_API_KEY
ARG LIVEKIT_API_SECRET
ARG DYNAMODB_TABLE_NAME

# Copy package.json and package-lock.json
COPY . .

# Install dependencies
RUN npm ci

ENV NODE_ENV production
ENV LIVEKIT_URL=$LIVEKIT_URL
ENV LIVEKIT_API_KEY=$LIVEKIT_API_KEY
ENV LIVEKIT_API_SECRET=$LIVEKIT_API_SECRET
ENV DYNAMODB_TABLE_NAME=$DYNAMODB_TABLE_NAME

# Build the Next.js application
RUN npm run build

# Expose the port the app runs on
EXPOSE 3000

# Start the Next.js app
CMD ["npm", "start"]