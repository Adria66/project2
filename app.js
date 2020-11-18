//Configuración de .env
require('dotenv').config();

//DEPENDENCIES
const bodyParser   = require('body-parser');
const cookieParser = require('cookie-parser');
const express      = require('express');
const favicon      = require('serve-favicon');
const hbs          = require('hbs');
const mongoose     = require('mongoose');
const logger       = require('morgan');
const path         = require('path');
const bcrypt       = require('bcrypt')
const session    = require("express-session");
const MongoStore = require("connect-mongo")(session);

//MODELS
const User = require('./models/User.js')

//Configuración de mongo
const url = `mongodb+srv://project2:project2@cluster0.tfryx.mongodb.net/project2?retryWrites=true&w=majority`
mongoose
  .connect(url, {
    useCreateIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  })
  .then(x => {
    console.log(`Connected to Mongo! Database name: "${x.connections[0].name}"`)
  })
  .catch(err => {
    console.error('Error connecting to mongo', err)
  });

const app_name = require('./package.json').name;
const debug = require('debug')(`${app_name}:${path.basename(__filename).split('.')[0]}`);

const app = express();

// Middleware Setup
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());

// Express View engine setup

app.use(require('node-sass-middleware')({
  src:  path.join(__dirname, 'public'),
  dest: path.join(__dirname, 'public'),
  sourceMap: true
}));
      
//Configuración de hbs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
hbs.registerPartials(__dirname + "/views/partials");

//Configuración de carpeta estatica
app.use(express.static(path.join(__dirname, 'public')));

//Configuración favicon
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// default value for title local
app.locals.title = 'Favourite Places';

//Configuracion de cookies
app.use(session({
  secret: "basic-auth-secret",
  // cookie: { maxAge: 60000 },
  saveUninitialized: true,
  resave: true,
  store: new MongoStore({
    mongooseConnection: mongoose.connection,
    ttl: 24 * 60 * 60 // 1 day
  })
}));

//ROUTES
// const index = require('./routes/index');
// app.use('/', index);

app.get('/', (req, res, next)=>{
  res.render('index', {session: req.session.currentUser})
})

app.get('/log-in', (req, res, next)=>{
  res.render('logIn')
})

app.post('/log-in', (req, res, next)=>{
  const {email, password} = req.body

  User.findOne({email: email})
  .then((result)=>{
      if(!result){
          res.render('logIn', {errorMessage: 'Este usuario no existe. Lo sentimos.'})
      } else {
          bcrypt.compare(password, result.password)
          .then((resultFromBcrypt)=>{
              if(resultFromBcrypt){
                  req.session.currentUser = email
                  console.log(req.session)
                  res.redirect('/')
              } else {
                  res.render('logIn', {errorMessage: 'Contraseña incorrecta. Por favor, vuelva a intentarlo.'})
              }
          })
      }
  })
})

app.get('/sign-up', (req, res, next)=>{
  res.render('signUp')
})

app.post('/sign-up', (req, res, next)=>{
  const {email, password} = req.body
  User.findOne({email: email})
  .then((result)=>{
    if(!result){
      bcrypt.genSalt(10)
      .then((salt)=>{
        bcrypt.hash(password, salt)
        .then((hashedPassword)=>{
          const hashedUser = {email: email, password: hashedPassword}
          User.create(hashedUser)
          .then((result)=>{
            res.redirect('/')
          })
        })
      })
      .catch((err)=>{
        res.send(err)
      })
    } else {
      res.render('logIn', {errorMessage: 'Este usuario ya existe. ¿Querías hacer Log In?'})
    }
  })
})

app.use((req, res, next)=>{
  if (req.session.currentUser) {
      next();
  } else {
      res.redirect('/log-in');
  }
})

app.get('/log-out', (req, res, next)=>{
  req.session.destroy()
  res.redirect('/')
})

// app.get('/map', (req, res)=>{
//   res.render('map', {url: `https://maps.googleapis.com/maps/api/js?key=${process.env.KEY}`})
// })

module.exports = app;
