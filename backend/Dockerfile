FROM node:18-alpine
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --silent || npm install --silent
COPY . .
RUN npm run prisma:generate || true
EXPOSE 4000
CMD ["npm", "run", "dev"]
