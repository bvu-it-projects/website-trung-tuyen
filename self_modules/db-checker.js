
const path = require('path');
const fs = require('fs');


module.exports = { isDatabaseNotFailed };




function isDatabaseNotFailed() {
    return new Promise((resolve, reject) => {
        try {
            fs.readFile(
                path.join(__dirname, '..', 'results/1.json'), {encoding: 'utf8'}, (err, data) => {
                if (err) {
                    return resolve(false);
                }
    
                // lỗi parseJSON có thể xảy ra
                data = JSON.parse(data);

                return resolve(true);
            });
        }
        catch (err) {
            return resolve(false);
        }
    });
}