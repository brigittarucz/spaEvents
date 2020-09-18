// Connects the models and the views
const express = require('express');
const User = require('../models/user');
const uuid = require('uuid');
const emailValidator = require('email-validator');
const { LocalStorage } = require('node-localstorage');
localStorage = new LocalStorage('./scratch');

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

                        // TODO: store ID
                        localStorage.setItem('sessionId', user.id);
                        return res.redirect('/home');
                        

                    }
                }
            })

            res.status(404);
            res.setHeader('Content-Type', 'application/json');
            res.write('{"error": "Invalid login credentials"}');
            res.end();

        }).catch(err => {
            res.status(500);
            res.setHeader('Content-Type', 'application/json');
            res.write('{"error": '+ err +'}');
            res.end();
        });
    } else {
        if(!emailValidator.validate(req.body.emailSignup)) {
            res.status(400);
            res.setHeader('Content-Type', 'application/json');
            res.write('{"error": "Invalid email"}');
            res.end();
        } 

        if(!(req.body.passwordSignup.length >= 8)) {
            res.status(400);
            res.setHeader('Content-Type', 'application/json');
            res.write('{"error": "Password field expects at least 8 characters"}');
            res.end();
        }

        if(req.body.proffesion === "") {
            res.status(400);
            res.setHeader('Content-Type', 'application/json');
            res.write('{"error": "Proffesion field is empty"}');
            res.end();
        }

        if(req.body.experience === "") {
            res.status(400);
            res.setHeader('Content-Type', 'application/json');
            res.write('{"error": "Experience field is empty"}');
            res.end();
        }

        const uniqid = uuid.v4();
        const user = new User(uniqid, req.body.emailSignup, req.body.passwordSignup, req.body.proffesion, req.body.experience, req.body.interests, '');
        
        user.createUser().then(() => {
            // TODO: store ID

            localStorage.setItem('sessionId', user.id);
            return res.redirect('/home');
        }).catch(err => { 
            if(err.code === 'ER_DUP_ENTRY') {
                res.status(500);
                res.setHeader('Content-Type', 'application/json');
                res.write('{"error": "Email already exists"}');
                res.end();
            } else {
                res.status(500);
                res.setHeader('Content-Type', 'application/json');
                res.write('{"error": '+ err +'}');
                res.end();
            }
        });

    }
}

