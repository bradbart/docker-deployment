var exec = require('child_process').exec; 
var http = require('http'); 
var gitHubWebHookHandler = require('github-webhook-handler'); 

var config = {}; 
try {
  config = require(__dirname + '/config.js'); 
}
catch (err) {
  console.log("unable to read file '" + fileName + "': ", err)
}

function gitHubDeployment(config) {
    var webhook = gitHubWebHookHandler({path: config.path, secret: config.secret}); 
    webhook.on('push', function (event) {
        deployRepositoryUpdate(config, event); 
    }); 
    return function (request, response) {
        webhook(request, response, function (error) {
            response.statusCode = 404
            response.end('no such location'); 
        }); 
    }
}

function performDeployment(config, event) {
    var repo = event.payload.repository.name;
    var owner = event.payload.repository.owner.name;  
    var branch = event.payload.ref.replace('refs/heads/', ''); 
    var sha = event.payload.after.substring(0, 5); 
    console.log(repo, owner, branch, sha); 
}

gitHubDeploy = gitHubDeployment({path: '/deployments'}); 
http.createServer(function (req, res) {
  gitHubDeploy(req, res); 
}).listen(3000); 
console.log('Application Started on port 3000'); 
