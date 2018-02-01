const API_AI_TOKEN = process.env.API_TOKEN; 
const apiAiClient = require('apiai')(API_AI_TOKEN);

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_TOKEN;
const request = require('request');
const schedule = require('node-schedule');
const moment = require('moment');

const {user} = require('../models');
const person = [];
const {reminder} = require('../models');

const sendTextMessage = (senderId, message) => { 
  console.log(message);
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
    if (response.result.metadata.intentName === 'add reminder') { 
      person.push(response.result.resolvedQuery); 
      const time = response.result.parameters.date;
      const time2 = response.result.parameters.time;
      const time3 = Date.parse(`${time}  ${time2}`);
      console.log('time=', time, 'time2=', time2, 'time3=',time3);
      reminder.create({
        content: response.result.resolvedQuery,
        data: time3,
        name: senderId
      })
   }
    const result = response.result.fulfillment.speech; 
    const message = {text: result};
    sendTextMessage(senderId, message); 
  });
  apiaiSession.on('error', error => console.log (error)); 
  apiaiSession.end(); 
};

exports.botPostback = (event) => { 
  const senderId = event.sender.id; 
  const message = event.postback.payload;
  console.log(message);
  const arr = message.split('_');
  const accept = arr[0];
  if (accept === 'accept') {
    console.log(senderId);
    const name = arr[1];
    console.log(name);
    reminder.destroy({ where: {id: name}}).then((reminders) => {
      const result = 'Your reminder is delayed.';
      const message = {text: result};
      console.log('welcome');
      sendTextMessage(senderId, message);
      })
  } else if (arr === 'snooze') {
      console.log('good bay')
      reminder.find({ where: {id: 2}}).then((reminders) => { 
        if(reminders) {
          reminders.updateAttributes({data: Date.now()}).then((reminders) => {
            const result = 'job done.';
            const message = {text: result};
            sendTextMessage(senderId, message);
          })
        }
      })
  } else {
    console.log('create my reminder');
    const apiaiSession = apiAiClient.textRequest(message, {sessionId: 'crowbotics_bot'});
    apiaiSession.on('response', (response) => { 
      console.log('response= ', response);  
      const result = response.result.fulfillment.speech;
      const message = {text: result};
      sendTextMessage(senderId, message);     
    })
    apiaiSession.on('error', error => console.log (error)); 
    apiaiSession.end(); 
  }
}  

exports.reminderSnow = (event) => {
  const sender = event.sender.id;
  const result = `You have the reminder:   ${person}`;
  const message = {text: result}
  sendTextMessage(sender, message);
};

schedule.scheduleJob('*/1 * * * *', function(){
  console.log('shedule');
  const dateTime = new Date();
  const ttt = moment(dateTime).format("YYYY-MM-DD HH:mm");
  console.log(ttt);
  
  const data1 = '2018-02-01 00:45:16.592+02'; 
  reminder.find({where: { data: data1 } }).then((reminders) => {
    const line1 = reminders[0];
    console.log(reminders);
    console.log('////////////////',line1.dataValues.data); //2018-02-01T05:51:49.260Z*/
    const id = line1.dataValues.id;
    const sender = line1.dataValues.name;
    const content = line1.dataValues.content
    const message =  {
        attachment: {
          type: "template",
          payload: {
            template_type: "generic",
            elements: [{
                title: "You have a reminder",
                subtitle: `${content}`,
                buttons: [
                  {
                    type: "postback",
                    payload: `accept_${id}`,
                    title: 'ACCEPT'
                },{
                    type: 'postback',
                    payload: `snooze_${id}`,
                    title: 'SNOOZE' 
                }
              ]
            }]
          }
        }
      } 
      sendTextMessage(sender, message);
    }
   )
});


