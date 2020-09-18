const e = require('express');
const db = require('../util/database'); 

module.exports = class User {
    constructor(id, email, password, proffesion, experience, interests, events) {
        this.id = id;
        this.email = email;
        // TODO: hash
        this.password = password;
        this.proffesion = proffesion;
        this.experience = experience;
        this.interests = interests;
        this.events = events;
    }

    static fetchUser() {
        return db.execute('SELECT * FROM users');
    }

    createUser() {
        return db.execute('INSERT INTO users (id, email, password, proffesion, experience, interests, events) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [ this.id, this.email, this.password, this.proffesion, this.experience, this.interests, this.events]);
    }

    fetchUserById(id) {

    }
}
