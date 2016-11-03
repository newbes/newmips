var globalConf = require('./global');

var mailConf = {
  develop: {
    transport: {
      host : 'ssl0.ovh.net',
      port : 465,
      secure : true,
      auth: {
        user: 'support@newmips.com',
        pass: 'Newmips2015+'
      }
    },
    expediteur: 'NoReply <no-reply@newmips.com>',
    administrateur: 'Responsable Newmips <contact@newmips.com>',
    host: 'http://127.0.0.1:'+globalConf.port
  },

  production: {
    transport: {
      host : 'ssl0.ovh.net',
      port : 465,
      secure : true,
      auth: {
        user: 'support@newmips.com',
        pass: 'Newmips2015+'
      }
    },
    expediteur: 'NoReply <no-reply@newmips.com>',
    administrateur: 'Responsable Newmips <contact@newmips.com>',
    host: 'https://cloud.newmips.com:'+globalConf.port
  },

  recette: {
    transport: {
      host : 'ssl0.ovh.net',
      port : 465,
      secure : true,
      auth: {
        user: 'support@newmips.com',
        pass: 'Newmips2015+'
      }
    },
    expediteur: 'NoReply <no-reply@newmips.com>',
    administrateur: 'Responsable Newmips <contact@newmips.com>',
    host: 'https://cloud.newmips.com:'+globalConf.port
  }
}

module.exports = mailConf[globalConf.env];
