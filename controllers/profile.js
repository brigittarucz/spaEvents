const express = require('express');
const { JSON } = require('mysql2/lib/constants/types');
const { LocalStorage } = require('node-localstorage');
localStorage = new LocalStorage('./scratch');
const User = require('../models/user');

exports.getProfile = (req,res,next) => {

    User.fetchUserById(localStorage.getItem('sessionId')).then( user => {

        var sUserExists = user[0][0] !== undefined ? true : false;
        if(sUserExists) {

            res.render('events/profile', {
                pageTitle: 'Profile',
                user: user[0][0],
                sessionId: localStorage.getItem('sessionId')
            })    
        } else {
            res.status(404);
            res.setHeader('Content-Type', 'application/json');
            res.write('{"error": "Invalid user id"}');
            res.end();  
        }


    }).catch(err => {
        res.status(400);
        res.setHeader('Content-Type', 'application/json');
        res.write('{"error": '+ err +'}');
        res.end();
    })
    
}

exports.postProfile = (req, res, next) => {

    // TODO: check for changes

    User.fetchUserById(localStorage.getItem('sessionId')).then( user => {

        var sUserExists = user[0][0] !== undefined ? true : false;
        if(sUserExists) {
            user = user[0][0];
            if(user.email !== req.body.email || user.password !== req.body.password ||
                user.proffesion !== req.body.proffesion || user.interests !== req.body.interests ) {
                    
                    const updatedUser = new User(localStorage.getItem('sessionId'), req.body.email, req.body.password, req.body.proffesion, req.body.interests, user.interests);
                    updatedUser.saveUser().then(res => {
                        console.log(res[0]);
                    }).catch(err => {
                        console.log(err);
                    })

                    res.write("Changes have been made");
                    console.log("Changes have been made");
                    res.end();
                } else {
                    res.status(400);
                    res.setHeader('Content-Type', 'application/json');
                    res.write('{"error": "Changes have not been made"}');
                    res.end();  
                }
        } else {
            res.status(404);
            res.setHeader('Content-Type', 'application/json');
            res.write('{"error": "Invalid user id"}');
            res.end();  
        }


    }).catch(err => {
        res.status(400);
        res.setHeader('Content-Type', 'application/json');
        res.write('{"error": '+ err +'}');
        res.end();
    })

}