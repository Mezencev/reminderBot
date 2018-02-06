const API_AI_TOKEN = process.env.API_TOKEN;
const apiAiClient = require('apiai')(API_AI_TOKEN);
const FACEBOOK_ACCESS_TOKEN = process.env.FACEBOOK_TOKEN;
const Sequelize = require('sequelize');
const op = Sequelize.Op;
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
  const apiaiSession = apiAiClient.textRequest(message, { sessionId: `${senderId}` });
  apiaiSession.on('response', (response) => {
    if (response.result.metadata.intentName === 'add reminder') {
      const time = response.result.parameters.date;
      const time2 = response.result.parameters.time;
      const time3 = Date.parse(`${time}  ${time2}`);
      const arr = response.result.resolvedQuery.split(':');
      const postbackReminder = arr[1];
      reminder.create({
        reminder: postbackReminder,
        date: time3,
        facebookId: senderId,
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
  const postbackMessage = arr[0];
  if (postbackMessage === 'accept') {
    const userId = arr[1];
    reminder.destroy({ where: { id: userId } }).then(() => {
      const message = { text: 'job done' };
      sendTextMessage(senderId, message);
    });
  } else if (postbackMessage === 'snooze') {
    const userId = arr[1];
    reminder.find({ where: { id: userId } }).then((result) => {
      if (result) {
        const dateTime = new Date();
        const dataMoment = moment(dateTime).format('YYYY-MM-DD HH:mm');
        const dataPars = Date.parse(dataMoment);
        const dataDelayd = dataPars + 1800000;
        result.updateAttributes({ data: dataDelayd }).then(() => {
          const message = { text: 'Your reminder is delayed.' };
          sendTextMessage(senderId, message);
        });
      }
    });
  } else {
    const apiaiSession = apiAiClient.textRequest(message, { sessionId: `${senderId}` });
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
  const senderId = event.sender.id;
  reminder.findAll({ where: { facebookId: senderId } }).then((result) => {
    if (result.length === 0) {
      const message = { text: 'You have not reminders.' };
      sendTextMessage(senderId, message);
    } else {
      result.map((i) => {
        const youReminders = i.dataValues.reminder;
        const message = { text: `You have the reminder:   ${youReminders}` };
        sendTextMessage(senderId, message);
      })
    }
  });
};
schedule.scheduleJob('*/1 * * * *', () => {
  reminder.findAll({ where: { date: { [op.lte]: new Date() } } }).then((result) => { 
    if (result[0]) {
      result.map((i) => {
        const id = i.dataValues.id;
        const senderId = i.dataValues.facebookId;
        const reminder = i.dataValues.reminder;
        const message = {
          attachment: {
            type: 'template',
            payload: {
              template_type: 'generic',
              elements: [{
                title: 'You have a reminder',
                subtitle: `${reminder}`,
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
        sendTextMessage(senderId, message);
      })
    }
  });
});

exports.reminderDelete = (event) => {
  const senderId = event.sender.id;
  reminder.findAll({ where: { facebookId: senderId } }).then((result) => {
    if (result.length === 0) {
      const message = { text: 'You have not reminders.' };
      sendTextMessage(senderId, message);
    } else {
      result.map((i) => {
        const youReminders = i.dataValues.reminder;
        const result = {
          text: `Are you sure you want to delete ${youReminders}` ,
          quick_replies: [
            {
              content_type: 'text',
              title: 'Yes.',
              payload: 'delete',
            },
            {
              content_type: 'text',
              title: 'No',
              payload: 'no',
            },
          ],
        };
        sendTextMessage(senderId, result);
      })
    }
})};
exports.deleteAll = (event) => {
  const senderId = event.sender.id;
  reminder.destroy({ where: { facebookId: senderId } }).then(() => {
    const message = { text: 'You have not reminders.' };
    sendTextMessage(senderId, message);
  });
};
