const express = require('express');
const { LocalStorage } = require('node-localstorage');
localStorage = new LocalStorage('./scratch');
const Event = require('../models/event');
const dateFormatter = require('date-fns')
const fetch = require('node-fetch');

exports.getEvents = async (req,res,next) => {

    Event.fetchEvents().then(resp => {
        var aEvents = resp[0];

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
    }).catch(error => {
        res.status(404);
            res.setHeader('Content-Type', 'application/json');
            res.write('{"error": '+ error +'}');
            res.end();
    })

   
}