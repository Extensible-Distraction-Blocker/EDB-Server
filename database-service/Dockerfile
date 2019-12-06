FROM mysql:5.7

MAINTAINER Dayeon Myeong <meme91322367@gmail.com>

ADD ./mysql-init-files /docker-entrypoint-initdb.d

EXPOSE 3306

CMD ["mysqld", "--character-set-server=utf8mb4", "--collation-server=utf8mb4_unicode_ci"]