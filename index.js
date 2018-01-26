require('dotenv').config();
const express = require ('express'); 
const bodyParser = require ('body-parser');
const logger = require('morgan');
const app = express ();

app.use(logger('dev'));

app.use (bodyParser.json ()); 
app.use (bodyParser.urlencoded ({extended: true}));

app.listen (3000, () => console.log('listening in port 3000'));

const verificationController = require('./controllers/verification'); 
const messageWebhookController = require('./controllers/messageWebhook');

app.get ('/', verificationController); 
app.post ('/', messageWebhookController);

