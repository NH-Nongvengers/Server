const https = require('https');
const URL = 'developers.nonghyup.com';
const userInfo = require('../config/info.json');
const moment = require('moment');
const iconv = require('iconv-lite');

/**
 * 농협입금이체
 */
exports.receivedTransferAccountNumber = async (
  amount,
  withdrawDescription,
  depositDescription
) => {
  const postData = iconv.encode(
    JSON.stringify({
      Header: {
        ApiNm: 'ReceivedTransferAccountNumber', // API명
        Tsymd: moment().format('YYYYMMDD'), // 오늘 날짜(전송시각)
        Trtm: moment().format('HHmmss'), // 전송시각
        Iscd: userInfo.Iscd, // 기관 코드
        FintechApsno: '001',
        ApiSvcCd: 'ReceivedTransferA', // API 서비스 코드
        IsTuno: moment().format('YYYYMMDDHHmmss'), // 기관 거래고유번호
        AccessToken: userInfo.AccessToken, // 인증키
      },
      Bncd: '011', //은행코드
      Acno: userInfo.sonAccount,
      Tram: amount, //거래금액,
      DractOtlt: withdrawDescription, // 출금계좌 인자 내용
      MractOtlt: depositDescription, // 입금계좌 인자 내용
    }),
    'utf-8'
  );

  const options = {
    hostname: URL,
    port: 443,
    path: '/ReceivedTransferAccountNumber.nh',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
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

  req.write(postData);
  req.end();
};
