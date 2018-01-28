const API_AI_TOKEN = process.env.API_TOKEN; 
const apiAiClient = require('apiai')(API_AI_TOKEN);

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_TOKEN;
const request = require('request');

const db = require('../models/index');

const reminders = [];


const sendTextMessage = (senderId, text) => { 
  request({ 
    url: 'https://graph.facebook.com/v2.6/me/messages', 
    qs: {access_token: FACEBOOK_ACCESS_TOKEN}, 
    method: 'POST', 
    json: { 
      recipient: {id: senderId}, 
      message: {text}
    } 
  }); 
};

exports.botMessage = (event) => { 
  const senderId = event.sender.id; 
  const message = event.message.text;

  const apiaiSession = apiAiClient.textRequest(message, {sessionId: 'crowbotics_bot'});
  apiaiSession.on('response', (response) => { 
    //console.log(response.result.parameters);
    //console.log('intent=',response.result.metadata.intentName);
    if (response.result.metadata.intentName === 'add reminder') {
      reminders.push(response.result.resolvedQuery); 
    //  console.log(reminders); 
   }
    const result = response.result.fulfillment.speech;
    sendTextMessage(senderId, result); 
  });
  apiaiSession.on('error', error => console.log (error)); 
  apiaiSession.end(); 
};

exports.botPostback = (event) => { 
  const senderId = event.sender.id; 
  const message = event.postback.payload;

  const apiaiSession = apiAiClient.textRequest(message, {sessionId: 'crowbotics_bot'});
  apiaiSession.on('response', (response) => { 
    console.log(response);   
    
    const result = response.result.fulfillment.speech;
    sendTextMessage(senderId, result);     
  });
  apiaiSession.on('error', error => console.log (error)); 
  apiaiSession.end(); 
};






/*quick_replies:[
  {
    content_type:"text",
    title:"create a reminder",
    payload:"create a reminder"
  },
  {
    content_type:"text",
    title:"show all reminders",
    payload:"show all reminders"
  }
]*/
