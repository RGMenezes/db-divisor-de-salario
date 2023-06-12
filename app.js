const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
const bcrypt = require("bcryptjs");

const sessionSecret = require("./sessionSecret.js");
const {mongoURI, listenPort} = require("./db.js");

require("./models/User.js");
const User = mongoose.model("users");


//sessions
app.use(session({
    secret: sessionSecret,
    resave: true,
    saveUninitialized: true
}));
app.use(express.json());
app.use(cors());

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
    User.findOne({userName: req.body.user.userName}).then((user) => {
        if(user){
            res.json({
                err: true, 
                value: {
                    error: "Usuário existente", 
                    message: "Nome de usuário já cadastrado!"
                }
            });
        }else{
            User.findOne({email: req.body.user.email}).then((email) => {
                if(email){
                    res.json({
                        err: true, 
                        value: {
                            error: "Email existente", 
                            message: "Email já cadastrado!"
                        }
                    });
                }else{
                    const newUser = new User({
                        userName: req.body.user.userName,
                        email: req.body.user.email,
                        password: req.body.user.password
                    });

                    bcrypt.genSalt(10, (error, salt) => {
                        bcrypt.hash(newUser.password, salt, (error, hash) => {
                            if(error){
                                res.json({
                                    err: true, 
                                    value: {
                                        error: error, 
                                        message: "Erro ao cadastrar usuário!"
                                    }
                                });
                            };

                            newUser.password = hash;

                            newUser.save().then(() => {
                                res.json({
                                    err: false, 
                                    value: {
                                        error: "success", 
                                        message: "Usuário cadastrado com sucesso!"
                                    }
                                });
                            }).catch((err) => {
                                res.json({
                                    err: true, 
                                    value: {
                                        error: error, 
                                        message: "Erro ao cadastrar usuário!"
                                    }
                                });
                            });

                        });
                    });
                }
            }).catch((err) => {
                res.json({
                    err: true, 
                    value: {
                        error: err, 
                        message: "Houve um erro ao buscar os emails dos usuários!"
                    }
                });
            });
        }
    }).catch((err) => {
        res.json({
            err: true, 
            value: {
                error: err, 
                message: "Houve um erro ao buscar os nomes de usuários!"
            }
        });
    });
});


const PORT = listenPort || 8081;

app.listen(PORT, () => console.log("Servidor rodando"));