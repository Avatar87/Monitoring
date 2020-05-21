const passport = require('passport');
const LocalStategy = require('passport-local').Strategy;

const User = require('./models/user');

passport.use('local', new LocalStategy(async (username, password, done) => {
  let user = await User.findOne(username);
  let parsedstring = JSON.stringify(user);
  user = JSON.parse(parsedstring);

  if(!user) {
    console.log('User Not Found with username '+username);
    return done(null, false);
  }

  if(User.encryptPass(password) === user.password) {
    //прежде чем отправлять пользователя его нужно очистить от sensitive полей
    delete user.password;
    return done(null, user);
  } 
    
  return done(null, false);
}));

passport.serializeUser((user, done) => {
  done(null, user.username);
});

passport.deserializeUser(async (username, done) => {
  let user = await User.findOne(username);
	let parsedstring = JSON.stringify(user);
  user = JSON.parse(parsedstring);
  done(null, user);
});

const authHandler = passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/auth',
});

module.exports = {
    passport,
    authHandler
}