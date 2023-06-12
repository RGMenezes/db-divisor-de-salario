const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
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
app.use(express.json());
app.use(cors())

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


//Public
app.use(express.static(path.join(__dirname, "public")));


//Rotas
app.get("/", (req, res) => {
    res.json({'titulo': 'Testando a integração entre o react e o node'});
});

app.post("/login", (req, res) => {

});

app.post("/register", (req, res) => {
    
});


const PORT = listenPort || 8081;

app.listen(PORT, () => console.log("Servidor rodando"));