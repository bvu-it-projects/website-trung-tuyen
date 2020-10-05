require('dotenv/config');
const express = require('express');
const router = express.Router();


module.exports = router;



router.get('/', function (req, res) {
    res.send('got login page');
});


router.post('/', function (req, res) {
    console.log(req.body);
    res.send('posted to login page');
});