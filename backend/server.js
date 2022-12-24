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


// routers

const cart = require('./routers/cart');
app.use('/cart', cart);


const router = require('./routers/router');
app.use('/', router);

// run the server
app.listen(port, () => {
	// callback executed when the server is launched
	console.log(`Express app listening on port ${port}`);
});
