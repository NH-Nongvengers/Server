const https = require('https');
const URL = 'developers.nonghyup.com';
const userInfo = require('../config/info.json');
const moment = require('moment');

/**
 * 잔액 확인
 */
exports.inquireBalance = async () => {
  const postData = JSON.stringify({
    Header: {
      ApiNm: 'InquireBalance', // API명
      Tsymd: moment().format('YYYYMMDD'), // 오늘 날짜(전송시각)
      Trtm: moment().format('HHmmss'), // 전송시각
      Iscd: userInfo.Iscd, // 기관 코드
      FintechApsno: '001',
      ApiSvcCd: 'ReceivedTransferA', // API 서비스 코드
      IsTuno: moment().format('YYYYMMDDHHmmss'), // 기관 거래고유번호
      AccessToken: userInfo.AccessToken, // 인증키
    },
    FinAcno: userInfo.finAccount,
  });

  const options = {
    hostname: URL,
    port: 443,
    path: '/InquireBalance.nh',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': postData.length,
    },
  };

  let result = '';
  const req = https.request(options, (res) => {
    console.log(`statusCode: ${res.statusCode}`);
    console.log(`headers: ${res.headers}`);

    res.on('data', (data) => {
      result += data; // Ldbl : 원장잔액
    });

    res.on('end', () => {
      console.log(JSON.parse(result).Ldbl);
    });
  });

  req.on('error', (err) => {
    console.error(err);
  });

  req.write(postData);
  req.on('end', () => {
    return result;
  });
  return result;
};
