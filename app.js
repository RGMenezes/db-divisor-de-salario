const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");

const sessionSecret = require("./sessionSecret.js");
const {mongoURI, listenPort} = require("./db.js");


//sessions
app.use(session({
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());
app.use(passport.session());


//mongoose
mongoose.Promise = global.Promise;
mongoose.connect(mongoURI).then(() => {
    console.log("conectado ao mongo...");
}).catch((err) => {
    console.log("Erro ao se conectar ao mongo...");
    console.log(err);
});





const PORT = listenPort || 8081;

app.listen(PORT, () => console.log("Servidor rodando"));