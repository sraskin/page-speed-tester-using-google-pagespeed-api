# Use an official Node.js runtime as the base image
FROM cypress/browsers

# Set the working directory in the container to /app
WORKDIR /app

# Copy package.json and package-lock.json into the directory
COPY package*.json ./

# Install the project dependencies
RUN npm install

# Copy the rest of the project files into the container
COPY . .

# Make port 3000 available outside the container
EXPOSE 3000

# Define the command to run the app
CMD [ "npm", "start" ]