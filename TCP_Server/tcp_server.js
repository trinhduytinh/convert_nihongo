
// const multer = require('multer');
const path = require('path');
const { spawn } = require('child_process');
var express = require("express");
var app = express();
var net = require('net');
var fs = require('fs');
// const { fileURLToPath } = require('url');
app.use(express.static(__dirname + '/public'));


var server = net.createServer(function (socket) {
    var receivedData = '';
    var fileName = '';

    var tmp = '';
    socket.on('data', function (data) {
        data = data.toString();
        // tmp += '----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------' + data;
        receivedData += data;


        while(receivedData.includes('file'))
        {
            var separatorIndex = receivedData.indexOf('file');
            while (separatorIndex !== -1) {
                var imageData = receivedData.substring(0, separatorIndex);
                receivedData = receivedData.substring(separatorIndex);
    
                // Tìm và trích xuất tên tệp hình ảnh
                var fileNameMatch = receivedData.match(/file\[\d+\]-\d+\.png/);
                if (fileNameMatch) {
                    fileName = fileNameMatch[0];
                }
    
                handleImage(imageData, fileName);
                receivedData = receivedData.substring(fileName.length); // Loại bỏ dữ liệu đã xử lý
    
                separatorIndex = receivedData.indexOf('file');
            }
        }

        // const filePath = 'a.txt'; // Thay thế 'duongdan' bằng đường dẫn thực tế của bạn

        // //Sử dụng phương thức writeFile để ghi dữ liệu vào tệp txt
        // fs.writeFile(filePath, tmp, (err) => {
        //     if (err) {
        //         console.error('Lỗi khi ghi dữ liệu vào tệp txt:', err);
        //     } else {
        //         console.log('Dữ liệu đã được ghi vào tệp txt thành công.');
        //     }
        // });


    });

    function handleImage(imageData, fileName) {
        if (imageData.length > 0) {
            const filePath = path.join(__dirname, 'uploads', fileName);
            fs.writeFile(filePath, imageData, 'base64', (err) => {
                if (err) {
                    console.error(`Error saving the image: ${err}`);
                } else {
                    console.log(`Image saved as ${fileName}`);
                    convert(fileName);
                }
            });
        }
    }
    /*
    // var fileName = '';
    var receivedData = '';
    // const filePath = 'a.txt';
    socket.on('data', (data) => {
        data = data.toString();
        receivedData += data;

        const filePath = 'a.txt'; // Thay thế 'duongdan' bằng đường dẫn thực tế của bạn

        // Sử dụng phương thức writeFile để ghi dữ liệu vào tệp txt
        // fs.writeFile(filePath, receivedData, (err) => {
        //     if (err) {
        //         console.error('Lỗi khi ghi dữ liệu vào tệp txt:', err);
        //     } else {
        //         console.log('Dữ liệu đã được ghi vào tệp txt thành công.');
        //     }
        // });

        var separatorIndex = receivedData.indexOf('*');
        while (separatorIndex !== -1) {
            var image = receivedData.substring(0, separatorIndex);
            handleImage(image);
            // Loại bỏ dữ liệu đã xử lý khỏi receivedData
            receivedData = receivedData.substring(separatorIndex + 1); // 3 là độ dài của dấu phân cách

            separatorIndex = receivedData.indexOf('*');
        }
    });
    function handleImage(imageData) {
        if (imageData.length > 0) {
            var fileName = `image_${Date.now()}.png`;
            const filePath = path.join(__dirname, 'uploads', fileName);
            fs.writeFile(filePath, imageData, 'base64', (err) => {
                if (err) {
                    console.error(`Error saving the image: ${err}`);
                } else {
                    console.log(`Image saved as ${fileName}`);
                    convert(fileName);
                }
            });
        }
    }  */

    function convert(fileName) {
        if (fileName != '') {
            console.log("file name: ", fileName)
            const imagePath = path.join(__dirname, 'uploads', fileName).replace(/\\/g, '/');
            // console.log("img path: ", imagePath);

            const pythonProcess = spawn('python', ['D:/ltmnc2/MODEL/MODEL/ocr.py', imagePath]);
            let result = '';
            pythonProcess.stdout.on('data', (data) => {
                result += data.toString('utf-8');
            });
            pythonProcess.stderr.on('data', (data) => {
                console.error(`Lỗi: ${data}`);
            });
            pythonProcess.on('close', () => {
                const responseData = { fileName: fileName, result: result };
                // socket.write(`file name: ${fileName} result: ${result}`);
                socket.write(JSON.stringify(responseData));
                console.log('Data is responded !');
            });
        }
    }

    // Callback function when client disconnected
    socket.on('end', function () {
        console.log("Server: Client disconnected");
    });

    // Callback function when there is error
    socket.on('error', function (err) {
        console.log("Server: ERROR: " + err);
    });
});

// Open port 2021
server.listen(2021, function () {
    console.log("Server: listening !\r\n");
});