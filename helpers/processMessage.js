const API_AI_TOKEN = process.env.API_TOKEN; 
const apiAiClient = require('apiai')(API_AI_TOKEN);

const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_TOKEN;
const request = require('request');
const schedule = require('node-schedule');
const moment = require('moment');

const { user } = require('../models');
const { reminder } = require('../models');

const sendTextMessage = (senderId, message) => {
  request({
    url: 'https://graph.facebook.com/v2.6/me/messages',
    qs: { access_token: FACEBOOK_ACCESS_TOKEN },
    method: 'POST',
    json: {
      recipient: { id: senderId },
      message: message 
    }     
  });
};

exports.botMessage = (event) => {
  const senderId = event.sender.id;
  const message = event.message.text;
  const apiaiSession = apiAiClient.textRequest(message, { sessionId: 'crowbotics_bot' });
  apiaiSession.on('response', (response) => {
    if (response.result.metadata.intentName === 'add reminder') {
      const time = response.result.parameters.date;
      const time2 = response.result.parameters.time;
      const time3 = Date.parse(`${time}  ${time2}`);
      console.log(time3);
      reminder.create({
        content: response.result.resolvedQuery,
        data: time3,
        name: senderId,
      });
    }
    const result = response.result.fulfillment.speech;
    const message = { text: result };
    sendTextMessage(senderId, message);
  });
  apiaiSession.on('error', error => console.log(error));
  apiaiSession.end();
};

exports.botPostback = (event) => {
  const senderId = event.sender.id;
  const message = event.postback.payload;
  const arr = message.split('_');
  const accept = arr[0];
  if (accept === 'accept') {
    const name = arr[1];
    reminder.destroy({ where: { id: name } }).then((reminders) => {
      const result = 'job done.';
      const message = { text: result };
      sendTextMessage(senderId, message);
    });
  } else if (accept === 'snooze') {
    const name = arr[1];
    reminder.find({ where: { id: name } }).then((reminders) => {
      if (reminders) {
        const dateTime = new Date();
        const dataMoment = moment(dateTime).format('YYYY-MM-DD HH:mm');
        const dataPars = Date.parse(dataMoment);
        const dataDelayd = dataPars + 1800000;
        reminders.updateAttributes({ data: dataDelayd }).then((reminders) => {
          const result = 'Your reminder is delayed..';
          const message = { text: result };
          sendTextMessage(senderId, message);
        });
      }
    });
  } else {
    const apiaiSession = apiAiClient.textRequest(message, { sessionId: 'crowbotics_bot' });
    apiaiSession.on('response', (response) => {
      const result = response.result.fulfillment.speech;
      const message = { text: result };
      sendTextMessage(senderId, message);
    });
    apiaiSession.on('error', error => console.log(error));
    apiaiSession.end();
  }
};
exports.reminderSnow = (event) => {
  const sender = event.sender.id;
  reminder.findAll({ where: { name: sender } }).then((reminders) => {
    if (reminders.length >= 1) {
      console.log(reminders.length);
      reminders.map((i) => {
        const YouReminders = i.dataValues.content;
        const result = `You have the reminder:   ${YouReminders}`;
        const message = { text: result };
        sendTextMessage(sender, message);
      });
    } else {
      const message = { text: 'You have not reminders.' };
      sendTextMessage(sender, message);
    }
  });
};
schedule.scheduleJob('*/1 * * * *', () => {
  const dateTime = new Date();
  const formatData = moment(dateTime).format('YYYY-MM-DD HH:mm'); 
  reminder.findAll({ where: { data: formatData } }).then((reminders) => {
    if (reminders[0]) {
      const line1 = reminders[0];
      const id = line1.dataValues.id;
      const sender = line1.dataValues.name;
      const content = line1.dataValues.content;
      const message = {
        attachment: {
          type: 'template',
          payload: {
            template_type: 'generic',
            elements: [{
              title: 'You have a reminder',
              subtitle: `${content}`,
              buttons: [
                {
                  type: 'postback',
                  payload: `accept_${id}`,
                  title: 'ACCEPT',
                }, {
                  type: 'postback',
                  payload: `snooze_${id}`,
                  title: 'SNOOZE',
                },
              ],
            }],
          },
        },
      };
      sendTextMessage(sender, message);
    }
  });
});

exports.reminderDelete = (event) => {
  const sender = event.sender.id;
  const message = {
    text: 'Are you sure you want to delete your reminders?',
    quick_replies: [
      {
        content_type: 'text',
        title: 'Yes, I am sure.',
        payload: '<POSTBACK_PAYLOAD>',
      },
      {
        content_type: 'text',
        title: 'No',
        payload: '<POSTBACK_PAYLOAD>',
      },
    ],
  };
  sendTextMessage(sender, message);
};
exports.deleteAll = (event) => {
  const sender = event.sender.id;
  reminder.destroy({ where: { name: sender } }).then((reminders) => {
    const message = { text: 'You have not reminders.' };
    sendTextMessage(sender, message);
  });
};
