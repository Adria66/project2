const express     = require('express');
const router      = express.Router();
const bcrypt      = require('bcrypt')
const passport    = require('passport');
const ensureLogin = require('connect-ensure-login')

const User = require('../models/User')

router.get('/signup', (req, res, next) => {
  res.render('signup');
});

router.post('/signup', (req, res, next)=>{
  
  const {username, password} = req.body

  if(username === '' || password === ''){
    res.render('signup', {errorMessage: 'You have to fill all the fields'})
    return
  }

  User.findOne({username})
  .then((result)=>{
    if(!result){
      bcrypt.hash(password, 10)
        .then((hashedPassword)=>{
          User.create({username, password: hashedPassword})
          .then((result)=>{
            res.redirect('/login')
          })
        })
    } else {
      res.render('signup', {errorMessage: 'This user already exists. Please, try again'})
    }
  })
  .catch((err)=>{
    res.send(err)
  })
})

router.get('/loged', (req, res, next) => {
  res.render('loged', {user: req.user.username});
});

router.get('/login', (req, res)=>{
  res.render('login', {errorMessage: req.flash('error')})
})

router.post('/login', passport.authenticate("local", {
  successRedirect: '/loged',
  failureRedirect: '/login',
  failureFlash: true,
  passReqToCallback: true
}))

router.get('/logout', (req, res)=>{
  req.logout()
  res.redirect('/')
})

const checkForAuthentification = (req, res, next)=>{
  if(req.isAuthenticated()){
    return next()
  } else {
    res.redirect('login')
  }
}

router.get('/map', checkForAuthentification, (req, res)=>{
  res.render('map', {user: req.user.username, url: `https://maps.googleapis.com/maps/api/js?key=${process.env.KEY}`})
})


module.exports = router;