var moment = require('moment');
var express = require('express');
var router = express.Router();
var connection = require('../utils/db_utils');
var block_access = require('../utils/block_access');
var auth = require('../utils/authStrategies');
var bcrypt = require('bcrypt-nodejs');
var crypto = require('crypto');
var mail = require('../utils/mailer');
var menu_manager = require('../services/menu');
var valid = require('validator');

//Sequelize
var models = require('../models/');

// =====================================
// HOME PAGE (with login links) ========
// =====================================

/* GET status page to check if workspace is ready. */
router.get('/status', function(req, res) {
    res.render('status');
});

/* GET home page. */
router.get('/', function(req, res) {
    res.redirect('/login');
});

// =====================================
// LOGIN ===============================
// =====================================

router.get('/login', block_access.loginAccess, function(req, res) {
    var redirect = req.params.redirect;
    if (typeof redirect === 'undefined') {
        redirect = "/default/home";
    }
    res.render('login/login', {
        message: req.flash('loginMessage'),
        redirect: redirect
    });
});

router.post('/login', auth.isLoggedIn, function(req, res) {
    req.session.data = req.session.passport.user;
    var redirect_to = req.session.redirect_to ? req.session.redirect_to : '/default/home';
    delete req.session.redirect_to;

    if (req.body.remember) {
        req.session.cookie.maxAge = 1000 * 60 * 3;
    } else {
        req.session.cookie.expires = false;
    }
    req.session.message = "";
    req.session.error = 0;

    res.redirect(redirect_to);
});

router.get('/first_connection', block_access.loginAccess, function(req, res) {
    res.render('login/first_connection', {
        message: ""
    });
});

router.post('/first_connection', block_access.loginAccess, function(req, res, done) {
    var login_user = req.body.login_user;
    var password = bcrypt.hashSync(req.body.password_user2, null, null);

    models.User.findOne({
        where: {
            login: login_user,
            password: ""
        }
    }).then(function(user){
        if(user){
            if(user.password == ""){
                models.User.update({
                    password: password,
                }, {
                    where: {
                        login: login_user
                    }
                }).then(function(){
                    req.flash('loginMessage', 'Mise à jour faite. Vous pouvais désormais vous connecter.');
                    res.redirect('/login');
                });
            }
            else{
                // Password isn't empty
                req.flash('loginMessage', 'Mise à jour impossible. Cet utilisateur possède déjà un mot de passe. Contactez votre Administrateur.');
            }
        }
        else{
            req.flash('loginMessage', "Erreur. Cet utilisateur n'existe pas.");
            res.redirect('/login');
        }
    }).catch(function(err){
        req.flash('loginMessage', 'Erreur. Veuillez contactez votre Administrateur.');
        res.redirect('/login');
    });
});

// Affichage de la page reset_password
router.get('/reset_password', block_access.loginAccess, function(req, res) {
    res.render('login/reset_password', {
        message: req.flash('loginMessage')
    });
});

// Reset password
// Generate token, insert into DB, send email
router.post('/reset_password', block_access.loginAccess, function(req, res) {
    var login_user = req.body.login;
    var given_mail = req.body.mail;

    function resetPasswordProcess(idUser, email) {
        // Create unique token and insert into user
        var token = crypto.randomBytes(64).toString('hex');

        models.User.update({
            token_password_reset: token
        }, {
            where: {
                id: idUser
            }
        }).then(function(){
            // Send email with generated token
            mail.sendMail_Reset_Password({
                mail_user: email,
                token: token
            }).then(function(success) {
                res.render('login/reset_password', {
                    message: 'Un email vous permettant de réinitialiser votre mot de passe vous a été envoyé.'
                });
            }).catch(function(err) {
                // Remove inserted value in user to avoid zombies
                models.User.update({
                    token_password_reset: null
                }, {
                    where: {
                        id: idUser
                    }
                }).then(function(){
                    res.render('login/reset_password', {
                        message: 'Erreur lors de l\'envoi de l\'email.'
                    });
                });
            });
        }).catch(function(err){
            res.render('login/reset_password', {
                message: 'Probleme de creation du token.'
            });
        });
    }

    models.User.findOne({
        where: {
            login: login_user,
            email: given_mail
        }
    }).then(function(user){
        if(user){
            resetPasswordProcess(user.id, user.email);
        }
        else{
            res.render('login/reset_password', {
                message: "Erreur. L'utilisateur n'existe pas."
            });
        }
    }).catch(function(err){
        res.render('login/reset_password', {
            message: "Une erreur s'est produite."
        });
    });
});

// Trigger password reset
router.get('/reset_password/:token', block_access.loginAccess, function(req, res) {

    models.User.findOne({
        where: {
            token_password_reset: req.params.token
        }
    }).then(function(user){
        if(!user){
            res.render('login/reset_password', {
                message: 'Impossible de trouver votre token.'
            });
        }
        else{
            models.User.update({
                password: "",
                token_password_reset: ""
            }, {
                where: {
                    id: user.id
                }
            }).then(function(){
                // Redirect to firt connection page
                res.render('login/first_connection', {
                    message: 'Votre mot de passe a ete reinitialise'
                });
            });
        }
    }).catch(function(err){
        res.render('login/reset_password', {
            message: 'Une erreur est survenue lors de la reinitialisation du mot de passe.'
        });
    });
});

// =====================================
// LOGOUT ==============================
// =====================================
router.get('/logout', function(req, res) {
    req.logout();
    res.redirect('/login');
});

// =====================================
// SORT MENU ===========================
// =====================================
router.get('/sort_menu', function(req, res) {

    var dragged_item = req.query.dragged_item;
    var dropped_item = req.query.dropped_item;

    menu_manager.sort_menu(dragged_item, dropped_item);

    // No answer is returned

});

module.exports = router;