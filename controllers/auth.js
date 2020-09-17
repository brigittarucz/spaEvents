// Connects the models and the views
const express = require('express');
const User = require('../models/user');

exports.getAuth = (req, res, next) => {
    res.render('auth/authentication', {
        pageTitle: 'Authentication'
    })
}

exports.postAuth = (req, res, next) => {
    if(req.params.action == 'login') {
        User.fetchUser().then(result => {
            var users = result[0];
            users.forEach(user => {
                if(user.email == req.body.email) {
                    if(user.password == req.body.password) {
                        // return JSON.stringify(user);
                        
                        // TODO: redirect user to login

                        res.sendStatus(200);
                    }
                }
            })
        }).catch(() => {
            console.log('{"error": "Invalid login credentials"}');
            res.sendStatus(404)
        });
    } else {
        const user = new User('3', req.body.emailSignup, req.body.passwordSignup,req.body.proffesion, req.body.experience, req.body.interests);
        
        console.log(user);
        user.createUser().then(() => {
            // TODO: redirect user   
            res.sendStatus(200);
        }).catch(error => { console.log(error); res.sendStatus(500);});

    }
}

// exports.postSignupAuth = (req,res,)