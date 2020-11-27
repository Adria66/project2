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

router.get('/loged', checkForAuthentification, (req, res, next) => {
  res.render('loged', {user: req.user.username});
});

router.get('/map', checkForAuthentification, (req, res)=>{
  res.render('map', {user: req.user.username, url: `https://maps.googleapis.com/maps/api/js?key=${process.env.KEY}&callback=initMap&libraries=places&v=weekly`})
})

router.get('/personal-map', checkForAuthentification, (req, res)=>{
  res.render('personalMap', {user: req.user.username, url: `https://maps.googleapis.com/maps/api/js?key=${process.env.KEY}&callback=initMap&libraries=places&v=weekly`})
})

router.get('/insertPlace/:id/:name', checkForAuthentification, (req, res)=>{
  const id = req.params.id
  const name = req.params.name
  const idId = req.user._id

  Places.create({name: name, placeId: id, owner: idId})
  .then((result)=>{
      User.updateOne({username: req.user.username}, {$push: {placesId: req.params.id}})
      .then((result)=>{
      })
  })
  .catch((err)=>{
    console.log(err)
  })
})

router.get('/places', checkForAuthentification, (req, res, next)=>{
  const user = req.user._id
  Places.find({owner: user})
  .then((Places)=>{
      res.send(Places)
  })
  .catch((err)=>{
      console.log(err)
  })
})

router.get('/users', checkForAuthentification, (req, res, next)=>{
  User.find({})
  .then((User)=>{
      res.send(User)
  })
  .catch((err)=>{
      console.log(err)
  })
})

router.get('/edit-password', checkForAuthentification, (req, res)=>{
  res.render('editUser')
})

router.post('/edit-password', checkForAuthentification, (req, res, next)=>{

  const user = req.user._id
  const password = req.body.password

  bcrypt.hash(password, 10)
  .then((hashedPassword)=>{
    User.findByIdAndUpdate({_id: user}, {password: hashedPassword})
    .then((result)=>{
      res.redirect('/login')
    })
  })
  .catch((err)=>{
      console.log(err)
      res.send(err)
  })
})

router.post('/deletePlace/:id', checkForAuthentification, (req, res)=>{
  res.redirect('/map')
  const id = req.params.id
 
  Places.findOneAndDelete({placeId: id})
    .then(()=>{
    res.redirect('/map')
  })
  .catch((err)=>{
    console.log(err)
  })
})

module.exports = router;