const express = require('express');

exports.getEvents = (req,res,next) => {
    res.render('events/homepage', {
        pageTitle: 'Homepage'
    })
}