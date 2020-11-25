const express     = require('express');
const router      = express.Router();
const bcrypt      = require('bcrypt')
const passport    = require('passport');
const ensureLogin = require('connect-ensure-login')

const User = require('../models/User');
const Places = require('../models/Places');

router.get('/signup', (req, res, next) => {
  res.render('signUp');
});

router.post('/signup', (req, res, next)=>{
  
  const {username, password} = req.body

  if(username === '' || password === ''){
    res.render('signUp', {errorMessage: 'You have to fill all the fields'})
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
      res.render('signUp', {errorMessage: 'This user already exists. Please, try again'})
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
  res.render('logIn', {errorMessage: req.flash('error')})
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
    res.redirect('/login')
  }
}

router.get('/map', checkForAuthentification, (req, res)=>{
  res.render('map', {user: req.user.username, url: `https://maps.googleapis.com/maps/api/js?key=${process.env.KEY}&callback=initMap&libraries=places&v=weekly`})
})

router.get('/insertPlace/:id', (req, res)=>{
  
  /*const {name, placeId} = req.body*/
  const idId = req.user._id

  Places.create({/*name, placeId,*/ owner: idId})
  .then((result)=>{
      User.updateOne({username: req.user.username}, {$push: {placesId: req.params.id}})
      .then((result)=>{
        console.log(result)
      })
  })
  .catch((err)=>{
    console.log(err)
  })
})
module.exports = router;