const express = require('express');
const { JSON } = require('mysql2/lib/constants/types');
const { LocalStorage } = require('node-localstorage');
localStorage = new LocalStorage('./scratch');
const User = require('../models/user');
const Event = require('../models/event');
const dateFormatter = require('date-fns')

function similar_text(a,b) {
    var equivalency = 0;
    var minLength = (a.length > b.length) ? b.length : a.length;    
    var maxLength = (a.length < b.length) ? b.length : a.length;    
    for(var i = 0; i < minLength; i++) {
        if(a[i] == b[i]) {
            equivalency++;
        }
    }
    

    var weight = equivalency / maxLength;
    return (weight * 100) + "%";
}

exports.getProfile = (req,res,next) => {

    User.fetchUserById(localStorage.getItem('sessionId')).then( user => {

        var sUserExists = user[0][0] !== undefined ? true : false;
        if(sUserExists) {

            Event.fetchEvents().then(results => {
                // console.log(typeof(results[0]));
                var aEvents = results[0];
                var aUserEvents = user[0][0].events;

                var aSuggestedEvents = [];

                for(let i = 0; i < aEvents.length; i++) {

                    var aProffessionalTarget = aEvents[i].proffessional_target.replace(/\s/g, '');
                    aProffessionalTarget = aProffessionalTarget.split(',');
                  
                    for(let j = 0; j < aProffessionalTarget.length; j++) {
                        if(parseInt(similar_text(user[0][0].proffesion, aProffessionalTarget[j])) > 10) {
                            aSuggestedEvents.push(aEvents[i]);
                            break;
                        }
                    }
                }

                for(const oEvent of aSuggestedEvents) {
    
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
            
                }
              
                if(user[0][0].events !== null) {

                    aUserEvents = aUserEvents.slice(1, aUserEvents.length - 1);
                    aUserEvents = aUserEvents.replace(/"/g, '');
                    aUserEvents = aUserEvents.split(",");
                    
                    var aCalendarEvents = [];

                    aEvents.forEach(event => {
                        aUserEvents.forEach(userEvent => {
                            if(userEvent == event.id) {
                                aCalendarEvents.push(event);
                            }
                        })
                    })

                    for(let i = 0; i < aCalendarEvents.length; i++) {
                        for(let j = 0; j < aSuggestedEvents.length; j++) {
                            if(aCalendarEvents[i].id === aSuggestedEvents[j].id) {
                                aSuggestedEvents.splice(j, 1);
                                break;
                            }
                        }
                    }

                    for(const oEvent of aCalendarEvents) {
     
        
                        if(oEvent.attendance_price.charAt(0) === 'F') {
                            var price = oEvent.attendance_price.slice(1, oEvent.attendance_price.length);
                            price = 'From ' + price + 'DKK';
                            oEvent.attendance_price = price;
                        } else if (oEvent.attendance_price.includes('NA')) {
                            oEvent.attendance_price = 'Not available';
                        } else if (oEvent.attendance_price === '0') {
                            oEvent.attendance_price = 'Free';
                        }
                
                    }

                    res.render('events/profile', {
                        pageTitle: 'Profile',
                        user: user[0][0],
                        events: aCalendarEvents,
                        eventsSuggested: aSuggestedEvents,
                        sessionId: localStorage.getItem('sessionId')
                    })   

                } else {
                    res.render('events/profile', {
                        pageTitle: 'Profile',
                        user: user[0][0],
                        events: 'Search events',
                        eventsSuggested: aSuggestedEvents,
                        sessionId: localStorage.getItem('sessionId')
                    })  
                }

                // TODO: if events is null

            }).catch(err => {
                res.status(400);
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