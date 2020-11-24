//Configuración de .env
require('dotenv').config();

//DEPENDENCIES
const bodyParser    = require('body-parser');
const cookieParser  = require('cookie-parser');
const express       = require('express');
const favicon       = require('serve-favicon');
const hbs           = require('hbs');
const mongoose      = require('mongoose');
const logger        = require('morgan');
const path          = require('path');
const passport      = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session       = require('express-session');
const bcrypt        = require('bcrypt')
const flash         = require('connect-flash');
const MongoStore    = require("connect-mongo")(session);

//MODELS
const User = require('./models/User.js')


const PORT = process.env.PORT || 3000;


//Configuración de mongo
const url = `mongodb+srv://${process.env.USERMONGO}:${process.env.PASSWORD}@cluster0.tfryx.mongodb.net/${process.env.DBNAME}?retryWrites=true&w=majority`
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

//Middleware de Session

app.use(session({secret: 'ourPassword', resave: true, saveUninitialized: true}))

//Middleware para serializar al usuario

passport.serializeUser((user, callback)=>{
  callback(null, user._id)
})

//Middleware para des-serializar al usuario

passport.deserializeUser((id, callback)=>{
  User.findById(id)
  .then((user)=>{
    callback(null, user)
  })
  .catch((err)=>{
    callback(err)
  })
})

//Middleware de flash

app.use(flash())

//Middleware del Strategy

passport.use(new LocalStrategy({passReqToCallback: true}, (req, username, password, next)=>{
  User.findOne({username})
  .then ((user)=>{
    if(!user){
      return next(null, false, {message: 'Incorrect username'})
    }

    if(!bcrypt.compareSync(password, user.password)){
      return next(null, false, {message: 'Incorrect password'})
    }

    return next(null, user)
  })
  .catch((err)=>{
    next(err)
  })
}))

//Middleware de passport

app.use(passport.initialize())
app.use(passport.session())

//Configuración de hbs
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');
// hbs.registerPartials(__dirname + "/views/partials");          

//Configuración de carpeta estatica
app.use(express.static(path.join(__dirname, 'public')));

//Configuración favicon
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.ico')));

// default value for title local
app.locals.title = 'Favourite Places';


//ROUTES
const index = require('./routes/index');
app.use('/', index);

const auth = require('./routes/auth');
app.use('/', auth);

module.exports = app;


app.listen(PORT)
