// import express module and create your express app
const express = require('express');
const app = express();

// set the server host and port
const port = 3001;

// add data to req.body (for POST requests)
app.use(express.urlencoded({ extended: true }));

// serve static files
app.use(express.static('../frontend'));

// set the view engine to ejs
app.set('view engine', 'ejs');

const session = require('express-session');
app.use(session({
	secret: 'login', //used to sign the session ID cookie
	name: 'login', // (optional) name of the session cookie
	resave: true, // forces the session to be saved back to the session store
	saveUninitialized: true, // forces a session an uninitialized session to be saved to the store
}));


// routers

const cart = require('./routers/cart');
app.use('/cart', cart);

const login = require('./routers/login');
app.use('/', login);

const router = require('./routers/router');
app.use('/', router);

// run the server
app.listen(port, () => {
	// callback executed when the server is launched
	console.log(`Express app listening on port ${port}`);
});
