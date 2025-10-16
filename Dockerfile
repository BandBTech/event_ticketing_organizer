# Base image
FROM node:20 AS build

# Create app directory
WORKDIR /app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
COPY package*.json ./

# Install only production dependencies for smaller image size
RUN npm install --legacy-peer-deps --force


# Bundle app source
COPY . .

RUN npm run build

FROM nginx:alpine
 
COPY --from=build /app/out /usr/share/nginx/html
 
EXPOSE 80
 
CMD ["nginx", "-g", "daemon off;"]