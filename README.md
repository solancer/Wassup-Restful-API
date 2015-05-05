# Wassup-Restful-API
A Restful API for whatsapp messenger allows to send text, images, video, vcard, audio, through its API calls. Below are examples of how you can send messages.
  * Text   url (/msg/91XXXXXXXXXX/your text message)
  - Video  url (/vid/91XXXXXXXXXX?video=video_url)
  * Image  url (img/91XXXXXXXXXX?image=image_url)
  - Audio  url (aud/91XXXXXXXXXX?audio=audio_url)
  * Vcard  url (vcard/91XXXXXXXXXX?vcard=audio_url&name=your name)

If you want to host the app then you might want to consider openshift. I've configured this app for Openshift's NodeJS Server instance. All you have to do is to clone the repo and push it to your openshift instance [1]:

Before trying out the app make sure you change you user creds in index.js
```javascript
var sendernum = ''; // phone number with country code

var wa = whatsapi.createAdapter({
    msisdn: sendernum, // phone number with country code
    username: '', // your name on WhatsApp
    password: '', // WhatsApp password
    ccode: '91' // country code
});
```
You can get your whatsapp password using yowsup or Android password extractor.

### Tech

Wassup-Restful-API uses below mentioned of open source projects to work properly:

* [Restify]
* [whatsapi]



