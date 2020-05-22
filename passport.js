const passport = require('passport');
const LocalStategy = require('passport-local').Strategy;

const User = require('./models/user');

passport.use('local', new LocalStategy(async (username, password, done) => {
  let user = await User.findOne(username);
  let parsedstring = JSON.stringify(user);
  user = JSON.parse(parsedstring);

  if(!user) {
    console.log('User Not Found with username '+username);
    return done(null, 'notfound');
  }

  if(User.encryptPass(password) === user.password) {
    //прежде чем отправлять пользователя его нужно очистить от sensitive полей
    delete user.password;
    return done(null, user);
  } 
    
  return done(null, 'notfound');
}));

passport.serializeUser((user, done) => {
  if(user.username){
    done(null, user.username);
  }
  else{
    done(null, 'notfound');
  }
});

passport.deserializeUser(async (username, done) => {
  if(username === 'notfound'){
    done(null, username);
  }
  else{
    let user = await User.findOne(username);
    let parsedstring = JSON.stringify(user);
    user = JSON.parse(parsedstring);
    done(null, user);
  }
});

const authHandler = passport.authenticate('local', {
  successRedirect: '/dashboard',
  failureRedirect: '/auth'
});

module.exports = {
    passport,
    authHandler
}