const gcm = require('node-gcm');
const apn = require('apn');
let loopback = require('loopback');

class NotificationHandlerClass {
  constructor() {

    // TODO: possibly start the apn connection and the gcm sender?
  }

  notify(sphereModel, messageSettings) {
    // get users
    let iosTokens = [];
    let androidTokens = [];

    sphereModel.users({include: {relation: 'devices', scope: {include: 'installations'}}}, (err, users) => {
      // collect all tokens.
      for (let i = 0; i < users.length; i++) {
        let devices = users[i].devices();
        for (let j = 0; j < devices.length; j++) {
          let installations = devices[j].installations();
          for (let k = 0; k < installations.length; k++) {
            switch (installations[k].deviceType) {
              case 'ios':
                console.log("HER")
                iosTokens.push(installations[k].deviceToken);
                break;
              case 'android':
                androidTokens.push(installations[k].deviceToken);
                break;
            }
          }
        }
      }
      console.log('iosTokens', iosTokens, 'androidTokens', androidTokens);

      // check if we have to do something
      if (iosTokens.length > 0 || androidTokens.length > 0) {
        // get app, currently hardcoded.
        loopback.getModel("App").findOne({where: {name: 'Crownstone.consumer'}})
          .then((appResult) => {
            console.log(appResult);
            if (appResult && appResult.pushSettings) {
              this._notifyAndroid(appResult.pushSettings.gcm, androidTokens);
              this._notifyIOS(appResult.pushSettings.apns, iosTokens);
            }
            else {
              throw "No App to Push to."
            }
          })
      }
    });
  }


  /**
   * Notify all android devices
   * @param keys      // { serverApiKey: 'xxxxxxx' }
   * @param tokens    // array of tokens
   * @private
   */
  _notifyAndroid(keys, tokens) {
    // Create a message

    // ... or some given values
    let message = new gcm.Message({
      collapseKey: 'demo',
      priority: 'high',
      contentAvailable: true,
      delayWhileIdle: true,
      timeToLive: 3,
      restrictedPackageName: "somePackageName",
      dryRun: true,
      data: {
        key1: 'message1',
        key2: 'message2'
      },
      notification: {
        title: "Hello, World",
        icon: "ic_launcher",
        body: "This is a notification that will be displayed if your app is in the background."
      }
    });

    // Change the message data
    // ... as key-value
    message.addData('key1', 'message1');
    message.addData('key2', 'message2');

    // ... or as a data object (overwrites previous data object)
    message.addData({
      key1: 'message1',
      key2: 'message2'
    });

    // Set up the sender with you API key
    let sender = new gcm.Sender(keys.serverApiKey);

    // Add the registration tokens of the devices you want to send to

    sender.send(message, {registrationTokens: tokens}, function (err, response) {
      if (err) console.error(err);
      else     console.log("ANDROID PUSH RESPONSE", response);
    });

  }


  /**
   * Notify all IOS devices
   * @param keys      // {
   *                  //   keyToken: "-----BEGIN PRIVATE KEY-----\n<token here>\n-----END PRIVATE KEY-----',
                      //   keyId: 'xx',
                      //   teamId: 'xx'
                      // }
   * @param tokens    // array of tokens
   * @private
   */
  _notifyIOS(keys, tokens) {
    let options = {
      token: {
        key: keys.keyToken,
        keyId: keys.keyId,
        teamId: keys.teamId
      },
      production: false
    };

    let apnProvider = new apn.Provider(options);

    let notification = new apn.Notification();

    notification.expiry = Math.floor(Date.now() / 1000) + 3600; // Expires 1 hour from now.
    notification.badge = 0;                     // 0 = remove badge
    notification.sound = "ping.aiff";                           // do not add if no sound should play
    notification.alert = "Crownstone has been switched!";       // alert message, do not add if no alert has to be shown.
    notification.body =  "It was awesome!";       // alert message body, do not add if no alert has to be shown.
    notification.payload = {'switch this thing': 'stoney the stone'};
    // notification.contentAvailable = 1;                      // add this for silent push

    // Send the notification to the API with send, which returns a promise.

    apnProvider.send(notification, tokens)
      .then((result) => {
        console.log("IOS PUSH RESULT", JSON.stringify(result, undefined,2));
      })
      .then(() => {
        apnProvider.shutdown()
      })
      .catch((err) => {
        console.log("ERROR DURING PUSH!", err)
      })
  }

  _notifyEndpoints() {
    // todo: add notification endpoints model slaved to sphere
  }

}

module.exports = new NotificationHandlerClass();