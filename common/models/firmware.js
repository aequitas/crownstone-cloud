"use strict";

const debug = require('debug')('loopback:dobots');

module.exports = function(model) {

  /************************************
   **** Model Validation
   ************************************/

  model.validatesUniquenessOf('version', {message: 'This firmware version already exists.'});
  model.validatesUniquenessOf('downloadUrl', {message: 'This firmware download url already exists.'});

  let app = require('../../server/server');
  if (app.get('acl_enabled')) {
    model.disableRemoteMethodByName('find');

    //***************************
    // GENERAL:
    //   - nothing
    //***************************
    model.settings.acls.push(
      {
        "accessType": "*",
        "principalType": "ROLE",
        "principalId": "$everyone",
        "permission": "DENY"
      }
    );
    model.settings.acls.push(
      {
        "accessType": "READ",
        "principalType": "ROLE",
        "principalId": "$everyone",
        "permission": "ALLOW"
      }
    );
  }

  model.disableRemoteMethodByName('create');
  model.disableRemoteMethodByName('replaceOrCreate');
  model.disableRemoteMethodByName('patchOrCreate');
  model.disableRemoteMethodByName('exists');
  model.disableRemoteMethodByName('findById');
  model.disableRemoteMethodByName('find');
  model.disableRemoteMethodByName('findOne');
  model.disableRemoteMethodByName('destroyById');
  model.disableRemoteMethodByName('deleteById');
  model.disableRemoteMethodByName('count');
  model.disableRemoteMethodByName('replaceById');
  model.disableRemoteMethodByName('createChangeStream');
  model.disableRemoteMethodByName('updateAll');
  model.disableRemoteMethodByName('replaceOrCreate');
  model.disableRemoteMethodByName('replaceById');
  model.disableRemoteMethodByName('prototype.patchAttributes');
  model.disableRemoteMethodByName('patchById');
  model.disableRemoteMethodByName('upsertWithWhere');



  model.getByVersion = function(version, callback) {
    model.find({version: version})
			.then((result) => {
				callback(null, result)
			})
			.catch((err) => {
        callback(err)
			})
  };

  model.remoteMethod(
    'getByVersion',
    {
      http: {path: '/getByVersion', verb: 'get'},
      accepts: [
        {arg: 'version', type: 'string', required: true, http: { source : 'query' }},
      ],
      description: "Get firmware details by version number."
    }
  );
};