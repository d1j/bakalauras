FROM node:16-alpine AS development
ENV NODE_ENV development

WORKDIR /usr/app
COPY ./ /usr/app

RUN npm install
# Start the app
CMD [ "npm", "start" ]
