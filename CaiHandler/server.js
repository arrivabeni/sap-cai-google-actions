/*eslint no-console: 0, no-unused-vars: 0*/
"use strict";

const CAI_TOKEN = 'HERE YOU HAVE TO SET YOU CAI BOT TOKEN'; //Set your CAI bot token here
const CAI_LANGUAGE = 'en'; //Set the language that your bot is prepared to receive
var xsenv = require("@sap/xsenv");
var port = process.env.PORT || 3000;
var sapcai = require('sapcai').default
var request = new sapcai.request(CAI_TOKEN)
const {
	WebhookClient
} = require('dialogflow-fulfillment');
const bodyParser = require('body-parser');

var express = require('express'),
	app = express();

app.use(bodyParser.json());

app.get('/', function (req, res) {
	res.status(405);
	res.send('Method not allowed!');
});

app.post('/', async function (request, response) {
	let returnMessage = "Oops... Can you try again?"; //Set the message as an error in case of nothing came back from CAI
	const agent = new WebhookClient({ request, response	});
	//console.log(new Date() + ' - Dialogflow Request body: ' + JSON.stringify(request.body.queryResult.queryText));

	try {

		var build = new sapcai.build(CAI_TOKEN, CAI_LANGUAGE);
		const res = await build.dialog({
			type: 'text',
			content: request.body.queryResult.queryText
		}, {
			conversationId: 'CONVERSATION_ID'
		})

		if (Array.isArray(res.messages)) {
			if (res.messages.length > 0) {
				returnMessage = res.messages[0].content;
				//console.log(new Date() + ' - ' + returnMessage)
			}
		}

	} catch (error) {
		console.log(error);
	}

	let intentMap = new Map();
	intentMap.set('ConversationalAiFallback', function () {
		agent.add(returnMessage);
	});
	agent.handleRequest(intentMap);

});

var server = app.listen(port);
//console.log('Express server listening on port %s', server.address().port);