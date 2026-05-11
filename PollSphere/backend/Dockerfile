FROM node:20-alpine

WORKDIR /app

# Copy only the backend package.json
COPY package.json ./

# Install dependencies directly inside the container
RUN npm install

# Copy the rest of the backend code
COPY . .

# Build the TypeScript code
RUN npm run build

# Expose the Express port
EXPOSE 5000

# Start the compiled JavaScript
CMD ["npm", "start"]
