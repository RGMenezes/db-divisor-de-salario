const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const path = require("path");
const cors = require("cors");
const mongoose = require("mongoose");
const session = require('express-session');
const passport = require("passport");
require("./config/auth")(passport);
const bcrypt = require("bcryptjs");

const sessionSecret = require("./sessionSecret.js");
const {mongoURI} = require("./db.js");

const User = mongoose.model("users", require("./model/User"));

let user = null;


//sessions
app.use(session({
    secret: process.env.SESSION || sessionSecret,
    resave: true,
    saveUninitialized: true
}));

app.use(cors());

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({extended: true}));
app.use(bodyParser.json());


//mongoose
mongoose.Promise = global.Promise;
mongoose.connect(process.env.DATABASE_URL || mongoURI).then(() => {
    console.log("conectado ao mongo...");
}).catch((err) => {
    console.log("Erro ao se conectar ao mongo...");
    console.log(err);
});


//Public
app.use(express.static(path.join(__dirname, "public")));


//Rotas
app.get("/", (req, res) => {
    res.json("Home");
});

app.post("/login", (req, res, next) => {
    passport.authenticate("local",{
        successRedirect: "/login/success",
        failureRedirect: "/login/failure"
    })(req, res, next);
    user = req.body.email;
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
    user = null;
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
            user = null;
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

app.get("/find/user", (req, res) => {
    User.findOne({email: user}).then((user) => {
        if(user){
            res.json({
                type: "success", 
                value: {
                    email: user.email, 
                    userName: user.userName,
                    _id: user._id,
                    division: user.division
                }
            });
        }else{
            res.json({
                type: "error", 
                value: {
                    error: "Usuário não foi logado", 
                    message: "Você precisa estar logado para acessar esta rota!"
                },
                redirect: "/"
            });
        };
    }).catch((err) => {
        res.json({
            type: "error", 
            value: {
                error: "Usuário não encontrado", 
                message: "Houve em erro ao procurar o seu login, tente novamente!"
            },
            redirect: "/"
        });
    });
});

app.post("/user", (req, res) => {
    User.deleteOne({_id: req.body._id}).then(() => {
        res.json({
            type: "success", 
            value: {
                error: "Não hove erros", 
                message: "Usuário deletado com sucesso!"
            },
            redirect: "/"
        });
    }).catch((err) => {
        res.json({
            type: "error", 
            value: {
                error: "Usuário não foi deletado", 
                message: "Não foi possível deletar este usuário, tente novamente!"
            },
            redirect: "/home"
        });
    });
});

app.put("/new/division", (req, res) => {
    User.findOne({email: user}).then((user) => {
        if(user.division.find(el => el.name == req.body.name)){
            res.json({
                type: "error", 
                value: {
                    error: "Nome de divisão existente", 
                    message: "Uma divisão já possui este nome."
                }
            });
        }else{
            User.findOne({_id: user._id}).then((userFind) => {

                userFind.division.push(req.body);

                userFind.save().then(() => {
                    user.division.push(req.body);
                    res.json({
                        type: "success", 
                        value: {
                            error: "Não houve erro", 
                            message: "Divisão criada com sucesso."
                        },
                        redirect: "/divisions"
                    });
                }).catch((err) => {
                    res.json({
                        type: "error", 
                        value: {
                            error: err, 
                            message: "Não foi possível salvar a divisão."
                        },
                        redirect: "/home"
                    });
                });
            }).catch((err) => {
                res.json({
                    type: "error", 
                    value: {
                        error: err, 
                        message: "Não foi possível encontrar o usuário para salvar a divisão."
                    },
                    redirect: "/home"
                });
            });
        };
    }).catch((err) => {
        res.json({
            type: "error", 
            value: {
                error: err, 
                message: "Não foi possível encontrar o usuário."
            },
            redirect: "/home"
        });
    });
});

app.put("/delete/division", (req, res) => {
    User.findOne({email: user}).then((user) => {
        if(user.division.find(el => el.name == req.body.name)){
            User.findOne({_id: user._id}).then((userFind) => {
                const indexDivision = userFind.division.findIndex((element, index) => {
                    if(element.name == req.body.name){
                        return index
                    };
                });
                userFind.division.splice(indexDivision, 1);

                userFind.save().then(() => {
                    user.division.splice(indexDivision, 1);
                    res.json({
                        type: "success", 
                        value: {
                            error: "Não houve erro", 
                            message: "Divisão deletada com sucesso."
                        },
                        redirect: "/divisions"
                    });
                }).catch((err) => {
                    res.json({
                        type: "error", 
                        value: {
                            error: err, 
                            message: "Não foi possível deletar a divisão."
                        },
                        redirect: "/divisions"
                    });
                });
            }).catch((err) => {
                res.json({
                    type: "error", 
                    value: {
                        error: err, 
                        message: "Não foi possível encontrar o usuário para deletar a divisão."
                    },
                    redirect: "/divisions"
                });
            });
        }else{
            res.json({
                type: "error", 
                value: {
                    error: "Nome de divisão não existente", 
                    message: "Não foi possível encontrar esta divisão."
                },
                redirect: "/divisions"
            });
        };
    }).catch((err) => {
        res.json({
            type: "error", 
            value: {
                error: err, 
                message: "Não foi possível encontrar o usuário."
            },
            redirect: "/divisions"
        });
    });
});


const PORT = process.env.PORT || 8081;

app.listen(PORT, () => console.log("Servidor rodando"));