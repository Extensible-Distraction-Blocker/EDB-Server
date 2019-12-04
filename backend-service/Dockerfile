
FROM node:latest

MAINTAINER Dayeon Myeong <meme91322367@gmail.com>

# 앱 디렉터리 생성
ADD ./edb-server /usr/src/edb-server/

WORKDIR /usr/src/edb-server

RUN npm install

#RUN npm i pm2 -g


EXPOSE 3000

#CMD [ "pm2","start", "./bin/www/", "--name","edbserver" ]
CMD [ "npm","run","teststart" ]

