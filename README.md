Extensible-Distraction-Blocker
=========================================

잠금 프로그램이 기본적으로 가지는 틀을 구현한 EDB 오픈소스 프로젝트는  플러그인 형태의 잠금 정책 틀을 구현하여, 이후 잠금 정책이나 외부서비스 플러그인을 가진 SERVICE PROVIDER가 본 프로젝트의 틀에 플러그인을 연동시킬 수 있다. 이때, REST API를 이용하여 상세 기능이 구현이 가능하다. 

## REST API  문서
* [GIT WIKI Document](https://github.com/Extensible-Distraction-Blocker/EDB-Server/wiki)

## 소스 구조 및 설명 


## BUILD GUIDE - docker 방식

### 1. DOCKER 이미지와 컨테이너 생성
run by : 
```
git clone https://github.com/Extensible-Distraction-Blocker/EDB-Server.git

cd EDB-Server/
docker-compose up --build -d
docker-compose start
```
해당 명령어로 docker-container를 띄우고 실제 postman 서비스를 이용가능하다.

```

docker logs edbservercontainer

```
연결 성공시 위 명령어를 통해 연결이 성공되었음이 로그로 확인가능하다.

## BUILD GUIDE - exact 방식

### 1. run by: 
```
git clone https://github.com/Extensible-Distraction-Blocker/EDB-Server.git
cd backend-service
npm i 

```
이 단계를 거치면 해당 프로그램에 필요한 node_modules 라이브러리 폴더가 생성

### 2. db_config.js 파일 생성
```
edb-server/
	config/
		db_config.js

```
db connection을 위한 db_config.js파일을 만들어야 한다.

### db.config.js

```
const mysql = require('mysql2/promise');
const dbConfig = {
    host: 'localhost',
    port: 3306,
    user: 'username',
    database: 'flexiblelock',
    password:"databasepassword"
}

module.exports = mysql.createPool(dbConfig);

```
host,port, user,database,password를 본인의 데이터 베이스 설정에 맞게 맞춘다.


## TEST GUIDE

### docker 방식
1.  해당 프로젝트의 README.md를 통해 도커 명령어를 이용하여 도커 컨테이를 띄운다.

2. GITWIKI를 참고하여 postman을 이용하여 테스트 가능.
(base url : localhost:3000/api/)

### EXACT 실행 방식
1.  해당 프로젝트의 MYSQL 데이터 베이스를 만든다.(dabase-service/mysql-init-files 폴더를 통해 sql 명령어를 확인가능하다.)

2. GITWIKI를 참고하여 postman을 이용하여 테스트 가능.
(base url : localhost:3000/api/)


##  기타 - 자주 일어나는 오류

### 1. mysql port 3306이 이미 사용되는 경우  delete port
```
 sudo netstat -nlpt |grep 3306 

sudo service mysql stop or sudo service mysqld stop
```
### 2. api 실행이 안되는 경우

run by :
```
docker logs edbservercontainer
```
본 명령어를 통해 api가 가동되는지 로그 확인이 가능하다.

### 3. docker container를 중지하고 싶은 경우
run by :
```
docker-compose stop
```


### 4. mysql 컨테이너 접속 방법
```
docker exec -it dbcontainer /bin/bash

 mysql -h 127.0.0.1 --port 3306 -uroot

```

## 기타 - ERD
<div>
<img src="https://user-images.githubusercontent.com/29730565/69398217-9d7a9500-0d2c-11ea-986d-9582c565c40f.png">
</div>
