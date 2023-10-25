# Use the official Node.js 12 image as the base image
FROM node:18.16.1-alpine

ENV DOCKERIZE_VERSION v0.6.1
RUN wget https://github.com/jwilder/dockerize/releases/download/$DOCKERIZE_VERSION/dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz \
    && tar -C /usr/local/bin -xzvf dockerize-linux-amd64-$DOCKERIZE_VERSION.tar.gz

# Set the working directory within the container
WORKDIR /nodejs

# Copy package.json and package-lock.json to the working directory
COPY package*.json ./

# Install dependencies silently
RUN npm install --silent

# Copy all files from the current directory to the container
COPY . .

# Specify the command to run when the container starts
CMD ["dockerize", "-wait", "tcp://mysql:3306", "npm", "start"]

# Expose port 4000 to the outside world
EXPOSE 4000
