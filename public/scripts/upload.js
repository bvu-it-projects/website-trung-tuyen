var spinner;


document.addEventListener('DOMContentLoaded', function() {
    spinner = new jQuerySpinner({
        parentId: 'body'
    });


    handleEditingNotesModal();


    // gán sự kiện lắng nghe chọn file cho Input
    document.getElementById('txtFile')
        .addEventListener('change', function(e) {
            let files = e.target.files;
            if (!files || files.length == 0) return;

            //  lấy thông tin file xlsx đã chọn từ input
            let file = e.target.files[0];
            let name = file.name;
            $('#txtFileName').text(name);

            //  đọc file
            let fileReader = new FileReader();
            fileReader.readAsArrayBuffer(file);

            //  khi file được đọc
            fileReader.onload = function(e) {
                let data = new Uint8Array(fileReader.result);
                let workbook = XLSX.read(data, {type: 'array'});

                //  parse thành JSON và hiển thị cho Client
                let sheet_name_list = workbook.SheetNames;
                let json = XLSX.utils.sheet_to_json(workbook.Sheets[sheet_name_list[0]], {raw: false});
                json = simpifyJSON(json);
                loadTable(json, workbook);
            }
        });

});


function handleEditingNotesModal() {
    $('#btnSaveNotes').click(function() {
        const editedNotes = $('#txtNotes').val();

        $.post('/upload/updateNotes', {editedNotes}, function(data) {
            toastr.success(data, {timeOut: 3000});
            setTimeout(() => {
                $('#editingNotesModal').modal('hide');
            }, 1000);
        })
        .fail(error => {
            toastr.error('Thất bại', {timeOut: 3000});
        });
    });
}


function loadTable(json, workbook) {
    let table = $('#tblResult > tbody');
    const jsonLength = Object.keys(json).length;

    // xoá hết dòng dữ liệu
    $('#tblResult > tbody > tr:not(:first-child)').remove();
    $('#txtTableRows').text(`Bảng này có ${jsonLength} dòng.`);


    if (jsonLength === 0) {
        table.append(`
        <tr id="txtTableEmpty">
            <td colspan="9">
                Không đọc được dữ liệu. Vui lòng kiểm tra lại định dạng.
            </td>
        </tr>`);

        $('#btnSubmitFile').attr('disabled', true);
        return;
    }


    // gán sự kiện click cho nút Tải file lên server
    $('#btnSubmitFile').attr('disabled', false);
    $('#btnSubmitFile').on('click', () => {
        // uploadJSON(json);    //  old

        // gán sự kiện gửi file cho Server
        let xlsData = XLSX.write(workbook, {bookType: 'xlsx', type: 'array'});
        let fd = new FormData();
        fd.append('data', new File([xlsData], 'ds.xlsx'));
        sendXLSXtoServer(fd);
    });


    //  gán dữ liệu lên Table
    for (let i = 0; i < json.length; i++) {
        table.append(`
            <tr>
                <td>${json[i]['stt']}</td>
                <td>${json[i]['sbd']}</td>
                <td>${json[i]['lastname']}</td>
                <td>${json[i]['firstname']}</td>
                <td>${json[i]['gender']}</td>
                <td>${json[i]['dob']}</td>
                <td>${json[i]['combination']}</td>
                <td>${json[i]['major']}</td>
                <td>${json[i]['admissionScores']}</td>
            </tr>
        `)
    }
}


function uploadJSON(json) {
    spinner.show();


    $.post('/upload', {
        data: json
    })
    .done(function(data) {
        toastr.success(data, {timeOut: 5000});
    })
    .fail(function(err) {
        toastr.error('Lỗi không xác định.\nDữ liệu hiển thị cho người dùng có thể đã bị lỗi.\n\nVui lòng Tải lên lại dữ liệu.\nVui lòng không chọn file nhiều lần.', {timeOut: 5000});
        console.log(err);
    })
    .always(function() {
        spinner.hide();

        setTimeout(() => {
            toastr.warning('Vui lòng kiểm tra lại Dữ liệu bằng cách Tìm kiếm ở trang chủ', {timeOut: 5000});
            setTimeout(() => {
                toastr.info('Nếu thông tin bị lỗi, hãy tải lại Dữ liệu.', {timeOut: 5000}); 
            }, 1250);
        }, 750);
    });
}


function simpifyJSON(json) {
    console.log('length:', json.length);

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
    

    return collection;
}


function sendXLSXtoServer(xlsxFormData) {
    spinner.show();


    $.ajax({
        url: 'upload/xlsx',
        data: xlsxFormData,
        processData: false,
        contentType: false,
        type: 'post',
    })
    .done(function(data) {
        toastr.success(data, {timeOut: 5000});
    })
    .fail(function(err) {
        toastr.error('Lỗi không xác định.\nDữ liệu hiển thị cho người dùng có thể đã bị lỗi.\n\nVui lòng Tải lên lại dữ liệu.\nVui lòng không chọn file nhiều lần.', {timeOut: 5000});
        console.log(err);
    })
    .always(function() {
        spinner.hide();

        setTimeout(() => {
            toastr.warning('Vui lòng kiểm tra lại Dữ liệu bằng cách Tìm kiếm ở trang chủ', {timeOut: 5000});
            setTimeout(() => {
                toastr.info('Nếu thông tin bị lỗi, hãy tải lại Dữ liệu.', {timeOut: 5000}); 
            }, 1250);
        }, 750);
    });

}