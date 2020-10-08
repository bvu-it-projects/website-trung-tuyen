
document.addEventListener('DOMContentLoaded', function() {
    // var ctx = document.getElementById('chart').getContext('2d');
    // var chart = new Chart(ctx, {
    //     // The type of chart we want to create
    //     type: 'line',

    //     // The data for our dataset
    //     data: {
    //         labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
    //         datasets: [{
    //             label: 'My First dataset',
    //             backgroundColor: 'rgb(255, 99, 132)',
    //             borderColor: 'rgb(255, 99, 132)',
    //             data: [0, 10, 5, 2, 20, 30, 45]
    //         }]
    //     },

    //     // Configuration options go here
    //     options: {}
    // });
});



function handleData(data) {
    let arr = [];

    data.forEach(element => {
        let json = JSON.parse(element);
        arr.push(json);
    });

    generateXLSX(arr);
    drawChart(arr);
}


function generateXLSX(json) {
    let worksheet = XLSX.utils.json_to_sheet(json);

    let workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "SHEET_1");


    $('#btnExportExcel').prop('disabled', false);
    $('#btnExportExcel').click(()=> {
        let now = moment();
        let suffix = `${now.format('DD_MM_YYYY')}__${now.format('HH')}h${now.format('mm')}m${now.format('ss')}s`;
        XLSX.writeFile(workbook, `statistics__${suffix}.xlsx`);
    });
}


function drawChart(json) {
    let now = moment();
    let mDate = now.format('DD');
    let mMonth = now.format('MM');
    let mYear = now.format('YYYY');


    let labels = {};
    for (let i = 0; i <= 23; ++i) {
        labels[`${i}h`] = 0;
    }


    let todayEntries = [];
    //  loop through records
    json.forEach((element) => {
        if (element.year == mYear)
            if (element.month == mMonth)
                if (element.date == (mDate)) {
                    todayEntries.push(element);
                }
    });


    // console.log(json);
    console.log(labels);
    console.log(todayEntries);

    //  loop through all today entries to group by hours
    let totalQueries = 0;
    todayEntries.forEach((element) => {
        let time = moment(element.time, 'HH:mm:ss');
        let hours = parseInt(time.format('HH'));

        totalQueries++;
        labels[`${hours}h`] = labels[`${hours}h`] + 1;
    });



    let ctx = document.getElementById('chart').getContext('2d');
    let chart = new Chart(ctx, {
        // The type of chart we want to create
        type: 'line',

        // The data for our dataset
        data: {
            labels: Object.keys(labels),
            datasets: [{
                label: 'Số lượt truy vấn',
                backgroundColor: 'rgba(255, 99, 132)',
                borderColor: '#004a90',
                data: Object.values(labels)
            }]
        },

        // Configuration options go here
        options: {
            bezierCurve: false,
            title: {
                display: true,
                text: `Lượt truy vấn Hôm nay: ${totalQueries}`,
                position: 'bottom'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true,
                        callback: function (value) { if (Number.isInteger(value)) { return value; } },
                        stepSize: 1
                    }
                }]
            }
        }
    });

}