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

//로그인 ok's
////id,passwd,salt,name,nickname
//            user_idx: user[0].idx,
//            grade: user[0].grade,
//            name: user[0].name
router.post('/signin', async (req, res) => {

 const {id, passwd} = req.body;

    if (!id || !passwd) {
        res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.OUT_OF_VALUE));
    }

    const getMembershipByIdQuery = 'SELECT * FROM user WHERE id LIKE ?';
    const getMembershipByIdResult = await db.queryParam_Parse(getMembershipByIdQuery, [id]);

    if (!getMembershipByIdResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.MEMBERSHIP_SELECT_FAIL));
    } else if (getMembershipByIdResult.length === 0) {
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.SIGN_IN_FAIL));
    } else { //쿼리문이 성공했을 때
        
        const firstMembershipByIdResult=JSON.parse(JSON.stringify(getMembershipByIdResult[0]));

        encrypt.getHashedPassword(passwd, firstMembershipByIdResult[0].salt, res, async (hashedPassword) => {
            
            if (firstMembershipByIdResult[0].passwd !== hashedPassword) {
                // 비밀번호가 틀렸을 경우
                res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.SIGN_IN_FAIL));
            } else { 
                // 로그인 정보가 일치할 때
                // password, salt 제거
                delete firstMembershipByIdResult.passwd;
                delete firstMembershipByIdResult.salt;

                // 토큰 발급
                const jwtToken = jwtUtil.sign(firstMembershipByIdResult);
                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.CREATE_TOKEN, { "token" : jwtToken}));
            }
        });
    }
});
//user idx 7,9,12,13,14,15,16,17,18,19,20
//회원가입 OKDK


 /**
 * @swagger
 *  /signup:
 *    post:
 *      tags:
 *      - user
 *      description: 회원가입을 한다..
 *      produces:
 *      - applicaion/json
 *      parameters:
 *      - name: id
 *        in: body
 *        description: "회원 아이디"
 *        required: true
 *        type: string
 *      - name: passwd
 *        in: body
 *        description: "회원 비밀번호"
 *        required: true
 *        type: string
 *      - name: name
 *        in: body
 *        description: "회원 이름"
 *        required: true
 *        type: string
 *      - name: nickname
 *        in: body
 *        description: "회원 닉네임"
 *        required: true
 *        type: string
 *      - name: email
 *        in: body
 *        description: "회원 이메일"
 *        required: true
 *        type: string
 */

//id,passwd,salt,name,nickname,email
router.post('/signup', async (req, res) => {
    const { id, passwd,name, nickname,email} = req.body;

    if (!id || !passwd || !name || !nickname || !email) {
        res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.OUT_OF_VALUE));
    }

    const getMembershipQuery = "SELECT * FROM user WHERE id = ?";
    const getMembershipResult = await db.queryParam_Parse(getMembershipQuery, [id]);



    if (!getMembershipResult) {//insert 실패
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.MEMBERSHIP_INSERT_FAIL));
    } else if (getMembershipResult[0].length > 0) { //Id 존재 
        res.status(200).send(defaultRes.successFalse(statusCode.NOT_FOUND, resMessage.MEMBERSHIP_INSERT_DUPLICATE));
    } else {

        encrypt.getSalt(res, async (salt) => {
            encrypt.getHashedPassword(passwd, salt, res, async (hashedPassword) => {

                const insertMembershipQuery = "INSERT INTO user (id,passwd,salt,name,nickname,email) VALUES (?,?,?,?,?,?)";
                const insertMembershipResult = await db.queryParam_Parse(insertMembershipQuery,  [id,hashedPassword,salt,name,nickname,email]);

//                console.log(insertMembershipResult[0].insertId);

                if (!insertMembershipResult) {
                    res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.MEMBERSHIP_INSERT_FAIL));
                } else if(insertMembershipResult === 0){
                    res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.USERINFO_SELECT_FAIL));
                }
                else{ //쿼리문이 성공했을 때
                    
                    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.MEMBERSHIP_INSERT_SUCCESS));

                }
            });
        });
    }

});

//중복 조회!!!!!!!!!

router.get('/duplicate/:id', async (req, res) => {
    const { id} = req.params;

    if (!id) {
        console.log("Aaa");
        res.status(200).send(defaultRes.successFalse(statusCode.BAD_REQUEST, resMessage.OUT_OF_VALUE));
    }

    const getIdQuery = "SELECT * FROM user WHERE id = ?";
    const getIdResult = await db.queryParam_Parse(getIdQuery, [id]);



    if (!getIdResult) {//insert 실패
        res.status(200).send(defaultRes.successFalse(statusCode.INTERNAL_SERVER_ERROR, resMessage.MEMBERSHIP_INSERT_FAIL));
    } else if (getIdResult[0].length > 0) { //Id 존재 
        res.status(200).send(defaultRes.successTrue(statusCode.NOT_FOUND, resMessage.MEMBERSHIP_ID_EXIST));
    } else {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.MEMBERSHIP_ID_NOTHING));
    }

});

module.exports = router;
