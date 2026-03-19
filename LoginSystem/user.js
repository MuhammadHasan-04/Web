const mongoose = require('mongoose');



const userschema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
});

const User_model = mongoose.model('User', userschema);


class User {
    constructor(username, password) {
        this.username = username;
        this.password = password;
    }

    async register() {
        if(await this.login()) {
            console.log(`${this.username} already exists`);
            return null;
        }
        const user = new User_model({
            username: this.username,
            password: this.password
        });
        return user.save();
    }

    async login() {  
        const usr = await User_model.findOne({ username: this.username, password: this.password });
        if(usr)
            return usr;

        return null;
    }

}
module.exports = User;