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

module.exports = router;

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
var urlencode = require('urlencode');
var querystring = require('querystring');
var url = require('url');


// USER가 등록한 잠금정책 목록 조회
//코드 짬 테스트 x
router.get('/',authUtil.isLoggedin, async (req, res) => { 
    let getPostQuery  = "SELECT user_idx,lock_idx,name,url,configuration \
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





//일반 유저가 가능한 잠금 정책 목록에서 잠금 정책 등록(잠금 추가)
//req : lockIdx 토큰
////코드 짬 테스트 x
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
//REQ : 이름,Url,CONFIGURATION
//코드 짬 테스트 x
router.post("/", authUtil.isServiceProvider, async(req, res)=>{

 const {name,url,configuration} = req.body;

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


// 특정 잠금 정책 조회
//req : 토큰,lockIdx
//잠금 정책 Idx, 이름,해당 잠금 대상의 설치 url, 설정 데이터(configuration)
////코드 짬 테스트 x
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



//특정 잠금 대상 시간 목표 ,,,추가
//req : header에 token, User가 선택한 잠금 정책idx, Configuration
//코드 안짬

router.post("/:externalIdx", authUtil.isLoggedin, async(req, res)=>{
    const {externalIdx} = req.params;
    const userIdx = req.decoded.user_idx;

    if (!externalIdx) {
        res.status(200).send(defaultRes.successTrue(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {
                    
                const getExternalServiceIdQuery = `SELECT * FROM user_external_service WHERE user_idx = ? AND external_service_idx = ?`;
                const getExternalServiceIdResult  = await db.queryParam_Parse(getExternalServiceIdQuery,[userIdx,externalIdx]);

                if(!getExternalServiceIdResult){
                    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_BOARD_ERROR));

                }else if(getExternalServiceIdResult[0].length > 0){
                    res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_EXTERNAL_SERVICE_EXIST));
                }
                else{
                    const postUserExternalServiceQuery = `INSERT INTO user_external_service VALUES(?,?)`;
                    const postUserExternalServiceResult  = await db.queryParam_Parse(postUserExternalServiceQuery,[userIdx,externalIdx]);

                    if(!postUserExternalServiceResult){
                        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_BOARD_ERROR));
                    }else{
                        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.POST_BOARD_SUCCESS));
                    }

                }
    }
});


//특정 잠금 대상 시간 목표 ,,,삭제
//코드 안짬
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
