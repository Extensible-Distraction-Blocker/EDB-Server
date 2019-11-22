var express = require('express');
var router = express.Router();

const upload = require('../../../config/multer');
const defaultRes = require('../../../module/utils/utils');
const statusCode = require('../../../module/utils/statusCode');
const resMessage = require('../../../module/utils/responseMessage');
const encrypt = require('../../../module/utils/encrypt');
const db = require('../../../module/utils/pool');
const moment = require('moment');
const authUtil = require('../../../module/utils/authUtils');
const jwtUtil = require('../../../module/utils/jwt');



// USER가 등록한 잠금정책 목록 조회(불러오기u13)
//일단ok
/*

{
    "status": 200,
    "success": true,
    "message": "USER의 잠금 정책 조회 성공",
    "data": [
        {
            "lock_idx": 3,
            "name": "잠금정책2",
            "configuration": "{object:chrome}",
            "start_time": "08:19:00",
            "end_time": "08:19:00"
        },
        {
            "lock_idx": 5,
            "name": "잠금정책4",
            "configuration": "{object:game.exe}",
            "start_time": "11:19:00",
            "end_time": "11:19:00"
        }
    ]
}

### response example
< 보내지지 않은 경우
<pre><code>{
    "status": 400,
    "success": false,
    "message": "필요한 값이 없습니다."
}
</code></pre>

### 서버 내부 오류
<pre><code>{
    "status": 500,
    "success": false,
    "message": "서버 내부 오류"
}
</code></pre>
*/
//
//그럼 해당 user 토큰을 이용해서 유저가 가진 모든 plugidx,잠금시간,pluginconfig 불러오기

router.get('/',authUtil.isLoggedin, async (req, res) => { 
    let getPostQuery  = "SELECT lock_idx,l.name,configuration,\
    date_format(start_time, '%h:%d:%s') AS 'start_time',date_format(end_time, '%h:%d:%s') AS 'end_time'\
FROM user_lock \
INNER JOIN `lock` l ON lock_idx = l.idx \
WHERE user_idx = ?";
    const userIdx = req.decoded.user_idx;

    const getPostResult = await db.queryParam_Parse(getPostQuery,[userIdx]);

    //쿼리문의 결과가 실패이면 null을 반환한다
    if (!getPostResult) { //쿼리문이 실패했을 때
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.USERS_LOCK_GET_ERROR));
    } else { //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.USERS_LOCK_GET_SUCCESS,getPostResult[0]));
    }
});





//일반 유저가 가능한 잠금 정책 목록에서 잠금 정책 등록(잠금 추가)
//req : lockIdx 토큰
////코드 짬 테스트 x
/*
<pre><code>{
    "status": 200,
    "success": true,
    "message": "잠금 정책 등록 성공"
}
</code></pre>

### 이미 등록한 경우
<pre><code>{
    "success": false,
    "message": "이미 등록한 잠금 정책입니다."
}
</code></pre>

### 필요한 값이 보내지지 않은 경우
<pre><code>{
    "status": 400,
    "success": false,
    "message": "필요한 값이 없습니다."
}
</code></pre>

### 서버 내부 오류
<pre><code>{
    "status": 500,
    "success": false,
    "message": "서버 내부 오류"
}
</code></pre>
*/
router.post("/:lockIdx", authUtil.isLoggedin, async(req, res)=>{
    const {lockIdx} = req.params;
    const userIdx = req.decoded.user_idx;

    if (!lockIdx) {
        res.status(200).send(defaultRes.successTrue(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
                    
                const getExternalServiceIdQuery = `SELECT * FROM user_lock WHERE user_idx = ? AND lock_idx = ?`;
                const getExternalServiceIdResult  = await db.queryParam_Parse(getExternalServiceIdQuery,[userIdx,lockIdx]);

                if(!getExternalServiceIdResult){
                    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_BOARD_ERROR));

                }else if(getExternalServiceIdResult[0].length > 0){
                    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_EXTERNAL_SERVICE_EXIST));
                }
                else{
                    const postUserExternalServiceQuery = `INSERT INTO user_lock VALUES(?,?)`;
                    const postUserExternalServiceResult  = await db.queryParam_Parse(postUserExternalServiceQuery,[lockIdx,userIdx]);

                    if(!postUserExternalServiceResult){
                        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_BOARD_ERROR));
                    }else{
                        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.POST_BOARD_SUCCESS));
                    }

                }
    }
});




//SERVICE PROVIDER가 잠금 정책 등록
//REQ : 이름,Url
//코드 짬 테스트 x
/*
## URL
[POST]~/api/locks/

 메소드 | 파라미터명 | 설명
------| ----------|-----
header | Content-Type| application/json
header | token |  token
body | name |  external service name
body | url |  external service URL


### request example
<pre><code>{
    "name":"잠금정책20",
    "url":"설치방법url"
}
</code></pre>

### response example
<pre><code>{
    "status": 200,
    "success": true,
    "message": "잠금 정책 등록 성공"
}
</code></pre>

### 등록에 실패한 경우
<pre><code>{
    "status": 204,
    "success": false,
    "message": "잠금 정책 등록 실패"
}
</code></pre>

### 권한이 없는 경우
<pre><code>{
    "status": 204,
    "success": false,
    "message": "SERVICE PROVIDER 권한이 없습니다."
}
</code></pre>
### 이미 등록한 경우
<pre><code>{
    "success": false,
    "message": "이미 등록한 잠금정책입니다."
}
</code></pre>

### 필요한 값이 모두 보내지지 않는 경우
<pre><code>{
    "status": 400,
    "success": false,
    "message": "필요한 값이 없습니다."
}
</code></pre>

### 필요한 값이 잘못된 경우
<pre><code>{
    "status": 400,
    "success": false,
    "message": "필요한 값이 잘못되었습니다."
}
</code></pre>

### 서버 내부 오류
<pre><code>{
    "status": 500,
    "success": false,
    "message": "서버 내부 오류"
}
*/
router.post("/", authUtil.isServiceProvider, async(req, res)=>{

 const {name,url} = req.body;

    if (!name && !url && !configuration) {
        res.status(200).send(defaultRes.successTrue(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    }


        try{
                const getExternalServiceQuery = `SELECT * FROM lock WHERE name LIKE ?`;
                const getExternalServiceResult  = await db.queryParam_Parse(getExternalServiceQuery,[name]) || null;
                if(!getExternalServiceResult|| getExternalServiceResult[0].length === 0){
                    const postExternalServiceQuery = `INSERT INTO lock(name, url,configuration) VALUES(?,?,?)`;
                    var postExternalServiceResult  = await db.queryParam_Parse(postExternalServiceQuery,[name,url,configuration]);
                }
                    const getExternalServiceIdx = postExternalServiceResult[0].insertId;
                    if(!getExternalServiceIdx){
                        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_LOCK_ERROR));                    
                    }else{
                    	res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.POST_LOCK_SUCCESS));
//반복문
					}

            }catch(err){
                res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_LOCK_ERROR));
            }

    
        
});


// USER의 특정 잠금 정책 조회
//req : 토큰,lockIdx
//잠금 정책 Idx, 이름,해당 잠금 대상의 설치 url, 설정 데이터(configuration)
////코드 짬 테스트 x
//git wiki안함
////그럼 해당 user 토큰을 이용해서 유저가 가진 모든 plugidx,잠금시간,pluginconfig 불러오기?
/*
### response example
<pre><code>{
    "status": 200,
    "success": true,
    "message": "USER의 특정 잠금 정책 조회 성공",
    "data": [
        {
            "user_idx": 1,
            "lock_idx": 3,
            "name": "잠금정책3",
            "configuration": "{object:{chrome}}",
            "start_time" : "13:00:00",
            "end_time" : "21:00:00"
        }
    ]
}
</code></pre>

### 필요한 값이 보내지지 않는 경우
<pre><code>{
    "status": 400,
    "success": false,
    "message": "필요한 값이 없습니다."
}
</code></pre>

### 서버 내부 오류
<pre><code>{
    "status": 500,
    "success": false,
    "message": "서버 내부 오류"
}
</code></pre>
*/
//
router.get('/:lockIdx',authUtil.isLoggedin, async (req, res) => { 
    

    let getPostQuery  = "SELECT user_idx, lock_idx, name,url,configuration \
     FROM user_lock \
INNER JOIN lock l ON lock_idx = l.idx \
WHERE user_idx = ?";
    const userIdx = req.decoded.user_idx;

    const getPostResult = await db.queryParam_Parse(getPostQuery,[userIdx]);

    //쿼리문의 결과가 실패이면 null을 반환한다
    if (!getPostResult) { //쿼리문이 실패했을 때
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.EXTERNAL_SERVICE_GET_ERROR));
    } else { //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.EXTERNAL_SERVICE_GET_SUCCESS,getPostResult[0]));
    }
});



//특정 잠금 대상 시간 목표 ,,,추가(잠금 정책 설정 등록)!!!!!!!!!!!
//일단Ok
//req : header에 token, User가 선택한 잠금 정책idx, Configuration
//코드 안짬
/* u14 설정 불러오기
아하 그렇다면 나는 서버에 useridx,plugidx,잠금시간,pluginconfig정보를 등록하는 retrofit만 짜면 되는구나
굉장히 간단한거엿네
*/
/*
## URL
[POST]~/api/locks/detail/:lockIdx

 메소드 | 파라미터명 | 설명
------| ----------|-----
header | Content-Type| application/json
header | token |  token
params | lockIdx | lock plugin Idx
body | startTime | lock plugin start time
body | endTime | lock plugin end time
body | configuration | lock plugin configuration

startTime과 endTime의 default value는 00:00:00이며 configuration의 default value는 ""입니다. startTime에는 잠금 정책 잠금 시작 시간을, endTime에는 종료시간을 그리고 configuration에는 잠금 대상이나 해체조건 등을 String 타입으로 입력합니다.
## request example
{
            "configuration": "{object:chrome}",
            "start_time": "2019-11-19 12:00",
            "end_time": "2019-11-19 17:30"
    
}

### response example
<pre><code>{
    "status": 200,
    "success": true,
    "message": "잠금 정책 설정 등록 성공"
}
</code></pre>

### 이미 등록한 경우
<pre><code>{
     "status": 204,
    "success": false,
    "message": "이미 등록한 잠금 정책 설정입니다."
}
</code></pre>

### 필요한 값이 보내지지 않은 경우
<pre><code>{
    "status": 400,
    "success": false,
    "message": "필요한 값이 없습니다."
}
</code></pre>

### 서버 내부 오류
<pre><code>{
    "status": 500,
    "success": false,
    "message": "서버 내부 오류"
}
</code></pre>

### 등록에 실패한 경우
<pre><code>{
    "status": 204,
    "success": false,
    "message": "잠금 정책 설정 등록 실패"
}
</code></pre>*/
//
//insert into user_lock(lock_idx,user_idx,configuration,start_time,end_time) values ('3','1','{object:chrome}','2019-11-19 20:00:00','2019-11-19 20:00:00');
router.post("/detail/:lockIdx", authUtil.isLoggedin, async(req, res)=>{
    let  {lockIdx} = req.params;
    let  userIdx = req.decoded.user_idx;
    let  {configuration,start_time,end_time} = req.body;

    console.log(start_time);
    console.log(end_time);
//'2019-11-19 20:00:00'
// const createTime = moment().format("YYYY-MM-DD HH:mm");

    if (!lockIdx) {
        res.status(200).send(defaultRes.successTrue(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
                    
                const getExternalServiceIdQuery = `SELECT * FROM user_lock WHERE user_idx = ? AND lock_idx = ?`;
                const getExternalServiceIdResult  = await db.queryParam_Parse(getExternalServiceIdQuery,[userIdx,lockIdx]);

                if(!getExternalServiceIdResult){
                    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_LOCK_DETAIL_ERROR));

                }else if(getExternalServiceIdResult[0].length > 0){
                    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_LOCK_DETAIL_EXIST));
                }
                else{
                    const postUserExternalServiceQuery = `insert into user_lock(lock_idx,user_idx,configuration,start_time,end_time) \
                    values (?,?,?,?,?)`;
                    const postUserExternalServiceResult  = await db.queryParam_Parse(postUserExternalServiceQuery,[lockIdx,userIdx,configuration,start_time,end_time]);

                    if(!postUserExternalServiceResult){
                        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_LOCK_DETAIL_ERROR));
                    }else{
                        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.POST_LOCK_DETAIL_SUCCESS));
                    }

                }
    }
});


//특정 잠금 정책 설정 삭제
//코드 안짬
/*
## URL
[DELETE]~/api/locks/:lockIdx

 메소드 | 파라미터명 | 설명
------| ----------|-----
header | Content-Type| application/json
header | token | token
params | lockIdx |  lock plugin Idx


### response example
<pre><code>{
    "status": 200,
    "success": true,
    "message": "잠금 정책 설정 삭제 성공"
}
</code></pre>

### 삭제할 잠금정책이 존재하지 않는 경우
<pre><code>{
    "status": 200,
    "success": false,
    "message": "삭제할 잠금 정책이 존재하지 않습니다."
}
</code></pre>

### 필요한 값이 모두 보내지지 않는 경우
<pre><code>{
    "status": 400,
    "success": false,
    "message": "필요한 값이 없습니다."
}
</code></pre>

### 필요한 값이 잘못된 경우
<pre><code>{
    "status": 400,
    "success": false,
    "message": "필요한 값이 잘못되었습니다."
}
</code></pre>

### 서버 내부 오류
<pre><code>{
    "status": 500,
    "success": false,
    "message": "서버 내부 오류"
}
</code></pre>*/
router.delete('/:externalIdx', authUtil.isLoggedin, async(req, res) => {
    const externalIdx = req.params.externalIdx;
    const userIdx = req.decoded.user_idx;

    const deleteBoardQuery = "DELETE FROM user_external_service WHERE user_idx = ? AND external_service_idx = ?";
    const deleteBoardResult = await db.queryParam_Parse(deleteBoardQuery, [userIdx,externalIdx]);


    if (!deleteBoardResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.EXTERNAL_SERVICE_DELETE_ERROR));
    } else {
        if(deleteBoardResult.affectedRows  > 0){
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.EXTERNAL_SERVICE_DELETE_SUCCESS));
        }else{
            res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.EXTERNAL_SERVICE_DELETE_NOTHING));
        }
    }
});



//특정 잠금 대상 시간 목표 ,,,수정
//코드 안짬
/*
### response example
<pre><code>{
    "status": 200,
    "success": true,
    "message": "잠금 정책 설정 수정 성공"
}
</code></pre>

### 수정할 잠금정책이 존재하지 않는 경우
<pre><code>{
    "status": 200,
    "success": false,
    "message": "수정할 잠금 정책이 존재하지 않습니다."
}
</code></pre>


### 필요한 값이 보내지지 않은 경우
<pre><code>{
    "status": 400,
    "success": false,
    "message": "필요한 값이 없습니다."
}
</code></pre>

### 서버 내부 오류
<pre><code>{
    "status": 500,
    "success": false,
    "message": "서버 내부 오류"
}
</code></pre>

### 수정에 실패한 경우
<pre><code>{
    "status": 204,
    "success": false,
    "message": "잠금 정책 설정 수정 실패"
}
</code></pre>*/
router.put('/:externalIdx/:externalDetailIdx', async(req, res) => {
    const externalIdx = req.params.externalIdx;
    const externalDetailIdx = req.params.externalDetailIdx;

    if(!externalIdx || !externalDetailIdx ){
        res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.OUT_OF_VALUE));
    }
    //본인이 올린 
    let putBoardQuery =  "UPDATE  external_service_detail  SET";   
    if(externalDetailIdx) putBoardQuery+= `  if_archieve = 1`;//달성
//    putBoardQuery = putBoardQuery.slice(0, putBoardQuery.length-1);
    putBoardQuery += ` WHERE external_service_idx = '${externalIdx}'`;
    if(externalDetailIdx)putBoardQuery += `AND idx = '${externalDetailIdx}'`;
    
    console.log("Test");
    console.log(putBoardQuery);
    let putBoardResult = await db.queryParam_None(putBoardQuery);
    if (!putBoardResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.POST_UPDATE_ERROR));
    }else{
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.POST_UPDATE_SUCCESS));
    }
});





//특정 잠금 대상 등록 방법 조회
//코드 짬 테스트 x
//git wiki 빼버림
router.get('/new/:lockIdx',async (req, res) => { 
	const {lockIdx} = req.params;
    
    let getPostQuery  = `SELECT * FROM lock WHERE idx= '${lockIdx}'`;

    const getPostResult = await db.queryParam_None(getPostQuery);

    //쿼리문의 결과가 실패이면 null을 반환한다
    if (!getPostResult) { //쿼리문이 실패했을 때
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.EXTERNAL_SERVICE_GET_ERROR));
    } else { //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.EXTERNAL_SERVICE_GET_SUCCESS,getPostResult[0]));
    }
});




//가능한 잠금 정책 목록 조회
//코드 짬 테스트 x
/*

### response example
<pre><code>{
    "status": 200,
    "success": true,
    "message": "잠금 정책 조회 성공",
    "data": [
        {
            "external_service_idx": 1,
            "name": "잠금정책1",
            "url": "https://www.naver.com"
        },
        {
            "external_service_idx": 8,
            "name": "잠금정책8",
            "url": "https://www.naver.com"
        }
    ]
}
</code></pre>

### 서버 내부 오류
<pre><code>{
    "status": 500,
    "success": false,
    "message": "서버 내부 오류"
}
</code></pre>
*/
router.get('/available',async (req, res) => { 
    let getPostQuery  = "SELECT * FROM lock";
    const getPostResult = await db.queryParam_None(getPostQuery);

    //쿼리문의 결과가 실패이면 null을 반환한다
    if (!getPostResult) { //쿼리문이 실패했을 때
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.EXTERNAL_SERVICE_GET_ERROR));
    } else { //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.EXTERNAL_SERVICE_GET_SUCCESS,getPostResult[0]));
    }
});



module.exports = router;
