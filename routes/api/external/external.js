
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

    console.log("externalServiceDetail\n");
    console.log(externalServiceDetailNames);

    if (!name && !url && !externalServiceDetailNames) {
        res.status(200).send(defaultRes.successTrue(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {

        try{
                const getExternalServiceQuery = `SELECT * FROM external_service WHERE name = ?`;
                const getExternalServiceResult  = await db.queryParam_Parse(getExternalServiceQuery,[name]) || null;
                

                if(!getExternalServiceResult|| getExternalServiceResult[0].length === 0){
                    console.log("insert external_service");

                    const postExternalServiceQuery = `INSERT INTO external_service(name, url) VALUES(?,?)`;
                    var postExternalServiceResult  = await db.queryParam_Parse(postExternalServiceQuery,[name,url]);
                console.log("insert external_service");
//getExternalServiceIdx
                            console.log("result222\n");
                console.log(postExternalServiceResult[0].insertId);
                }

//                    const getExternalServiceResult_ = JSON.parse(JSON.stringify(postExternalServiceResult[0].insertId)) || null;
                    const getExternalServiceIdx = postExternalServiceResult[0].insertId;

                    console.log("test getExternalServiceIdx\n");

                    console.log(getExternalServiceIdx);

                    if(!getExternalServiceIdx){
                        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_EXTERNAL_SERVICE_ERROR));                    
                    }else{
//반복문
                    
                    for(var i=0; i<externalServiceDetailNames.length; i++) {
                           //array[i]
                             console.log("detail");
                            const postExternalServiceDetailQuery = `INSERT INTO external_service_detail(name, external_service_idx) VALUES(?,?)`;
                            var postExternalServiceDetailResult  = await db.queryParam_Parse(postExternalServiceDetailQuery,[externalServiceDetailNames[i],getExternalServiceIdx]);

                            console.log("detailresult");
                            console.log(postExternalServiceResult);

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

//user가 등록한 외부 서비스 목록 조회
//REQ headers.token
//response USER가 등록한 외부서비스 IDX, 외부서비스 URL, 이름
router.get('/',authUtil.isLoggedin, async (req, res) => { 
    let getPostQuery  = "SELECT * FROM board";
    
    const getPostResult = await db.queryParam_None(getPostQuery);

    //쿼리문의 결과가 실패이면 null을 반환한다
    if (!getPostResult) { //쿼리문이 실패했을 때
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.POST_SELECT_ERROR));
    } else { //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.POST_SELECT_SUCCESS,getPostResult[0]));
    }
});




//가능한 외부서비스 목록 조회
//RESPONSE 가능한 외부서비스IDX, 이름 , URL
router.get('/like', authUtil.isLoggedin, async (req, res) => {

    const userIdx = req.decoded.user_idx;
    console.log("ss");
    console.log(userIdx);

    let getLikeBoardQuery  = `SELECT b.idx, b.name,b.type FROM board b 
    INNER JOIN board_like bl ON bl.board_idx = b.idx 
    WHERE user_idx = ?`;
    
    const getLikeBoardResult = await db.queryParam_Parse(getLikeBoardQuery,[userIdx]);
    console.log("sss");
    console.log(getLikeBoardResult[0]);

    let ans = getLikeBoardResult[0];
    for(var i = 0;i<getLikeBoardResult[0].length;i++){
        ans[i]["is_love"]=1;
    }

    console.log("ans");
    console.log(ans);
    //쿼리문의 결과가 실패이면 null을 반환한다
    if (!getLikeBoardResult) { //쿼리문이 실패했을 때
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.BOARD_LIKE_SELECT_ERROR));
    } else if(getLikeBoardResult.length === 0){
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.BOARD_LIKE_SELECT_ERROR));
    }else{ //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.BOARD_LIKE_SELECT_SUCCESS,ans));
    }
});


//일반 uSER가 가능한 외부 서비스 목록에서 외부 서비스 등록
//REQ : header에 token, 가능한 외부 서비스 목록에서 선택한 외부서비스묶음 IDX
// 
router.post("/", authUtil.isAdmin, async(req, res)=>{
    const {name,type} = req.body;
    //저장 시 필수 값인 게시물Id와 제목(title)이 없으면 실패 response 전송

    if (!name && !type) {
        res.status(200).send(defaultRes.successTrue(statusCode.BAD_REQUEST, resMessage.NULL_VALUE));
    } else {

        try{
                const getBoardRequestQuery = `SELECT request_cnt FROM board_request WHERE name = ?`;
                const getBoardRequestResult  = await db.queryParam_Parse(getBoardRequestQuery,[name]) || null;
                
                console.log(getBoardRequestResult[0]);
                const request_cnt = JSON.parse(JSON.stringify(getBoardRequestResult[0])) || null;
                const req_cnt = request_cnt[0].request_cnt;
            

                 if(req_cnt >= 100){

                    const postBoardQuery = `INSERT INTO board(name, type) VALUES(?,?)`;
                    const postBoardResult  = await db.queryParam_Parse(postBoardQuery,[name,type]);
                    if(!getBoardRequestResult){
                        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_BOARD_ERROR));
                     } else if(getBoardRequestResult === 0){
                        res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_BOARD_ERROR));
                    }else{
                        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.POST_BOARD_SUCCESS));
                    }

                 }else{
                    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.POST_BOARD_ERROR));
                }
            }catch(err){
                res.status(200).send(defaultRes.successFalse(statusCode.DB_ERROR, resMessage.POST_BOARD_ERROR));
            }
        }
});




// SERVICE PROVIDER가 특정 외부 서비스 수정
//REQ : header에 token, 외부서비스묶음 idx

router.put('/:boardIdx', authUtil.isAdmin, async(req, res) => {
    const boardIdx = req.params.boardIdx;
    

    //name or type 하나만인경우도 추가하기!!
    let name = "";
    let type = "";
    if(req.body.name) name+= req.body.name;
    if(req.body.type) type+= req.body.type;

    if(!name || !type ){
        res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.OUT_OF_VALUE));
    }
    //본인이 올린 
    let putBoardQuery =  "UPDATE  board  SET";
    if(name)  putBoardQuery+= ` name = '${name}',`;        
    if(type) putBoardQuery+= `  type = '${type}',`;
    putBoardQuery = putBoardQuery.slice(0, putBoardQuery.length-1);
    putBoardQuery += ` WHERE idx = '${boardIdx}'`;
    
    console.log(putBoardQuery);
    let putBoardResult = await db.queryParam_None(putBoardQuery);
    if (!putBoardResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.POST_UPDATE_ERROR));
    }else{
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.POST_UPDATE_SUCCESS));
    }
});


// 특정 외부 서비스 달성 여부 갱신
//REQ : 메인어플리케이션idx,특정 목표에 대한 idx
router.put('/:boardIdx', authUtil.isAdmin, async(req, res) => {
    const boardIdx = req.params.boardIdx;
    

    //name or type 하나만인경우도 추가하기!!
    let name = "";
    let type = "";
    if(req.body.name) name+= req.body.name;
    if(req.body.type) type+= req.body.type;

    if(!name || !type ){
        res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.OUT_OF_VALUE));
    }
    //본인이 올린 
    let putBoardQuery =  "UPDATE  board  SET";
    if(name)  putBoardQuery+= ` name = '${name}',`;        
    if(type) putBoardQuery+= `  type = '${type}',`;
    putBoardQuery = putBoardQuery.slice(0, putBoardQuery.length-1);
    putBoardQuery += ` WHERE idx = '${boardIdx}'`;
    
    console.log(putBoardQuery);
    let putBoardResult = await db.queryParam_None(putBoardQuery);
    if (!putBoardResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.POST_UPDATE_ERROR));
    }else{
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.POST_UPDATE_SUCCESS));
    }
});




//일반 USER의 특정 외부 서비스 삭제
//REQ : header에 token, 외부서비스묶음idx
router.delete('/:boardIdx', authUtil.isAdmin, async(req, res) => {
    const boardIdx = req.params.boardIdx;

    const deleteBoardQuery = "DELETE FROM board WHERE idx = ?";
    const deleteBoardResult = await db.queryParam_Parse(deleteBoardQuery, [boardIdx]);


    if (!deleteBoardResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.BOARD_DELETE_ERROR));
    } else {
        if(deleteBoardResult.affectedRows > 0){
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.BOARD_DELETE_SUCCESS));
        }else{
            res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.BOARD_DELETE_NOTHING));
        }
    }
});




module.exports = router;
