const API_AI_TOKEN = process.env.API_TOKEN; 
const apiAiClient = require('apiai')(API_AI_TOKEN);

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_TOKEN;
const request = require('request');
const schedule = require('node-schedule');

const {user} = require('../models');
const person = [];
const {reminder} = require('../models');

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
      const time = response.result.parameters.date;
      const time2 = response.result.parameters.time;
      const time3 =Date.parse(`${time}  ${time2}`);
      reminder.create({
        content: response.result.resolvedQuery,
        data: time3,
        name: senderId
      })
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
  const result = `You have the reminder:   ${person}`;
  const message = {text: result}
  sendTextMessage(sender, message);
};


/*var time2 = { date: '2018-01-29', time: '15:00:00' };
var time3 = time2.date; 
var time4 = time2.time;
var time5 = (`${time3}  ${time4}`);


console.log(Date.parse(time5));*/

const data = Date.now();
console.log(data);
const data1 = 1517332600000;


schedule.scheduleJob('10 * * * * *', function(){
  
  if (Date.now() === data1) {
    const sender = 1719652861419819;
    const message =  {
      attachment: {
        type: "template",
        payload: {
            template_type: "generic",
            elements: [{
                title: "You have a reminder",
                subtitle: `${person}`,
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
 }
});

/*var j = schedule.scheduleJob(date, function(){
  // Send push notification
});

// later on
var job_method = j.job;
j.cancel();
var new_job = schedule.scheduleJob(date, job_method);*/
reminder.findAll().then((reminders) => {
  Array.isArray(reminders);
  const line1 = reminders[0];
  console.log(line1.dataValues.data);
  const data1 = line1.dataValues.data;
});

