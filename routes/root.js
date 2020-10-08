
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const moment = require('moment');

module.exports = router;



router.get('/', function (req, res) {

    getFooterNotes()
        .then(function (notes) {
            res.render('index', {
                notes: notes,
            });
        })
        .catch(function (err) {
            res.render('index');
        });
});

router.get('/generate', function (req, res) {

    const xlsx = require('../self_modules/xlsx-converter');

    let finalPath = path.join(__dirname, '..', 'sources/ds3.xlsx');
    let json = xlsx.getBeautifulJSON(finalPath);    // lấy và lưu file
    
    
    res.status(200).send(json);

});



router.post('/', function (req, res) {

    findInfo(req.body.input)
        .then(function(result) {

            // writing to statistics files
            try {
                const timestamp = Date.now();
                const now = moment();
                const statisticsFilePath = path.join(__dirname, '..', `statistics/${timestamp}`);
                const statisticsDatas = {
                    query: req.body.input,
                    date: now.format('DD'),
                    month: now.format('MM'),
                    year: now.format('YYYY'),
                    time: now.format('HH:mm:ss'),
                    success: result.length ? 'true': 'false',
                    results: result.length
                };
                fs.writeFile(statisticsFilePath, JSON.stringify(statisticsDatas), {flag: 'w'}, (err) => {
                    console.log('\nNew query:', err);
                });
            }
            catch (err) {
                console.log(err);
                fs.writeFile(
                    path.join(__dirname, '..', 'stderr.log'),
                    err, {encoding: 'utf8', flag: 'a'}, (err) => {

                    }
                );
            }


            // getting notes
            getFooterNotes()
                .then(function (notes) {
                    res.render('result', {
                        result: result,
                        notes: notes
                    });
                })
                .catch(function (err) {
                    res.render('result', {
                        result: result,
                    });
                });
        })
        .catch(function(err) {
            console.log(err);
            res.status(404).send('Failed to read data. Please contact the supporter to fix this issue. Maybe this issue caused by writing too quick, try to re-upload your data.');
        });

});


router.get('/result/:input', async function(req, res) {
    console.log('\n\nLooking up...');

    findInfo(req.params.input)
        .then(function(info) {
            res.status(200).send(info);
        })
        .catch(function(err) {
            console.log(err);
            res.status(404).send('Failed');
        });
});




function findInfo(input) {
    return new Promise((resolve, reject) => {
        fs.readFile(
            path.join(__dirname, '..', 'results/1.json'), {encoding: 'utf8'}, (err, data) => {
            if (err) {
                return reject(err);
            }

            let collection = [];


            // lỗi parseJSON có thể xảy ra
            try {
                data = JSON.parse(data);
                input = removeAccents(input.toLowerCase());
                
                
                for (let i = 0; i < data.length; i++) {
                    if (removeAccents(`${data[i]['sbd']}`).toLowerCase().includes(input)
                        || removeAccents(`${data[i]['lastname']}`).toLowerCase().includes(input)
                        || removeAccents(`${data[i]['firstname']}`).toLowerCase().includes(input)
                        || removeAccents(`${data[i]['lastname']}${data[i]['firstname']}`).toLowerCase().includes(input)) {
                            collection.push(data[i]);
                    }
                }
            }
            catch (err) {
                return reject(err);
            }
            

            return resolve(collection);
        });
    });
}


function removeAccents(str) {
    return str.normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/đ/g, 'd').replace(/Đ/g, 'D');
}


function getFooterNotes() {
    return new Promise((resolve, reject) => {

        fs.readFile(path.join(__dirname, '..', 'sources/notes.txt'), (err, data) => {
            if (err) return resolve("");
            return resolve(data);
        });

    });
}

