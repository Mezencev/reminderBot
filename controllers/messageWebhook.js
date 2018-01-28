const processMessage = require ('../helpers/processMessage');

module.exports = (req, res) => { 
 // console.log(req.body);
 // console.log(req.body.entry[0].messaging[0].postback);
  if (req.body.object === 'page') { 
    req.body.entry.forEach(entry => { 
      entry.messaging.forEach(event => { 
        if (event.message && event.message.text) { 
          console.log('event=', event);
          processMessage.botMessage(event); 
        } else if (event.postback && event.postback.payload) {
          console.log(event.postback.payload);
          console.log(event);
          processMessage.botPostback(event);
        }
      }); 
    });
    res.status(200).end (); 
  } 
};

  
