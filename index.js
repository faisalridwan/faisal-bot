'use strict';

const line = require('@line/bot-sdk');
const express = require('express');
const fs = require('fs');
const path = require('path');
const cp = require('child_process');
const request = require('request'); //HTTP Request

// create LINE SDK config from env variables
const config = {
  channelAccessToken: "mATUoWNJnCyx7DU3CShw+tbyDEkEw0F12xrjKr8Kz82RdndxEHZZv0qBjKtyIP99Xt5Wt8MGSm8rir1J1LoH0iK10GbOTUS4l5qyMnOh9elzr6afb22uVNGbjnvP2HYF3cRZ503BWrzuQbHf3KRnsgdB04t89/1O/w1cDnyilFU=",
  channelSecret: "6b99a6b3f1f02c6585f45c1a38f2e194",
};

// base URL for webhook server
const baseURL = "https://faisal-bot.herokuapp.com";

// create LINE SDK client
const client = new line.Client(config);

// create Express app
// about Express itself: https://expressjs.com/
const app = express();

// serve static and downloaded files
app.use('/static', express.static('static'));
app.use('/downloaded', express.static('downloaded'));

// webhook callback
app.post('/callback', line.middleware(config), (req, res) => {
  // req.body.events should be an array of events
  if (!Array.isArray(req.body.events)) {
    return res.status(500).end();
  }

  // handle events separately
  Promise.all(req.body.events.map(handleEvent))
    .then(() => res.end())
    .catch((err) => {
      console.error(err);
      res.status(500).end();
    });
});

// simple reply function
const replyText = (token, texts) => {
  texts = Array.isArray(texts) ? texts : [texts];
  return client.replyMessage(
    token,
    texts.map((text) => ({ type: 'text', text }))
  );
};

// callback function to handle a single event
function handleEvent(event) {
  switch (event.type) {
    case 'message':
      const message = event.message;
      switch (message.type) {
        case 'text':
          return handleText(message, event.replyToken, event.source);
        case 'image':
          return handleImage(message, event.replyToken);
        case 'video':
          return handleVideo(message, event.replyToken);
        case 'audio':
          return handleAudio(message, event.replyToken);
        case 'location':
          return handleLocation(message, event.replyToken);
        case 'sticker':
          return handleSticker(message, event.replyToken);
        default:
          throw new Error(`Unknown message: ${JSON.stringify(message)}`);
      }

    case 'follow':
      return replyText(event.replyToken, 'Got followed event');

    case 'unfollow':
      return console.log(`Unfollowed this bot: ${JSON.stringify(event)}`);

    case 'join':
      return replyText(event.replyToken, `Joined ${event.source.type}`);

    case 'leave':
      return console.log(`Left: ${JSON.stringify(event)}`);

    case 'postback':
      let data = event.postback.data;
      if (data === 'DATE' || data === 'TIME' || data === 'DATETIME') {
        data += `(${JSON.stringify(event.postback.params)})`;
      }
      return replyText(event.replyToken, `Got postback: ${data}`);

    case 'beacon':
      return replyText(event.replyToken, `Got beacon: ${event.beacon.hwid}`);

    default:
      throw new Error(`Unknown event: ${JSON.stringify(event)}`);
  }
}

function handleText(message, replyToken, source) {
  const buttonsImageURL = `${baseURL}/static/buttons/1040.jpg`;


    if (message.text == 'profile'){
      if (source.userId) {
        return client.getProfile(source.userId)
        .then((profile) => replyText(
          replyToken,
          [
            `Display name: ${profile.displayName}`,
            `Status message: ${profile.statusMessage}`,
          ]
        ));
      } else {
        return replyText(replyToken, 'Bot can\'t use profile API without user ID');
      }
    }
    else if (message.text == 'buttons') {
      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Buttons alt text',
          template: {
            type: 'buttons',
            thumbnailImageUrl: buttonsImageURL,
            title: 'My button sample',
            text: 'Hello, my button',
            actions: [
              { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
              { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
              { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
              { label: 'Say message', type: 'message', text: 'Rice=米' },
            ],
          },
        }
      );
    }
    else if (message.text == 'confirm'){

      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Confirm alt text',
          template: {
            type: 'confirm',
            text: 'Do it?',
            actions: [
              { label: 'Yes', type: 'message', text: 'Yes!' },
              { label: 'No', type: 'message', text: 'No!' },
            ],
          },
        }
      )
    }
    else if (message.text == 'carousel'){

      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Carousel alt text',
          template: {
            type: 'carousel',
            columns: [
              {
                thumbnailImageUrl: buttonsImageURL,
                title: 'hoge',
                text: 'fuga',
                actions: [
                  { label: 'Go to line.me', type: 'uri', uri: 'https://line.me' },
                  { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
                ],
              },
              {
                thumbnailImageUrl: buttonsImageURL,
                title: 'hoge',
                text: 'fuga',
                actions: [
                  { label: '言 hello2', type: 'postback', data: 'hello こんにちは', text: 'hello こんにちは' },
                  { label: 'Say message', type: 'message', text: 'Rice=米' },
                ],
              },
            ],
          },
        }
      );
    }
    else if (message.text =='image carousel'){

      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Image carousel alt text',
          template: {
            type: 'image_carousel',
            columns: [
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Go to LINE', type: 'uri', uri: 'https://line.me' },
              },
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Say hello1', type: 'postback', data: 'hello こんにちは' },
              },
              {
                imageUrl: buttonsImageURL,
                action: { label: 'Say message', type: 'message', text: 'Rice=米' },
              },
              {
                imageUrl: buttonsImageURL,
                action: {
                  label: 'datetime',
                  type: 'datetimepicker',
                  data: 'DATETIME',
                  mode: 'datetime',
                },
              },
            ]
          },
        }
      );
    }
    else if (message.text == 'datetime'){

      return client.replyMessage(
        replyToken,
        {
          type: 'template',
          altText: 'Datetime pickers alt text',
          template: {
            type: 'buttons',
            text: 'Select date / time !',
            actions: [
              { type: 'datetimepicker', label: 'date', data: 'DATE', mode: 'date' },
              { type: 'datetimepicker', label: 'time', data: 'TIME', mode: 'time' },
              { type: 'datetimepicker', label: 'datetime', data: 'DATETIME', mode: 'datetime' },
            ],
          },
        }
      );
    }
    else if (message.text == 'imagemap'){

      return client.replyMessage(
        replyToken,
        {
          type: 'imagemap',
          baseUrl: `${baseURL}/static/rich`,
          altText: 'Imagemap alt text',
          baseSize: { width: 1040, height: 1040 },
          actions: [
            { area: { x: 0, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/manga/en' },
            { area: { x: 520, y: 0, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/music/en' },
            { area: { x: 0, y: 520, width: 520, height: 520 }, type: 'uri', linkUri: 'https://store.line.me/family/play/en' },
            { area: { x: 520, y: 520, width: 520, height: 520 }, type: 'message', text: 'URANAI!' },
          ],
        }
      );
    }
    else if (message.text == 'bye'){

      switch (source.type) {
        case 'user':
        return replyText(replyToken, 'Bot can\'t leave from 1:1 chat');
        case 'group':
        return replyText(replyToken, 'Leaving group')
        .then(() => client.leaveGroup(source.groupId));
        case 'room':
        return replyText(replyToken, 'Leaving room')
        .then(() => client.leaveRoom(source.roomId));
      }
    }
    else if (message.text.startsWith("ig: ")) {
      var username = message.text.replace('ig: ','')
      request({
      url: 'https://www.instagram.com/' + username + '/?__a=1',
      method: "GET",
      headers: {
        'Host': 'www.instagram.com',
        'Cookie': 'mcd=3; mid=W8HU5wALAAGmXFZ11ez3XOkBt6Uz; csrftoken=1h6gru0YwNY6aAJ1Q2OXu5cVsmb6rMqk; shbid=16129; ds_user_id=4942050544; fbm_124024574287414=base_domain=.instagram.com; sessionid=IGSCc9b8315a98280657befee9954c56318cce97cf6b59f8fb2d4eaa941c07dc6106%3ASKF6KD1SXhxA4HtZzGMub4fYnuolyJUB%3A%7B%22_auth_user_id%22%3A4942050544%2C%22_auth_user_backend%22%3A%22accounts.backends.CaseInsensitiveModelBackend%22%2C%22_auth_user_hash%22%3A%22%22%2C%22_platform%22%3A4%2C%22_token_ver%22%3A2%2C%22_token%22%3A%224942050544%3AAuREozPCI5LIKDZ2NZrLpmDRRBdmaD7r%3Aea660db4d27e2cfb86c9ba9f26242d6c1374e65c25886361c238ea1153623c57%22%2C%22last_refreshed%22%3A1539560340.920060873%7D; rur=FRC; fbsr_124024574287414=OxLuUTcZeDLRr8IgUy6K-PQetCp4RcQOv79nMAroosw.eyJhbGdvcml0aG0iOiJITUFDLVNIQTI1NiIsImNvZGUiOiJBUUFNUU9sX280OEI1OF80RXVFMWp2UFNFWDBEcHdWN0dxVE84Y3poY0lnLU5qZjNVZm1HdHV4cW1WcUpoZVBteXk0QnhMdW9rRzhoa3dVYTY2MVBLMmRERmVBOW5aaUtqSjhiNDVfX3gyMlJUT25rVFVpQmxWckVqdHhXdDJaTm1hUWp6WnYzTkxyamRPT1JOd2dvQjl4amJpUjBhVlBWM1p6VGdZUHpfZUdzbm9LajdZQVlrb01zYzBaUzEyWFFQSVF3VmgteVg1TGx0aVYzZjVTaGhUNW92V2JtQU54MlNMa1pJTUtBT2NrcFlnZjI5ZFdKMUhNYkRIUnFWRUczeVlIbm1JMXplMWl5d2NkTDhMUC1DSV80WE5wWjlFVlNyWlBhUmZQN1o5ZVBDNldjNkpaX1gwanR0dy1XbWdVQVBQcHAwY0lPRXZpX05ObVNrd0lVMEFZWCIsImlzc3VlZF9hdCI6MTUzOTU3MzY1NCwidXNlcl9pZCI6IjEwMDAxNzA2NDIxMTEwMiJ9; urlgen="{\"103.233.100.250\": 133357}:1gBtcH:5qYJ6CV_miBB9cbdhFwhelObgac"',
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
    else {

      console.log(`Echo message to ${replyToken}: ${message.text}`);
      return replyText(replyToken, message.text);
    }
  }

function handleImage(message, replyToken) {
  const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.jpg`);
  const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);

  return downloadContent(message.id, downloadPath)
    .then((downloadPath) => {
      // ImageMagick is needed here to run 'convert'
      // Please consider about security and performance by yourself
      cp.execSync(`convert -resize 240x jpeg:${downloadPath} jpeg:${previewPath}`);

      return client.replyMessage(
        replyToken,
        {
          type: 'image',
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
          previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
        }
      );
    });
}

function handleVideo(message, replyToken) {
  const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.mp4`);
  const previewPath = path.join(__dirname, 'downloaded', `${message.id}-preview.jpg`);

  return downloadContent(message.id, downloadPath)
    .then((downloadPath) => {
      // FFmpeg and ImageMagick is needed here to run 'convert'
      // Please consider about security and performance by yourself
      cp.execSync(`convert mp4:${downloadPath}[0] jpeg:${previewPath}`);

      return client.replyMessage(
        replyToken,
        {
          type: 'video',
          originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
          previewImageUrl: baseURL + '/downloaded/' + path.basename(previewPath),
        }
      );
    });
}

function handleAudio(message, replyToken) {
  const downloadPath = path.join(__dirname, 'downloaded', `${message.id}.m4a`);

  return downloadContent(message.id, downloadPath)
    .then((downloadPath) => {
      var getDuration = require('get-audio-duration');
      var audioDuration;
      getDuration(downloadPath)
        .then((duration) => { audioDuration = duration; })
        .catch((error) => { audioDuration = 1; })
        .finally(() => {
          return client.replyMessage(
            replyToken,
            {
              type: 'audio',
              originalContentUrl: baseURL + '/downloaded/' + path.basename(downloadPath),
              duration: audioDuration * 1000,
            }
          );
        });
    });
}

function downloadContent(messageId, downloadPath) {
  return client.getMessageContent(messageId)
    .then((stream) => new Promise((resolve, reject) => {
      const writable = fs.createWriteStream(downloadPath);
      stream.pipe(writable);
      stream.on('end', () => resolve(downloadPath));
      stream.on('error', reject);
    }));
}

function handleLocation(message, replyToken) {
  return client.replyMessage(
    replyToken,
    {
      type: 'location',
      title: message.title,
      address: message.address,
      latitude: message.latitude,
      longitude: message.longitude,
    }
  );
}

function handleSticker(message, replyToken) {
  return client.replyMessage(
    replyToken,
    {
      type: 'sticker',
      packageId: message.packageId,
      stickerId: message.stickerId,
    }
  );
}

// listen on port
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`listening on ${port}`);
});
