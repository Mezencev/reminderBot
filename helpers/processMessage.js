const API_AI_TOKEN = process.env.API_TOKEN; 
const apiAiClient = require('apiai')(API_AI_TOKEN);

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_TOKEN;
const request = require('request');
const schedule = require('node-schedule');

const db = require('../models/index');

const person = [];


const sendTextMessage = (senderId, message) => { 
  //console.log(message);
  request({ 
    url: 'https://graph.facebook.com/v2.6/me/messages', 
    qs: {access_token: FACEBOOK_ACCESS_TOKEN}, 
    method: 'POST', 
    json: { 
      recipient: {id: senderId}, 
      message: message  
      }        
  }) 
};

exports.botMessage = (event) => { 
  const senderId = event.sender.id; 
  const message = event.message.text;
  console.log(senderId);
  const apiaiSession = apiAiClient.textRequest(message, {sessionId: 'crowbotics_bot'});
  apiaiSession.on('response', (response) => { 
    //console.log('response=',response);
    //console.log('intent=',response.result.metadata.intentName);
    if (response.result.metadata.intentName === 'add reminder') { 
      person.push(response.result.resolvedQuery); 
      console.log(response.result.parameters);
      console.log(response.result.resolvedQuery);
   }
    const result = response.result.fulfillment.speech; 
    //console.log('result=', result);
    const message = {text: result};
    sendTextMessage(senderId, message); 
  });
  apiaiSession.on('error', error => console.log (error)); 
  apiaiSession.end(); 
};

exports.botPostback = (event) => { 
  const senderId = event.sender.id; 
  const message = event.postback.payload;

  const apiaiSession = apiAiClient.textRequest(message, {sessionId: 'crowbotics_bot'});
  apiaiSession.on('response', (response) => { 
   // console.log(response);   
    
    const result = response.result.fulfillment.speech;
    const message = {text: result};
    sendTextMessage(senderId, message);     
  });
  apiaiSession.on('error', error => console.log (error)); 
  apiaiSession.end(); 
};

exports.reminderSnow = (event) => {
  const sender = event.sender.id;
  const result = `You have the reminder ${person}`;
  const message = {text: result}
  sendTextMessage(sender, message);
};
  

var data = { date: '2018-01-29', time: '15:00:00' };
var data1 = new Date(2018, 00, 29, 20, 40, 00);


schedule.scheduleJob(data1, function(){
  console.log(data);
  console.log(x);
  const sender = 1719652861419819;
  const message =  {
    attachment: {
        type: "template",
        payload: {
            template_type: "generic",
            elements: [{
                title: "You have a reminder",
                subtitle: "*************",
                buttons: [
                  {
                    type: "postback",
                    payload: 'accept',
                    title: 'ACCEPT'
                },{
                    type: 'postback',
                    payload: 'snooze',
                    title: 'SNOOZE' 
                }
              ]
            }]
        }
    }
  } 
  sendTextMessage(sender, message);
});



