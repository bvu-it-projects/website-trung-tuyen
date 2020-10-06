require('dotenv/config');

const logger = require('morgan');
const bodyParser = require('body-parser');
const express = require('express');
const partials = require('express-partials');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const uuid = require('uuid').v4;
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const app = express();


const user = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
};


app.use(logger('dev'));
app.use(express.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({limit: "50mb", extended: true, parameterLimit:50000}));


passport.use(new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
},
(username, password, done) => {
    console.log('\n\nInside the LocalStrategy callback');

    if (username === user.username && password === user.password) {
        return done(null, user);
    }
    else {
        return done(null, false, {message: 'Thông tin đăng nhập không chính xác.'});
    }
}));

passport.serializeUser((user, done) => {
    console.log('\n\nInside the serializeUser callback. User id is save to the session file store here.');
    done(null, user.username);
});

passport.deserializeUser((id, done) => {
    console.log('Inside deserializeUser callback');
    done(null, user.username === id ? user: false);
});



app.use(session({
    secret: process.env.SESSION_SECRECT,
    resave: false,
    saveUninitialized: true,
    store: new FileStore(),
    genid: (req) => {
        console.log('\n\n\nSessionID inside the session middleware:', req.sessionID);
        return uuid();
    }
}));
app.use(passport.initialize());
app.use(passport.session());



// dont't allow caching
app.use((req, res, next) => {
    res.setHeader(
        'Cache-Control', 'private, no-cache, no-store, must-revalidate, max-age=0'
    );
    res.setHeader(
        'Pragma', 'no-cache'
    );

    next();
});



// root page routing
app.use('/', require('./routes/root'));


//  serving static
app.use(express.static('public'));
app.use(express.static('public/images'));

// setting up view engine
app.set('view engine', 'ejs');
app.use(partials());




const PORT = 5500;
app.listen(PORT, () => {
    console.log('Listening on port: ', PORT);
    console.log('Open browser on: http://localhost:' + PORT);
});



// login routing
app.get('/login', function (req, res) {
    if (!req.isAuthenticated()) {
        res.render('login');
    }
    else {
        res.redirect('upload');
    }
});

app.post('/login', function (req, res, next) {
    console.log(req.body);

    passport.authenticate('local', (err, user, info) => {
        if (info || err || !user) {
            return res.render('login', {errorAlert: `
                <script>
                    alert('Có lỗi trong quá trình xác thực');
                </script>
            `});
        }

        console.log('\nInside passport.authenticate callback');
        console.log('Request session passport:', JSON.stringify(req.session.passport));
        console.log('Request user:', JSON.stringify(req.session));


        req.logIn(user, (err) => {
            if (err) {
                return next(err);
            }

            console.log('\nInside req.logIn() callback');
            console.log('Request session passport:', JSON.stringify(req.session.passport));
            console.log('Request user:', JSON.stringify(req.session));
            return res.redirect('upload');
        })
    })(req, res, next);
});

app.get('/logout', function (req, res) {
    req.logOut();
    res.redirect('login');
});


// routes that require loged in

app.use('/upload', require('./routes/upload'));


app.use((req, res,next) => {
    res.render('404');
});