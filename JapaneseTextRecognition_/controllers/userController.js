const User = require('../models/userModel');
const History = require('../models/uploadHistoryModel');
const { spawn } = require('child_process');

const multer = require('multer');
const app = require('../app');

exports.getAllUsers = async (req, res, next) => {
    const users = await User.find();
    if (!users) {
        return res.status(404).json({
            status: 'fail'
        })
    }

    res.status(200).json({
        status: 'success',
        results: users.length,
        data: {
            users
        }
    })
}

exports.getUser = async (req, res, next) => {
    try {
        const user = await User.findById(req.params.id).populate('uploads')
        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'can not find user with that Id'
            })
        }

        return res.status(200).json({
            status: 'success',
            data: {
                user
            }
        })

    } catch (err) {
        return res.status(400).json({
            status: 'fail',
            error: err
        })
    }
}

exports.updateUser = async (req, res, next) => {
    try {
        const user = await User.findOneAndUpdate({ email: req.body.email }, { name: req.body.name }, {
            new: true,
            runValidators: true
        });

        if (!user) {
            return res.status(404).json({
                status: 'fail',
                message: 'No user found with that ID'
            })
        }
        if (req.user.role === 'user')
            res.redirect('/myAccount');
        else
            res.redirect('/admin/myAccount');



    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }

};

exports.updatePassword = async (req, res, next) => {
    try {
        const currentPassword = req.body.currentPassword;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;
        const user = req.user;

        if (!(user.isCorrectPassword(currentPassword, user.password))) {
            return res.status(401).json({
                status: 'fail',
                message: 'Incorrect password'
            })
        }

        user.password = newPassword;
        user.passwordConfirm = confirmPassword;
        await user.save();

        if (req.user.role === 'user')
            res.redirect('/myAccount');
        else
            res.redirect('/admin/myAccount');
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err
        })
    }
}
exports.getHistory = async (req, res, next) => {
    try {
        const record = await History.find({ user: req.user.id }).lean();
    
        if (!record) {
          return res.status(404).json({ message: 'Không tìm thấy bản ghi.' });
        }
    
        const userObj = req.user.toObject();

        res.render('history', { userObj, record });
      } catch (error) {
        res.status(500).json({ message: 'Lỗi server.' });
      }
}
exports.getAllHistory = async (req, res, next) => {
    try {
        const records = await History.find().lean();

        // Nhóm bản ghi theo ngày và tính người dùng đã chuyển đổi
        const groupedData = {};
        records.forEach((record) => {
            const date = record.createdAt; // Trích xuất ngày
            if (!groupedData[date]) {
                groupedData[date] = {
                    date,
                    convertedUsers: 0,
                    data: [],
                };
            }
            groupedData[date].convertedUsers++;
            groupedData[date].data.push(record);
        });

        // Chuyển đổi dữ liệu đã nhóm thành một mảng
        const historyData = Object.values(groupedData);

        const userObj = req.user.toObject();

        res.render('histroy_admin', { userObj, historyData });
        // res.status(200).json(historyData)
    } catch (err) {
        res.status(400).json({
            status: 'fail',
            message: err,
        });
    }
};
// exports.covert = async (req, res, next) => {
//     try {
//         console.log('ok');
//         const imagePath = req.files[0].filename;
//         console.log(imagePath);
//         const pythonProcess = spawn('python', ['../MODEL/ocr.py', imagePath]);
//         let result = ''; // Tạo một biến để lưu kết quả
//         pythonProcess.stdout.on('data', (data) => {
//             result += data.toString(); // Cộng thêm dữ liệu vào biến kết quả
//         });
//         pythonProcess.stderr.on('data', (data) => {
//             console.error(`Lỗi: ${data}`);
//             res.status(500).send('Đã xảy ra lỗi trong quá trình xử lý.');
//         });
//         pythonProcess.on('close', () => {
//             res.send(`Kết quả OCR: ${result}`); // Gửi kết quả sau khi tiến trình Python kết thúc
//         });
//     } catch (err) {
//         res.status(400).json({
//             status: 'fail',
//             message: err
//         })
//     }
// }

// exports.upload = (req, res, next) => {
//     // Thiết lập Multer cho việc tải lên tệp
//     const storage = multer.diskStorage({
//         destination: (req, file, cb) => {
//         cb(null, 'uploads/'); // Đặt thư mục tải lên
//         },
//         filename: (req, file, cb) => {
//         cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
//         },
//     });
    
    
//     const upload = multer({ storage });
    
//     // Phục vụ tệp tĩnh từ thư mục 'public' (ví dụ: HTML, CSS, JavaScript)
//     // app.use(express.static('public'));

    
//     //Xác định một tuyến đường để xử lý việc tải lên tệp
//     app.post('/convert', upload.array('file', 5), (req, res) => {
//         // Dạng tệp đã tải lên nằm trong req.files
//         const uploadedFiles = req.files;
//         // console.log(req.files[0].filename);
//         if (!uploadedFiles || uploadedFiles.length === 0) {
//         return res.status(400).json({ message: 'No files uploaded.' });
//         }
    
//         // Xử lý tệp đã tải lên ở đây (ví dụ: lưu vào cơ sở dữ liệu, xử lý, vv.)
//         // Phản hồi thành công
//         res.status(200).json({ message: 'Files uploaded successfully.' });
//     });
// }