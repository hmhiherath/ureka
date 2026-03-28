FROM node:18-alpine

WORKDIR /app

# Install dependencies first (better caching)
COPY package.json .
RUN npm install

# Copy the rest of the React code
COPY . .

EXPOSE 3000

CMD ["npm", "start"]