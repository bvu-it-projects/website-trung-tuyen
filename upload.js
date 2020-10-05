const xlsxConvertor = require('../self_modules/xlsx-converter');
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

module.exports = router;


router.get('/', function (req, res) {
    console.log(req.query);
    res.render('upload');
});

router.get('/:file', function (req, res) {
    if (req.params.file == 'ds.xlsx') {
        res.status(200).sendFile(path.join(__dirname, '..', 'sources/ds.xlsx'));
        return;
    }
});


router.post('/', function (req, res) {
    
    console.log('\n\nUploading data...');
    const filePath = path.join(__dirname, '..', 'results/1.json');

    fs.writeFile(filePath, 
        JSON.stringify(req.body.data), 'utf8', (err) => {
            if (err) {
                console.log('Error reading data source:', err);
                res.status(200).send('Ghi dữ liệu Thất bại.');
            }
            else {
                res.status(200).send('Tải dữ liệu lên thành công');
            }
        });

});