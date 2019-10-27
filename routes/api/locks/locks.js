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

//잠금 정책 추가
//접근관리자도??

//잠금정책에서 특정 잠금 대상 시간 목표 추가
//접근 관리자도??

//잠금정책에서 특정 잠금 대상 시간 목표 수정
//접근 관리자도??

//잠금정책에서 특정 잠금 대상 시간 목표 삭제
//접근 관리자도??

//잠금정책 목록 조회
//접근 관리자도??
