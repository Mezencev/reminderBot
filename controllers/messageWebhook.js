const processMessage = require('../helpers/processMessage');

module.exports = (req, res) => {
  if (req.body.object === 'page') {
    req.body.entry.forEach((entry) => {
      entry.messaging.forEach((event) => {
        if (event.message && event.message.text.toLowerCase() === 'delete') {
          processMessage.reminderDelete(event);
        } else if (event.message && event.message.quick_reply && event.message.quick_reply.payload === 'delete') {
          processMessage.deleteAll(event);
        } else if (event.message && event.message.text) {
          processMessage.botMessage(event);
        } else if (event.postback && event.postback.payload === 'show') {
          processMessage.reminderSnow(event);
        } else if (event.postback && event.postback.payload === 'delete') {
          processMessage.postbackDelete(event);
        } else if (event.postback && event.postback.payload) {
          processMessage.botPostback(event);
        }
      });
    });
    res.status(200).end();
  }
};
