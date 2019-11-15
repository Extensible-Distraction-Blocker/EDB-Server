
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


// SERVICE PROVIDER가 외부 서비스 등록
//REQ : header에 token, 외부서비스 이름, 외부서비스 묶음URL , idx
//RES: 
//req : name,url,externalServiceDetailNames
//ok
router.post("/", authUtil.isServiceProvider, async(req, res)=>{

 const {name,url,externalServiceDetailNames} = req.body;

    if (!name && !url && !externalServiceDetailNames) {
        res.status(200).send(defaultRes.successTrue(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {

        try{
                const getExternalServiceQuery = `SELECT * FROM external_service WHERE name = ?`;
                const getExternalServiceResult  = await db.queryParam_Parse(getExternalServiceQuery,[name]) || null;
                if(!getExternalServiceResult|| getExternalServiceResult[0].length === 0){
                    const postExternalServiceQuery = `INSERT INTO external_service(name, url) VALUES(?,?)`;
                    var postExternalServiceResult  = await db.queryParam_Parse(postExternalServiceQuery,[name,url]);
                }
                    const getExternalServiceIdx = postExternalServiceResult[0].insertId;
                    if(!getExternalServiceIdx){
                        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_EXTERNAL_SERVICE_ERROR));                    
                    }else{
//반복문
                    for(var i=0; i<externalServiceDetailNames.length; i++) {
                            const postExternalServiceDetailQuery = `INSERT INTO external_service_detail(name, external_service_idx) VALUES(?,?)`;
                            var postExternalServiceDetailResult  = await db.queryParam_Parse(postExternalServiceDetailQuery,[externalServiceDetailNames[i],getExternalServiceIdx]);
                    }

                      if(!postExternalServiceDetailResult || postExternalServiceDetailResult === 0){
                                res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_EXTERNAL_SERVICE_ERROR));
                        }
                        else{
                            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.POST_EXTERNAL_SERVICE_SUCCESS));
                        }
                    }

            }catch(err){
                res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_EXTERNAL_SERVICE_ERROR));
            }

    }
        
});



//일반 uSER가 가능한 외부 서비스 목록에서 외부 서비스 등록
//REQ : header에 token, 가능한 외부 서비스 목록에서 선택한 외부서비스묶음 IDX 
//ok
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


//user가 등록한 외부 서비스 목록 조회
//REQ headers.token
//response USER가 등록한 외부서비스 IDX, 외부서비스 URL, 이름
//ok
router.get('/',authUtil.isLoggedin, async (req, res) => { 
    let getPostQuery  = "SELECT user_idx,external_service_idx,name,url \
     FROM user_external_service \
INNER JOIN external_service ON external_service_idx = idx \
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


//본인의 외부서비스 목록 중 달성 목표 조회
router.get('/detail/:externalIdx',authUtil.isLoggedin,async (req, res) => {
    let userIdx = req.decoded.user_idx;
    let externalIdx = req.params.externalIdx;

    let getPostQuery  = "SELECT idx AS'external_service_detail_idx',name AS 'name', if_achieve AS 'if_achieve' \
FROM external_service_detail ed \
INNER JOIN user_external_service u ON ed.external_service_idx = u.external_service_idx \
WHERE u.user_idx = ? AND u.external_service_idx = ?";

    const getPostResult = await db.queryParam_Parse(getPostQuery,[userIdx,externalIdx]);

    //쿼리문의 결과가 실패이면 null을 반환한다
    if (!getPostResult) { //쿼리문이 실패했을 때
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.EXTERNAL_SERVICE_GET_ERROR));
    } else { //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.EXTERNAL_SERVICE_GET_SUCCESS,getPostResult[0]));
    }
});


//가능한 외부서비스 목록 조회
//RESPONSE 가능한 외부서비스IDX, 이름 , URL
//SELECT idx AS 'external_service_idx',url AS 'url',name AS 'name'  FROM external_service WHERE idx NOT IN (SELECT external_service_idx FROM user_external_service WHERE user_idx = 1);
//ok
//추가 : 본인 목록 제외해야하나?
router.get('/available',async (req, res) => { 
    let getPostQuery  = "SELECT idx AS 'external_service_idx',url AS 'url',name AS 'name' FROM external_service";
    const getPostResult = await db.queryParam_None(getPostQuery);

    //쿼리문의 결과가 실패이면 null을 반환한다
    if (!getPostResult) { //쿼리문이 실패했을 때
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.EXTERNAL_SERVICE_GET_ERROR));
    } else { //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.EXTERNAL_SERVICE_GET_SUCCESS,getPostResult[0]));
    }
});






//일반 USER의 특정 외부 서비스 삭제
//REQ : header에 token, 외부서비스묶음idx
//ok
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





// 특정 외부 서비스 달성 여부 갱신
//REQ : 특정 목표에 대한 idx
////코드 짬 테스트 x
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









// SERVICE PROVIDER가 특정 외부 서비스 수정
//REQ : header에 token, 외부서비스묶음 idx
// name , url
// external_service_detail 에는 idx, name,external_service_idx
//externaldetail = detailName / external_Service = name,url
////코드 짬 테스트 x
router.put('/:externalIdx/:externalDetailIdx', authUtil.isServiceProvider, async(req, res) => {
    const externalIdx = req.params.externalIdx;
    const externalDetailIdx = req.params.externalDetailIdx;

    var externalServicedetailName = '';
    var externalServiceName = '';
    var externalServiceUrl = '';

    if(req.body.externalServicedetailName){
        externalServicedetailName = req.body.externalServicedetailName;
    }else if(req.body.externalServiceName || req.body.externalServiceUrl){
        externalServiceUrl = req.body.externalServiceUrl;
        externalServiceName = req.body.externalServiceName;
    }

    if(!externalIdx && !externalDetailIdx ){
        res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.OUT_OF_VALUE));
    }


    if(extenalIdx && externalDetailIdx){
//detail 수정(name)

        let putBoardQuery =  "UPDATE  external_service_detail SET";
        if(!externalServicedetailName)  putBoardQuery+= ` name = '${externalServicedetailName}'`; 
        putBoardQuery += ` WHERE idx = '${externalDetailIdx}'' AND external_service_idx = '${externalIdx}'`;
        
        console.log(putBoardQuery);
        
        let putBoardResult = await db.queryParam_None(putBoardQuery);
        if (!putBoardResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.POST_UPDATE_ERROR));
        }else{
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.POST_UPDATE_SUCCESS));
        }

    }else if(!externalDetailIdx){
        //external_Service  수정

        let putBoardQuery =  "UPDATE  external_service SET";
        if(!externalServicedetailName)  putBoardQuery+= ` name = '${externalServicedetailName}',`; 
        putBoardQuery = putBoardQuery.slice(0, putBoardQuery.length-1);
        if(!externalServiceUrl) putBoardQuery+= ` url = '${externalServiceUrl}'`; 
        putBoardQuery += ` WHERE idx = '${externalDetailIdx}'`;
          
        console.log("AA");
        console.log(putBoardQuery);
        
        let putBoardResult = await db.queryParam_None(putBoardQuery);
        if (!putBoardResult) {
            res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.POST_UPDATE_ERROR));
        }else{
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.POST_UPDATE_SUCCESS));
        }
    

    }



});






module.exports = router;
