FROM node:20-alpine

WORKDIR /app

COPY package.json ./

# Install dependencies inside the container
RUN npm install

# Copy the rest of the frontend code
COPY . .

EXPOSE 5173

# Run Vite in host mode so it's accessible from the browser outside the container
CMD ["npm", "run", "dev", "--", "--host"]
