FROM node:20-alpine

WORKDIR /app

# Copy package files and install production dependencies
COPY package*.json ./
RUN npm install --production

# Copy the rest of the backend files
COPY . .

EXPOSE 5000

CMD ["npm", "start"]
