'use strict';

var fs = require('fs');
var path = require('path');
var Sequelize = require('sequelize');
var basename = path.basename(module.filename);
var env = require('../config/global');
var config = require('../config/database');
var db = {};
var allModels = [];
var exec = require('child_process').exec;
var cmd = "";

var moment_timezone = require('moment-timezone');

var sequelize = new Sequelize(config.connection.database, config.connection.user, config.connection.password, {
    host: config.connection.host,
    logging: console.log,
    port: config.connection.port,
    dialectOptions: {
        multipleStatements: true
    },
    define: {
        timestamps: false
    },
    timezone: moment_timezone.tz.guess()
});

sequelize.customAfterSync = function() {

    return new Promise(function(resolve, reject) {

        var promises = [];

        /* This hook is called before the Sequelize sync */
        /* Sequelize sync can't alter table to create new foreign key */
        /* Sequelize just drop and create tables IF NOT EXISTS */
        /* So to create new associations on existing tables we need to drop those tables */
        /* And then the Sequelize Sync will create the table with the new foreign key and references in it */
        var optionsFileName;
        var optionsFile;
        var optionsObject;
        var attributFileName;
        var attributFile;
        var attributObject;
        var promises = [];
        var request = "";
        var request2 = "";

        for (var i = 0; i < allModels.length; i++) {
            if (allModels[i] != "User" && allModels[i] != "Role") {

                var sourceName = db[allModels[i]].getTableName();

                /* ----------------- MISE A JOUR DES ATTRIBUTS -----------------*/
                attributFileName = __dirname + '/attributes/' + allModels[i].toLowerCase() + '.json';
                attributFile = fs.readFileSync(attributFileName);
                attributObject = JSON.parse(attributFile);

                for (var item in attributObject) {
                    (function(sourceAttr, itemAttr) {

                        promises.push(new Promise(function(resolve0, reject0) {
                            /* Check if field already exist */
                            sequelize.query("SHOW COLUMNS FROM `" + sourceAttr + "` LIKE '" + itemAttr + "';", {
                                type: sequelize.QueryTypes.SELECT
                            }).then(function(answerAttr) {
                                /* Le champ n'a pas été générée par Sequelize avec le sync */
                                if (answerAttr.length == 0) {
                                    /*console.log("----- ADD ATTRIBUTE ------");
                                    console.log(item);
                                    console.log("----- FIN ADD ATTRIBUTE ------");*/
                                    var type = "";
                                    switch (attributObject[itemAttr]) {
                                        case "STRING":
                                            type = "VARCHAR(255)";
                                            break;
                                        case "TEXT":
                                            type = "TEXT";
                                            break;
                                        case "INTEGER":
                                            type = "INT";
                                            break;
                                        case "BOOLEAN":
                                            type = "BOOLEAN";
                                            break;
                                        case "TIME":
                                            type = "TIME";
                                            break;
                                        case "DATE":
                                            type = "DATETIME";
                                            break;
                                        case "DECIMAL":
                                            type = "VARCHAR(255)";
                                            break;
                                        default:
                                            type = "VARCHAR(255)";
                                            break;
                                    }
                                    request = "ALTER TABLE ";
                                    request += sourceAttr;
                                    request += " ADD COLUMN `" + itemAttr + "` " + type + " DEFAULT NULL;";

                                    sequelize.query(request).then(function() {
                                        resolve0();
                                    });

                                    /*sequelize.query(request).catch(function(err){
                                        console.log(err);
                                    });*/
                                }
                                else{
                                    resolve0();
                                }
                            });
                        }));
                    })(sourceName, item);
                }

                /* ----------------- MISE A JOUR DES ASSOCIATIONS -----------------*/
                optionsFileName = __dirname + '/options/' + allModels[i].toLowerCase() + '.json';
                optionsFile = fs.readFileSync(optionsFileName);
                optionsObject = JSON.parse(optionsFile);

                for (var j = 0; j < optionsObject.length; j++) {
                    if (optionsObject[j].relation == "belongsTo") {

                        var targetName = db[optionsObject[j].target.charAt(0).toUpperCase() + optionsObject[j].target.slice(1)].getTableName();

                        if (typeof optionsObject[j].foreignKey != "undefined") {
                            var foreignKey = optionsObject[j].foreignKey.toLowerCase();
                        } else {
                            var foreignKey = "id_" + optionsObject[j].target.toLowerCase();
                        }

                        (function(sourceBelongsTo, targetBelongsTo, foreignBelongsTo) {

                            promises.push(new Promise(function(resolve2, reject2) {
                                /* Check if foreign key already exist */
                                sequelize.query("SHOW COLUMNS FROM `" + sourceBelongsTo + "` LIKE '" + foreignBelongsTo + "';", {
                                    type: sequelize.QueryTypes.SELECT
                                }).then(function(answerBelongsTo) {

                                    /* La reference n'a pas été générée par Sequelize avec le sync */
                                    if (answerBelongsTo.length == 0) {
                                        request = "ALTER TABLE ";
                                        request += sourceBelongsTo;
                                        request += " ADD COLUMN `" + foreignBelongsTo + "` INT DEFAULT NULL;";
                                        request2 = "ALTER TABLE `" + sourceBelongsTo + "` ADD FOREIGN KEY (" + foreignBelongsTo + ") REFERENCES `" + targetBelongsTo + "` (id);";
                                        sequelize.query(request).then(function() {
                                            sequelize.query(request2).then(function() {
                                                resolve2();
                                            });
                                        }).catch(function(err) {
                                            console.log(err);
                                            reject2();
                                        });
                                    }
                                    else{
                                        resolve2();
                                    }
                                });
                            }));
                        })(sourceName, targetName, foreignKey);
                    } else if (optionsObject[j].relation == "hasMany") {

                        var targetName = db[optionsObject[j].target.charAt(0).toUpperCase() + optionsObject[j].target.slice(1)].getTableName();

                        if (typeof optionsObject[j].foreignKey != "undefined") {
                            var foreignKey = optionsObject[j].foreignKey.toLowerCase();
                        } else {
                            var foreignKey = "id_" + allModels[i].toLowerCase();
                        }

                        (function(sourceHasMany, targetHasMany, foreignHasMany) {

                            promises.push(new Promise(function(resolve3, reject3) {

                                /* Check if foreign key already exist */
                                sequelize.query("SHOW COLUMNS FROM `" + targetHasMany + "` LIKE '" + foreignHasMany + "';", {
                                    type: sequelize.QueryTypes.SELECT
                                }).then(function(answerHasMany) {

                                    /*console.log("answerHasMany");
                                    console.log(answerHasMany);*/
                                    /* La reference n'a pas été générée par Sequelize avec le sync */
                                    if (answerHasMany.length == 0) {
                                        request = "ALTER TABLE ";
                                        request += targetHasMany;
                                        request += " ADD COLUMN `" + foreignHasMany + "` INT DEFAULT NULL;";
                                        request2 = "ALTER TABLE `" + targetHasMany + "` ADD FOREIGN KEY (" + foreignHasMany + ") REFERENCES `" + sourceHasMany + "` (id);";
                                        sequelize.query(request).then(function() {
                                            sequelize.query(request2).then(function() {
                                                console.log("RESOLVE3");
                                                resolve3();
                                            })
                                        }).catch(function(err) {
                                            console.log(err);
                                            reject3();
                                        });
                                    }
                                    else{
                                        resolve3();
                                    }
                                });
                            }));
                        })(sourceName, targetName, foreignKey);
                    }
                }
            }
        }

        Promise.all(promises).then(function() {
            resolve();
        }).catch(function(err){
            console.log(err);
        });
    });
}

fs.readdirSync(__dirname).filter(function(file) {
    return (file.indexOf('.') !== 0) && (file !== basename) && (file.slice(-3) === '.js');
}).forEach(function(file) {
    var model = sequelize['import'](path.join(__dirname, file));
    db[model.name] = model;
    allModels.push(model.name);
});

Object.keys(db).forEach(function(modelName) {
    if (db[modelName].associate) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;