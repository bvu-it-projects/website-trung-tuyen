
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');


module.exports = router;



router.get('/', async function (req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
        return;
    }


    const statisticsPath = path.join(__dirname, '..', 'statistics');
    const fileNames = await getFileNames(statisticsPath).catch(console.error);


    if (fileNames && fileNames.length) {
        getStatisticsData(fileNames)
            .then(data => {
                res.render('statistics', {data: data || []});
            })
            .catch(err => {
                console.log(err);
                res.render('statistics');
            });
    }
    else {
        res.render('statistics');
    }
});


async function getFileNames(path) {
    const files = [];
    const dir = await fs.promises.opendir(path);

    console.log('\nFiles names:',dir.path.length );
    for await (const dirent of dir) {
        files.push(dirent.name);
    }

    return files;
}


function getStatisticsData(fileNames) {
    return new Promise(async (resolve, reject) => {
        let collection = [];

        for (let i = 0; i < fileNames.length; i++) {
            const statisticsPath = path.join(__dirname, '..', 'statistics/' + fileNames[i]);
            let string = fs.readFileSync(statisticsPath, {encoding: 'utf8'});
            collection.push(string);
        }

        return resolve(collection);
    });
}