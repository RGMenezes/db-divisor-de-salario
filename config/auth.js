const localStrategy = require("passport-local").Strategy;
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

require("../model/User");
const User = mongoose.model("users");


module.exports = function(passport) {

    passport.use(new localStrategy({usernameField: "email"}, (email, password, done) => {
        User.findOne({email: email}).then((user) => {
            if(!user){
                return done(null, false, {message: "Esta conta não exite!"});
            };
            bcrypt.compare(password, user.password, (err, coincide) => {
                if(coincide){
                    return done(null, user);
                }else{
                    return done(null, false, {message: "Senha incorreta"});
                };
            });

        }).catch((err) => {
            return done(null, false, {message: "Erro ao carregar o usuário!"});
        });
    }));

    passport.serializeUser((user, done) => {
        done(null, user.id);
    });

    passport.deserializeUser((id, done) => {
        User.findById(id, (err, user) => {
            done(err, user);
        });
    });
};