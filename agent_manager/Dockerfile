# Use Node.js base image with a specific version (you can change this as needed)
FROM node:18-alpine

# Set working directory in the container
WORKDIR /app

# Copy package.json and yarn.lock to the container
COPY package.json yarn.lock ./

# Install dependencies
RUN yarn install --frozen-lockfile --production

# Copy the rest of the application code to the container
COPY . .

RUN yarn prisma generate
# Expose the port the app runs on (if applicable)
EXPOSE 3001

# Command to run the application
CMD ["yarn", "start"]
