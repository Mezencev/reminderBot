const API_AI_TOKEN = process.env.API_TOKEN; 
const apiAiClient = require('apiai')(API_AI_TOKEN);

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_TOKEN;
const request = require('request');
const schedule = require('node-schedule');

const db = require('../models/index');

const person = [];
const time = [];

const sendTextMessage = (senderId, result) => { 
  request({ 
    url: 'https://graph.facebook.com/v2.6/me/messages', 
    qs: {access_token: FACEBOOK_ACCESS_TOKEN}, 
    method: 'POST', 
    json: { 
      recipient: {id: senderId}, 
      message: {text: result}  
      }        
  }) 
};

exports.botMessage = (event) => { 
  const senderId = event.sender.id; 
  const message = event.message.text;
  console.log('event=', event);
  const apiaiSession = apiAiClient.textRequest(message, {sessionId: 'crowbotics_bot'});
  apiaiSession.on('response', (response) => { 
    console.log('response=',response);
    //console.log('intent=',response.result.metadata.intentName);
    if (response.result.metadata.intentName === 'add reminder') { 
      person.push(response.result.resolvedQuery); 
      time.push(response.result.parameters);
      console.log(response.result.parameters.date);
      console.log(time);
   }
    const result = response.result.fulfillment.speech;
    console.log('result=', result);
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

exports.reminderSnow = (event) => {
  const sender = event.sender.id;
  const result = `You have the reminder ${person}`;
  sendTextMessage(sender, result);
};
  

var data = { date: '2018-01-29', time: '15:00:00' };
var data1 = new Date(2018, 00, 29, 18, 07, 00);

var x = 'Tada!';
var j = schedule.scheduleJob(data1, function(event){
  console.log(data);
  console.log(x);
  const senderId = 1719652861419819;
  const result = {
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
       sendTextMessage(senderId, result); 
      }     
    );



/*{
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
}*/