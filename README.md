Extensible-Distraction-Blocker
=========================================

잠금 프로그램이 기본적으로 가지는 틀을 구현한 EDB 오픈소스 프로젝트는  플러그인 형태의 잠금 정책 틀을 구현하여, 이후 잠금 정책이나 외부서비스 플러그인을 가진 SERVICE PROVIDER가 본 프로젝트의 틀에 플러그인을 연동시킬 수 있다. 이때, REST API를 이용하여 상세 기능이 구현이 가능하다. 

## REST API  문서
* [GIT WIKI Document](https://github.com/Extensible-Distraction-Blocker/EDB-Server/wiki)

## 소스 구조 및 설명 


## BUILD GUIDE

### 1. run by: 
```
git clone https://github.com/Extensible-Distraction-Blocker/EDB-Server.git
npm i 

```
이 단계를 거치면 해당 프로그램에 필요한 node_modules 라이브러리 폴더가 생성

### 2. db_config.js 파일 생성
```
EDB-SERVER/
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
host,port, user,database,password를 본인의 데이터 베이스 설정에 맞게 맞춘다

## TEST GUIDE
### EXACT 실행 방식
1.  해당 프로젝트의 MYSQL 데이터 베이스를 만든다.(이후 SQL 파일 제공 예정)
2. GITWIKI를 참고하여 postman을 이용하여 테스트 가능.

### DOCKER 이미지와 컨테이너 생성(추후 추가 예정)
run by: 
```
docker build -t 도커 이미지명 .
docker run -dit --name 도커컨테이너명 -p 연결port:연결port 도커이미지명
```

## 추가 정보

### ERD
<div>
<img width=217 src="https://github.com/Extensible-Distraction-Blocker/EDB-Server/issues/15#issue-526981623">
</div>