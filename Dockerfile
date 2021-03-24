FROM node:current-alpine3.10

WORKDIR /Users/robertstrange/hackreactorsei/SDC/FEC

COPY . ./

RUN npm install npm run start

EXPOSE 3000


