const https = require('https');
const URL = 'developers.nonghyup.com';
const userInfo = require('../config/info.json');
const moment = require('moment');
const iconv = require('iconv-lite');

/**
 * 출금 이체
 */
exports.drawTransfer = async (amount, description) => {
  const postData = iconv.encode(
    JSON.stringify({
      Header: {
        ApiNm: 'DrawingTransfer', // API명
        Tsymd: moment().format('YYYYMMDD'), // 오늘 날짜(전송시각)
        Trtm: moment().format('HHmmss'), // 전송시각
        Iscd: userInfo.Iscd, // 기관 코드
        FintechApsno: '001',
        ApiSvcCd: 'DrawingTransferA', // API 서비스 코드
        IsTuno: moment().format('YYYYMMDDHHmmss'), // 기관 거래고유번호
        AccessToken: userInfo.AccessToken, // 인증키
      },
      FinAcno: userInfo.finAccount,
      Tram: amount, // 거래 금액
      DractOtlt: description,
    }),
    'utf-8'
  );

  const options = {
    hostname: URL,
    port: 443,
    path: '/DrawingTransfer.nh',
    method: 'POST',
    URIEncoding: 'UTF-8',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
      'Content-Length': postData.length,
    },
  };

  const req = https.request(options, (res) => {
    // console.log(`statusCode: ${res.statusCode}`);
    // console.log(`headers: ${res.headers}`);

    res.on('data', (data) => {
      // process.stdout.write(data);
    });
  });

  req.on('error', (err) => {
    console.error(err);
  });

  req.write(postData, 'utf-8');
  req.end();
};
