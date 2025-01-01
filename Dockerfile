# Use a Node.js base image
FROM node:18

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy only package.json and package-lock.json first
COPY package*.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of the application files
COPY . .

# Expose the port your app runs on
EXPOSE 5111

# Define the command to run the application
CMD ["npm", "start"]
