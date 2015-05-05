#!/bin/env node

var restify = require('restify');
var whatsapi = require('whatsapi');

 
var ip_addr = process.env.OPENSHIFT_NODEJS_IP   || '127.0.0.1';
var port    = process.env.OPENSHIFT_NODEJS_PORT || '8090';
 
var server = restify.createServer({
    name : "wassup"
});

var sendernum = ''; // phone number with country code

var wa = whatsapi.createAdapter({
    msisdn: sendernum, // phone number with country code
    username: '', // your name on WhatsApp
    password: '', // WhatsApp password
    ccode: '91' // country code
});



var recipient = '',
    text      = '',
    image     = '',
    video     = '',
    audio     = '',
    vcard     = '',
    vcardName = '';


server.use(restify.acceptParser(server.acceptable));
server.use(restify.queryParser());
server.use(restify.bodyParser());
server.use(restify.CORS());
server.use(restify.queryParser());
 
var PATH = '/'
server.get({path : PATH +'/' , version : '0.0.1'} , index);
server.get({path : PATH +'msg/:num/:msg' , version : '0.0.1'} , msg);
server.get({path : PATH +'img/:num' , version : '0.0.1'} , img);
server.get({path : PATH +'vid/:num' , version : '0.0.1'} , vid);
server.get({path : PATH +'aud/:num' , version : '0.0.1'} , aud);
server.get({path : PATH +'vcard/:num' , version : '0.0.1'} , vc);

function index(req, res, next) {
  res.send('Whatsapp API. Developed by Srinivas Gowda.');
  next();
}

wa.connect(function connected(err) {
    if (err) { console.log(err); return; }
    console.log('Connected');
    // Now login
    wa.login(logged);
});

function logged(err) {
    if (err) { console.log(err); return; }
    console.log('Logged in to WA server');
}

function msg(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('content-type', 'application/json');
    recipient = req.params.num;
    text = req.params.msg;
    console.log(recipient);
    
    wa.sendIsOnline();

    wa.sendComposingState(sendernum);
    setTimeout(function() {
        wa.sendPausedState(sendernum);
    }, 2000);

    wa.sendMessage(recipient, text, function(err, id) {
        if (err) { console.log(err.message); return; }
        console.log('Server received message %s', id);
    });
    wa.sendIsOffline();
    res.send('Message Submitted');
    return next();
};

function img(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('content-type', 'application/json');
    recipient = req.params.num;
    image = req.query.image;
    console.log(recipient);
    
    wa.sendIsOnline();

    wa.sendComposingState(sendernum);
    setTimeout(function() {
        wa.sendPausedState(sendernum);
    }, 2000);

    wa.sendImage(recipient, image, function(err, id) {
        if (err) { console.log(err.message); return; }
        console.log('Server received message %s', id);
    });
    wa.sendIsOffline();
    res.send('Image Submitted');
    return next();
};

function vid(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('content-type', 'application/json');
    recipient = req.params.num;
    video = req.query.video;
    console.log(recipient);
    
    wa.sendIsOnline();

    wa.sendComposingState(sendernum);
    setTimeout(function() {
        wa.sendPausedState(sendernum);
    }, 2000);

    wa.sendVideo(recipient, video, function(err, id) {
        if (err) { console.log(err.message); return; }
        console.log('Server received message %s', id);
    });
    wa.sendIsOffline();
    res.send('Video Submitted');
    return next();
};

function aud(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('content-type', 'application/json');
    recipient = req.params.num;
    audio = req.query.audio;
    console.log(recipient);
    
    wa.sendIsOnline();

    wa.sendComposingState(sendernum);
    setTimeout(function() {
        wa.sendPausedState(sendernum);
    }, 2000);

    wa.sendAudio(recipient, audio, function(err, id) {
        if (err) { console.log(err.message); return; }
        console.log('Server received message %s', id);
    });

    wa.sendIsOffline();

    res.send('Audio Submitted');
    return next();
};

function vc(req, res , next){
    res.setHeader('Access-Control-Allow-Origin','*');
    res.setHeader('content-type', 'application/json');
    recipient = req.params.num;
    vcard = req.query.vcard;
    vcardName = req.query.name;
    console.log(recipient);
    
    wa.sendIsOnline();

    wa.sendComposingState(sendernum);
    setTimeout(function() {
        wa.sendPausedState(sendernum);
    }, 2000);

    wa.sendVcard(recipient, vcard, vcardName, function(err, id) {
        if (err) { console.log(err.message); return; }
        console.log('Server received message %s', id);
    });

    wa.sendIsOffline();

    res.send('Vcard Submitted');
    return next();
};


server.listen(port ,ip_addr, function(){
    log.info('%s listening at %s ', server.name , server.url);
});

