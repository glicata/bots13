/*-----------------------------------------------------------------------------
This template demonstrates how to use an IntentDialog with a LuisRecognizer to add 
natural language support to a bot. 
For a complete walkthrough of creating this type of bot see the article at
http://docs.botframework.com/builder/node/guides/understanding-natural-language/
-----------------------------------------------------------------------------*/
"use strict";
var builder = require("botbuilder");
var botbuilder_azure = require("botbuilder-azure");

var useEmulator = (process.env.NODE_ENV == 'development');

var connector = useEmulator ? new builder.ChatConnector() : new botbuilder_azure.BotServiceConnector({
    appId: process.env['MicrosoftAppId'],
    appPassword: process.env['MicrosoftAppPassword'],
    stateEndpoint: process.env['BotStateEndpoint'],
    openIdMetadata: process.env['BotOpenIdMetadata']
});
//?subscription-key=&timezoneOffset=0.0&q=
var bot = new builder.UniversalBot(connector);

// Make sure you add code to validate these fields
var luisAppId = '9d945191-c4e4-46a5-be0a-d1921d588952';
var luisAPIKey = '50b17e35fe2f41d9a20e95c22c7b979d';
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v1/application?id=' + luisAppId + '&subscription-key=' + luisAPIKey;

// Main dialog with LUIS
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
var intents = new builder.IntentDialog({ recognizers: [recognizer] })
/*
.matches('<yourIntent>')... See details at http://docs.botframework.com/builder/node/guides/understanding-natural-language/
*/

.matches('new account', [
	 function (session, args, next) {
        console.log(args);
        //session.dialogData.args = args;
        var accountType = builder.EntityRecognizer.findEntity(args.entities, 'accountType');
        var accountLevel = builder.EntityRecognizer.findEntity(args.entities, 'accountLevel');
        var typeOfPersonalAccount = builder.EntityRecognizer.findEntity(args.entities, 'accountType::typeOfPersonalAccount');
        var typeOfBusinessAccount = builder.EntityRecognizer.findEntity(args.entities, 'accountType::typeOfBusiness');
        console.log('ENTITIES', accountType, accountLevel, typeOfPersonalAccount, typeOfBusinessAccount);
        var account = {
          accountType: accountType ? accountType.entity : null,
          accountLevel: accountLevel ? accountLevel.entity : null,
          typeOfPersonalAccount : typeOfPersonalAccount  ? typeOfPersonalAccount.entity  : null,
          typeOfBusinessAccount: typeOfBusinessAccount? typeOfBusinessAccount.entity : null
        }
        session.dialogData.account = account;
/*
        // Prompt for account type
        var accountTypes = ["Business","Personal"];
        if (!account.accountType) {
          builder.Prompts.choice(session, "What type of account do you want to set up?", accountTypes);
          //builder.Prompts.text(session, 'What type of account do you want to set up? Business or Personal');
        } else {
          next();
        }
    },
    function (session, results, next) {
        console.log('second block');
    	  var account = session.dialogData.account;
		    if (results.response) {
			      console.log('RESPONSE', results);
			      account.accountType = results.response.entity;
        }
        session.dialogData.account = account;

        // Prompt for account level
        if (!account.accountLevel) {
            builder.Prompts.choice(session, "What account level do you want to set up?", ["Basic","Premium"]);
            //builder.Prompts.text(session, 'What level account would you like? Basic or Premium');
        } else {
          next();
        }
    },
    function (session, results, next) {
        console.log('third block');
    	  var account = session.dialogData.account;
		    if (results.response) {
			      console.log('RESPONSE', results);
			      account.accountLevel = results.response.entity;
        }
        session.dialogData.account = account;

        // Prompt for type of business or perosnalaccount level
        if ((account.accountType.toLowerCase() == 'business') && (!account.typeOfBusinessAccount)) {
            builder.Prompts.choice(session, "What type of business do you have?", ["LLC","Sole Proprietorship"]);
        } else if ((account.accountType.toLowerCase() == 'personal') && (!account.typeOfPersonalAccount)) {
            builder.Prompts.choice(session, "What type of personal account do you need?", ["Individual","Joint"]);
        } else {
          next();
        }
    },

    function (session, results) {
        console.log('reply');
        var account = session.dialogData.account;
        if (results.response) {
            console.log('RESPONSE', results);
            if (account.accountType.toLowerCase() == 'business') {
                account.typeOfBusinessAccount = results.response.entity;
            } else if (account.accountType.toLowerCase() == 'personal') {
                account.typeOfPersonalAccount = results.response.entity;
            }


        }
       
        session.send("Intent: 'new account'\n\nAccountType: '%s'\n\nAccountLevel: '%s'\n\nTypeOfBusinessAccount: '%s'\n\nTypeOfPersonalAccount: '%s'",account.accountType, account.accountLevel, account.typeOfBusinessAccount, account.typeOfPersonalAccount);
    }
*/
]);

.onDefault((session) => {
    session.send('Sorry, I did not understand \'%s\'.', session.message.text);
});

bot.dialog('/', intents);    

if (useEmulator) {
    var restify = require('restify');
    var server = restify.createServer();
    server.listen(3978, function() {
        console.log('test bot endpont at http://localhost:3978/api/messages');
    });
    server.post('/api/messages', connector.listen());    
} else {
    module.exports = { default: connector.listen() }
}

