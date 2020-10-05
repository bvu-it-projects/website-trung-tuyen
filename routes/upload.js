const xlsxConverter = require('../self_modules/xlsx-converter');
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const formidable = require('formidable');
const XLSX = require('xlsx');

module.exports = router;



router.get('/', function (req, res) {
    if (!req.isAuthenticated()) {
        res.redirect('/login');
        return;
    }

    getFooterNotes()
        .then((notes) => {
            res.render('upload', {notes: notes});
        })
        .catch((err) => {
            res.render('upload');
        });
});

router.get('/:file', function (req, res) {
    if (req.params.file == 'ds.xlsx') {
        res.status(200).sendFile(path.join(__dirname, '..', 'sources/ds.xlsx'));
        return;
    }
    else {
        if (req.params.file == 'template.xlsx') {
            res.status(200).sendFile(path.join(__dirname, '..', 'sources/template.xlsx'));
            return;
        }
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
                res.status(200).send('Tải dữ liệu thành công');
            }
        });
    
});


router.post('/xlsx', function(req, res) {
    let form = new formidable.IncomingForm();

    //  lấy Workbook từ req
    form.parse(req, function(err, fields, files) {
        let f = files[Object.keys(files)[0]];
        let workbook = XLSX.readFile(f.path);

        const filePath = path.join(__dirname, '..', 'sources/ds.xlsx');
        xlsxConverter.saveToXLSXfile(workbook, filePath)
            .then((writeToXLSXstatus) => {
                if (writeToXLSXstatus) {   //  lưu file xlsx thành công

                    //  tối giản JSON
                    let json = xlsxConverter.jsonFromWorkbook(workbook);
                    let simplifiedJSON = xlsxConverter.simpifyJSON(json);

                    // và lưu JSON
                    const resultPath = path.join(__dirname, '..', 'results/1.json');
                    xlsxConverter.saveJsonToFile(simplifiedJSON, resultPath)
                        .then((writeToJsonStatus) => {
                            if (writeToJsonStatus) {
                                res.status(200).send('Cập nhật dữ liệu thành công');
                            }
                            else {
                                res.status(501).send('Failed to save JSON file.');
                            }
                        })
                }
                else {
                    res.status(501).send('Failed to save XLSX file.');
                }
            });

    });

    // res.status(200).send('ok');
});




router.post('/updateNotes', function(req, res) {

    console.log(req.body);
    // res.status(501).send('Cập nhật Ghi chú thất bại');

    saveNotes(req.body.editedNotes)
        .then(function(message) {
            res.status(200).send(message);
        })
        .catch(function (err) {
            console.log(err);
            res.status(501).send('Cập nhật Ghi chú thất bại');
        });
});




function saveNotes(notes) {
    return new Promise((resolve, reject) => {
        const notesPath = path.join(__dirname, '..', 'sources/notes.txt');
        console.log(notesPath);

        fs.writeFile(notesPath, notes, (err) => {
            if (err) {
                return reject(err);
            }
            
            return resolve('Cập nhật Ghi chú thành công');
        });
    });
}

function getFooterNotes() {
    return new Promise((resolve, reject) => {

        fs.readFile(path.join(__dirname, '..', 'sources/notes.txt'), (err, data) => {
            if (err) return resolve("");
            return resolve(data);
        });

    });
}



// router.get('/checkdb', function (req, res) {
//     const dbChecker = require('../self_modules/db-checker');

//     // kiểm tra db có lỗi hay không
//     dbChecker.isDatabaseNotFailed()
//         .then(status => {
//             if (status) {
//                 res.status(200).send('Trạng thái Dữ liệu: ổn định');
//             }
//             else {
//                 res.status(200).send('Thất bại. Dữ liệu trên máy chủ đã bị lỗi. Vui lòng Tải lại dữ liệu lên.');
//             }
//         })

// });