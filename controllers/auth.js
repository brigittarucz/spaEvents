// Connects the models and the views

const express = require('express');

exports.getAuth = (req, res, next) => {
    res.render('auth/authentication', {
        pageTitle: 'Authentication'
    })
}