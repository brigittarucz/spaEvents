const express = require('express');
const { LocalStorage } = require('node-localstorage');
localStorage = new LocalStorage('./scratch');
const Event = require('../models/event');
const dateFormatter = require('date-fns')
const fetch = require('node-fetch');
const User = require('../models/user');

exports.getEvents = async (req,res,next) => {

    Event.fetchEvents().then(resp => {
        var aEvents = resp[0];

        // TODO: exclude events added to the user's list

        User.fetchUserById(localStorage.getItem('sessionId')).then( user => {
            aUserEvents = JSON.parse(user[0][0].events);
           
            if(aUserEvents !== null) {
                for(let i = 0; i < aUserEvents.length; i++) {
                    for(let j = 0; j < aEvents.length; j++) {
                        if(aUserEvents[i] === aEvents[j].id) {
                            aEvents.splice(j, 1);
                            break;
                        }
                    }
                }
            }

            async function processEvents() {

                for(const oEvent of aEvents) {
    
                    var finalDate = [];
    
                    if(oEvent.date.includes("-")) {
                        var aDates = oEvent.date.split("-");
                        var aDateBegin = aDates[0].split(".");
                        aDateBegin = dateFormatter.format(new Date(aDateBegin[2], (parseInt(aDateBegin[1]) - 1), aDateBegin[0]), 'PPP');
                        var aDateEnd = aDates[1].split(".");
                        aDateEnd = dateFormatter.format(new Date(aDateEnd[2], (parseInt(aDateEnd[1]) - 1), aDateEnd[0]), 'PPP');
                        finalDate.push(aDateBegin);
                        finalDate.push(aDateEnd);
                    } else {
                        var aDate = oEvent.date.split(".");
                        aDate = dateFormatter.format(new Date(aDate[2], (parseInt(aDate[1]) - 1), aDate[0]), 'PPP');
                        finalDate.push(aDate);
                    }
    
                    oEvent.date = finalDate;
    
                    if(oEvent.attendance_price.charAt(0) === 'F') {
                        var price = oEvent.attendance_price.slice(1, oEvent.attendance_price.length);
                        price = 'From ' + price + 'DKK';
                        oEvent.attendance_price = price;
                    } else if (oEvent.attendance_price.includes('NA')) {
                        oEvent.attendance_price = 'Not available';
                    } else if (oEvent.attendance_price === '0') {
                        oEvent.attendance_price = 'Free';
                    }
            
                    // urlMetadata = await fetch('https://url-metadata.herokuapp.com/api/metadata?url=' + oEvent.event_link)
                    // .then(response => response.json())
                    // .then(data => { 
                    //     oEvent.image =  data.data.image; 
                    // }).catch(error => {
                    //     oEvent.image = 'images/event-placeholder.jpg';
                    // });
    
                }
    
                return aEvents;
            };
    
            processEvents().then(aEvents => {
                res.render('events/homepage', {
                    pageTitle: 'Homepage',
                    events: aEvents,
                    sessionId: localStorage.getItem('sessionId')
                })
            });

        }).catch(err => {
            res.status(500);
            res.setHeader('Content-Type', 'application/json');
            res.write('{"error": '+ err +'}');
            res.end();
        })

        
    }).catch(error => {
        res.status(404);
            res.setHeader('Content-Type', 'application/json');
            res.write('{"error": '+ error +'}');
            res.end();
    })
   
}

exports.postAddEvent = (req, res, next) => {

    User.fetchUserById(localStorage.getItem('sessionId')).then( user => {

        // TODO: remove event node from main 

        var sUserExists = user[0][0] !== undefined ? true : false;
        if(sUserExists) {
            user = user[0][0];
            
            if(user.events === null) {
                var aUpdatedEvents = [];
                aUpdatedEvents.push(req.body.eventId);
                var sUpdatedEvents = JSON.stringify(aUpdatedEvents);
            } else {
                
                // TODO: check if event exists, if not add

                var eventExists = 0;

                var aUserEvents = JSON.parse(user.events);
                aUserEvents.forEach(event => {
                    if (event === req.body.eventId) {
                        eventExists = 1;
                    }
                });

                if(!eventExists) {
                    aUserEvents.push(req.body.eventId);
                    var sUpdatedEvents = JSON.stringify(aUserEvents);
                } else {
                    res.status(400);
                    res.setHeader('Content-Type', 'application/json');
                    res.write('{"error": "Event already exists"}');
                    res.end();  
                }
            }

            User.addEventToUser(localStorage.getItem('sessionId'), sUpdatedEvents).then( () => {
                return res.redirect('/home/events');
            }).catch(err => {
                res.status(500);
                res.setHeader('Content-Type', 'application/json');
                res.write('{"error": '+ err +'}');
                res.end();
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