var crypto = require("crypto")
var request = require('request');

var key = '6IHHFVBsnjEObKAipUDO9d8XZKJCczPNCaOljLouyDAo851Cv3qxk20lOgzXjdtJ3VUovSaxHCoaAuLg0pYL+g=='
var workspaceId = '27a9c0b3-1d53-40da-a36f-cabb54070817';
var apiVersion = '2016-04-01';


async function run (context, eventHubMessages) {
    context.log(`JavaScript eventhub trigger function called for message array ${eventHubMessages}`);
    
    eventHubMessages.forEach((message, index) => {
        context.log(`Processed message ${message}`);

        var contentLength = Buffer.byteLength(message,'utf8');
        
        var GMTTime = new Date().toUTCString()

        var StringToSign = 'POST' + '\n'
            + contentLength+'\n'
            + 'application/json' + '\n'
            +'x-ms-date:'+ GMTTime + '\n'
            + '/api/logs'  
        var Sig = crypto.createHmac('sha256', Buffer.from(key, 'base64')).update(StringToSign, 'utf-8').digest('base64');
   
        var authorization = 'SharedKey ' + workspaceId + ':' + Sig;
        var headers = {
            "Content-Type":"application/json",
            "Authorization": authorization,
            "Log-Type": 'github',
            // paris time
            "x-ms-date": GMTTime,
            "time-generated-field" : new Date().toISOString
        };

        var url = 'https://' + workspaceId + '.ods.opinsights.azure.com/api/logs?api-version=' + apiVersion;

        request.post({ 
            url: url, 
            headers: headers, 
            body: message 
        }, function (error, response){
            if (error){
                context.log(error)
            } else {
                context.log(response.statusCode + "   " + response.statusMessage)
            }
  
      });


    });
};

module.exports = run;