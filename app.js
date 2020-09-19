const path = require('path');
const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const passport = require('passport');
const session = require('express-session');
const methodOverride = require('method-override');
const MongoStore = require('connect-mongo')(session);

const connectDB = require('./config/db');
const mongoose = require('mongoose');

// Load config
dotenv.config({
    path: './config/config.env'
});

// Passport config
require('./config/passport')(passport)

connectDB();


const app = express();

// Body parser
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Method override for put and delete requests
app.use(
    methodOverride(function (req, res) {
        // looks for _method and replace with put/delete
        if (req.body && typeof req.body === 'object' && '_method' in req.body) {
            // look in urlencoded POST bodies and delete it
            let method = req.body._method
            delete req.body._method
            return method
        }
}))

// Logging
if (process.env.NODE_ENV === 'development') {
    // DEV level of logging
    app.use(morgan('dev'));
}

// Register Handlebars Helper
const { formatDate, stripTags, truncate, editIcon, select} = require('./helpers/hbs');

// Handlebars
app.engine('.hbs', exphbs({ helpers: {
    formatDate,
    stripTags,
    truncate,
    editIcon,
    select
}, defaultLayout: 'main', extname: '.hbs' }));
app.set('view engine', '.hbs');

// express-session middleware
app.use(session({
    secret: 'keyboard cast',
    resave: false,
    saveUninitialized: false,
    store: new MongoStore({ mongooseConnection: mongoose.connection })
}));

// passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Set express global var
app.use((req, res, next) => {
    res.locals.user = req.user || null;
    next();
})

// Static folder
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', require('./routes/index'));
app.use('/auth', require('./routes/auth'));
app.use('/stories', require('./routes/stories'));

const PORT = process.env.PORT || 3000;

app.listen(
    PORT,
    console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}.`)
);