var express = require('express');
var app = express();
var request = require('request');


var WXBizDataCrypt = require('./WXBizDataCrypt')

var appId = '自己的小程序的appid';
var appSecret = '自己的小程序的APPsecret';

app.get('/getUninoid', function (req, res) {
  res.send('hello world')

  var reqs = req.query;
  //console.log(reqs,'获取到的请求参数')


  request('https://api.weixin.qq.com/sns/jscode2session?appid=' + appId + '&secret=' + appSecret + '&js_code=' + reqs.code + '&grant_type=authorization_code', function (error, response, body) {
    if (!error && response.statusCode === 200) {	//通过前端传过来的code获取sessionKey
      console.log(body, '获取sessionKey返回的信息')
      //console.log(typeof body)

      var bodyJson = JSON.parse(body)
      var sessionKey = bodyJson.session_key;

      if (bodyJson.unionid) return;//用户如果有关注公众号可以直接获取到，不用再进行解密

      //获取到sessionKey后，开始进行解密，获取uninoid
      var encryptedData = reqs.encryptedData.replace(/ /g, '+');	//要把空格替换成+，不然会报错，因为前端数据传到后端时+号会被解析成空格，要再换回去
      var iv = reqs.iv.replace(/ /g, '+');

      //console.log(encryptedData,'-------------encryptedData--------------------')
      //console.log(iv,'==========================iv=================')
      //console.log(sessionKey,'++++++++++++++++++++++sessionKey++++++++++++++++++++++++++')

      var pc = new WXBizDataCrypt(appId, sessionKey)

      var data = pc.decryptData(encryptedData, iv)

      console.log('解密后 data: ', data)
      // 解密后的数据为
      //
      // data = {
      //   "nickName": "Band",
      //   "gender": 1,
      //   "language": "zh_CN",
      //   "city": "Guangzhou",
      //   "province": "Guangdong",
      //   "country": "CN",
      //   "avatarUrl": "http://wx.qlogo.cn/mmopen/vi_32/aSKcBBPpibyKNicHNTMM0qJVh8Kjgiak2AHWr8MHM4WgMEm7GFhsf8OYrySdbvAMvTsw3mo8ibKicsnfN5pRjl1p8HQ/0",
      //   "unionId": "ocMvos6NjeKLIBqg5Mr9QjxrP1FA",
      //   "watermark": {
      //     "timestamp": 1477314187,
      //     "appid": "wx4f4bc4dec97d474b"
      //   }
      // }

    }
  })
})

var server = app.listen(8099, function () {
  var host = server.address().address;
  var port = server.address().port;
  console.log('应用实例已启动，访问地址为：http://%s:%s', host, port)
})
