const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema({
    userName: {
        type: String,
        require: true
    },
    email: {
        type: String,
        require: true
    },
    password: {
        type: String,
        require: true
    }
});

mongoose.model("users", User);