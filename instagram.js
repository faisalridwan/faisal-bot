const index = require('./index.js');
module.exports = {
  instagram: function (replyToken, text) {
    var client = index.client;
    var username = text.replace('ig: ','')
    request({
      url: 'https://www.instagram.com/' + username + '/?__a=1',
      method: "GET",
      headers: {
        'Host': 'www.instagram.com',
        'Cookie': process.env.INSTAGRAM_COOKIE,
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8'
      },
      json: true
    }, function (error, response, body){
      if (body.graphql) {
        var result = body.graphql.user;
        let foto = result.profile_pic_url_hd;
        // return replyText(replyToken, 'foto :'+foto)
        return client.replyMessage(replyToken, {
          "type": "image",
          "originalContentUrl": foto,
          "previewImageUrl": foto
        });
      }
    });
  }
}
