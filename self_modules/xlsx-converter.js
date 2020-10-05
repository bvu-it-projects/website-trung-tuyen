
const xlsx = require('xlsx');
const fs = require('fs');
module.exports = { toRawJSON, getBeautifulJSON, jsonFromWorkbook, saveToXLSXfile, saveJsonToFile, simpifyJSON };



function getBeautifulJSON(fileName) {
    let json = toRawJSON(fileName);
    let simplifiedJSON = simpifyJSON(json);
    
    return simplifiedJSON;
}



function toRawJSON(fileName) {

    const workbook = xlsx.readFile(fileName);
    const sheet_name_list = workbook.SheetNames;
    let json = (xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {raw: false}));

    // console.log('raw json:', json);
    return json;
}

function jsonFromWorkbook(workbook) {
    const sheet_name_list = workbook.SheetNames;
    let json = (xlsx.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {raw: false}));

    // console.log('raw json:', json);
    return json;
}



function simpifyJSON(json) {
    let collection = [];
    

    for (let i = 0; i < json.length; i++) {
        if (Object.keys(json[i]).length === 16) {
            collection.push({
                stt: json[i]['STT'],
                sbd: json[i]['Số BD'],
                lastname: json[i]['Họ và tên'],
                firstname: json[i]['__EMPTY'],
                gender: json[i]['Giới tính'],
                dob: json[i]['Ngày sinh'],
                combination: json[i]['Tổ hợp môn'],
                area: json[i]['Khu vực'],
                major: json[i]['Ngành'],
                firstSubjectScores: json[i]['Điểm thi THPT QG'],
                secondSubjectScores: json[i]['__EMPTY_1'],
                thirdSubjectScores: json[i]['__EMPTY_2'],
                avarageScores: json[i]['Tổng điểm'],
                prioritizeScores: json[i]['Điểm ưu tiên'],
                admissionScores: json[i]['Điểm xét tuyển'],
            });
        }
    }
    

    console.log('Total records:', collection.length);
    return collection;
}


function saveToXLSXfile(workbook, path) {
    return new Promise((resolve, reject) => {
        try {
            xlsx.writeFile(workbook, path);
            console.log('\n\nCompleted writing to XLSX file.');
            return resolve(true);   //  ghi file thành công
        }
        catch (err) {
            return resolve(false);  //  ghi file thất bại
        }
    });
}

function saveJsonToFile(json, filePath) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filePath, JSON.stringify(json), 'utf8', (err) => {
            if (err) {
                return resolve(false);
            }

            console.log('Completed writing to JSON file.\n');
            return resolve(true);
        });
    });
}
