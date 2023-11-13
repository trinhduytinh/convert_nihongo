const Upload = require('../models/uploadHistoryModel');

const multer = require('multer');
const path = require('path');
// const { spawn } = require('child_process');

// Asynchronous network API module
var net = require('net');
// File system module to store data
var fs = require('fs');

// Thiết lập Multer cho việc tải lên tệp
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/'); // Đặt thư mục tải lên
    },
    filename: (req, file, cb) => {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    },
});

const upload = multer({ storage });
let uploadedFiles = null;
exports.handleFileUpload = (req, res, next) => {
    upload.any('file', 100)(req, res, (err) => {
        if (err instanceof multer.MulterError) {
            console.log('Upload error.');
        } else if (err) {
            console.log('Server error.');
        }
        // Dạng tệp đã tải lên nằm trong req.files
        uploadedFiles = req.files;
        console.log('req.files:', req.files);
        if (!uploadedFiles || uploadedFiles.length === 0) {
            console.log('No files uploaded.');
        }
        // Xử lý tệp đã tải lên ở đây (ví dụ: lưu vào cơ sở dữ liệu, xử lý, vv.)

        // Phản hồi thành công
        console.log(uploadedFiles.length, 'Files uploaded successfully');
        next();
    });
}

exports.test = (req, res, next) => {
    res.send('abc');
}

// exports.convert = (req, res, next) => { 
//     const imageName = req.files[0].filename;
//     const imagePath = path.join(__dirname, '..', 'uploads', imageName).replace(/\\/g, '/');
//     // console.log(imagePath);

//     var client = new net.Socket();
//     client.connect(2021, "localhost", function () {
//         console.log('Connected///////////////////////');
//         // Create stream for log file    
//         var logfile = fs.createWriteStream('client.log', { flags: 'a' });
//         // Callback function when there is error
//         logfile.on('error', function (err) {
//             console.log("Log file: ERROR: " + err);
//         });

//         // Forward received data to log file
//         client.pipe(logfile);

//         const imageBuffer = fs.readFileSync(imagePath);
//         const base64Image = imageBuffer.toString('base64');
//         // console.log('Original image size:', imageBuffer.length, 'bytes');
//         // console.log('Base64 image size:', base64Image.length, 'characters');

//         const dataToSend = base64Image + '===Base64ImageEndMarker===';
//         client.write(dataToSend);

//         //Đóng kết nối sau khi hoàn thành việc gửi ảnh
//         //  client.end();
//     });

//     // Callback function when data arrives
//     var testdata = '';
//     client.on('data', function (data) {
//         console.log('Received: ' + `${data}`.toString('utf-8'));
//         testdata = `${data}`.toString('utf-8');
//         // Kill client after server's response
//         client.destroy();
//     });

//     // Callback function when client disconnected
//     client.on('close', function () {
//         console.log('Connection closed');

//         req.photo = imageName;
//         req.text = testdata;

//         next();
//     });
// }

exports.convert = (req, res, next) => {
    var i = 0;
    var dataToNext = [];
    const imageFiles = req.files;
    const client = new net.Socket();
    client.connect(2021, "localhost", function () {
        console.log('Connected');
        imageFiles.forEach((imageFile, index) => {
            const imagePath = path.join(__dirname, '..', 'public/uploads', imageFile.filename).replace(/\\/g, '/');
            const imageBuffer = fs.readFileSync(imagePath);
            const base64Image = imageBuffer.toString('base64');
            const dataToSend = base64Image + `${imageFiles[index].filename}`;
            client.write(dataToSend);
            //Đóng kết nối sau khi hoàn thành việc gửi ảnh   =>KHÔNG nhận dc data
            // if (index === imageFiles.length - 1) {
            //     client.end();
            // }
        });
    });

    // Callback function when data arrives
    client.on('data', function (data) {
        i++;
        // console.log(`Received from server for image: ${data.toString('utf-8')}`);
        const resData = JSON.parse(data.toString('utf-8'));
        dataToNext.push(resData)
        console.log(`${i} Received from server for image: ${resData.fileName} --- ${resData.result}`);
        if (i === imageFiles.length) {
            client.end();
            console.log('-----------end-----------');
        }
    });
    // Callback function when client disconnected
    client.on('close', function () {
        console.log('Connection closed');
        req.resData = dataToNext;
        next();
    });
}

exports.show = (req, res, next) => {
    // console.log('-->', req.resData)
    req.resData.forEach(data => {
        const userId = req.user.id;
        const photo = data.fileName;
        const text = data.result;
        const upload = Upload.create({
            user: userId,
            photo,
            text
        });
    });
}
