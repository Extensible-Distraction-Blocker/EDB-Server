FROM mysql:5.7

MAINTAINER Dayeon Myeong <meme91322367@gmail.com>

ADD ./mysql-init-files /docker-entrypoint-initdb.d

EXPOSE 3306

CMD ["mysqld"]