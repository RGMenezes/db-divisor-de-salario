const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
require("./config/auth")(passport);
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
app.post("/login", (req, res, next) => {
    passport.authenticate("local",{
        successRedirect: "/login/success",
        failureRedirect: "/login/failure"
    })(req, res, next);
});

app.get("/login/success", (req, res) => {
    res.json({
        type: "success", 
        value: {
            error: "Não hove erros", 
            message: "Bem-vindo ao Divisor de Salário."
        },
        redirect: "/home"
    });
});

app.get("/login/failure", (req, res) => {
    res.json({
        type: "error", 
        value: {
            error: "Login invalido", 
            message: "Não foi possível fazer o login! Confira o email e a senha."
        },
        redirect: "/"
    });
});

app.get("/logout", (req, res, next) => {
    req.logout((err) => {
        if(err){
            next(err);
        }else{
            res.json({
                type: "", 
                value: {
                    error: "Não houve erros", 
                    message: "Logout realizado com sucesso, obrigado por nos visitar!"
                },
                redirect: "/"
            });
        };
    });
});

app.post("/register", (req, res) => {
    User.findOne({userName: req.body.user.userName}).then((user) => {
        if(user){
            res.json({
                type: "error", 
                value: {
                    error: "Usuário existente", 
                    message: "Nome de usuário já cadastrado!"
                },
                redirect: "/register"
            });
        }else{
            User.findOne({email: req.body.user.email}).then((email) => {
                if(email){
                    res.json({
                        type: "error", 
                        value: {
                            error: "Email existente", 
                            message: "Email já cadastrado!"
                        },
                        redirect: "/register"
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
                                    type: "error",
                                    value: {
                                        error: error, 
                                        message: "Erro ao cadastrar usuário!"
                                    },
                                    redirect: "/"
                                });
                            };

                            newUser.password = hash;

                            newUser.save().then(() => {
                                res.json({
                                    type: "success", 
                                    value: {
                                        error: "Não houve erros", 
                                        message: "Usuário cadastrado com sucesso!"
                                    },
                                    redirect: "/"
                                });
                            }).catch((err) => {
                                res.json({
                                    type: "error", 
                                    value: {
                                        error: err, 
                                        message: "Erro ao cadastrar usuário!"
                                    },
                                    redirect: "/"
                                });
                            });

                        });
                    });
                }
            }).catch((err) => {
                res.json({
                    type: "error", 
                    value: {
                        error: err, 
                        message: "Houve um erro ao buscar os emails dos usuários!"
                    },
                    redirect: "/"
                });
            });
        }
    }).catch((err) => {
        res.json({
            type: "error", 
            value: {
                error: err, 
                message: "Houve um erro ao buscar os nomes de usuários!"
            },
            redirect: "/"
        });
    });
});


const PORT = listenPort || 8081;

app.listen(PORT, () => console.log("Servidor rodando"));