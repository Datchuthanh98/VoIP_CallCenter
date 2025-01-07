import express from 'express';
import { ESL } from 'switch-esl';
import esl from 'modesl';
import { v4 as uuidv4 } from 'uuid';
import fs from "fs/promises";
import path from "path";


const app = express();
const PORT = 3000;

// Middleware để parse JSON body
app.use(express.json());

// Kết nối đến FreeSWITCH Event Socket
const connection = { host: '192.168.186.137', port: 8021 };
const reconnectOptions = {
    reconnect: true,
    interval: 5000,
    maxAttemtps: 10
};

const password = 'ClueCon';

//BROADCAST EVENT
const eslClientOutbound = new ESL({ connection, password, reconnectOptions });
eslClientOutbound.connect()
    .then(() => {
        console.log('EslClientOutbound Connected to FreeSWITCH ');
    })
    .catch(error => {
        console.error('Failed to connect to FreeSWITCH:', error);
    });

//SEND COMMAND
const eslClientInbound = new esl.Connection(connection.host, connection.port, password, function () {
    console.log('EslClientInbound Connected to FreeSWITCH ');
});


// eslClientOutbound.addEventListener('ALL', (event) => {
//     console.log("Event: ",event )
// });

//Tier 0
// eslClientOutbound.addEventListener('BACKGROUND_JOB', (event) => {
//     // console.log(`Kết quả từ job ${event['Job-UUID']}: \n`, event['_body']);
//     console.log(event)
// });


//Tier 1

// eslClientOutbound.addEventListener('CHANNEL_CREATE', (event) => {
//     console.log(event);
// })

// eslClientOutbound.addEventListener('CHANNEL_DESTROY', (event) => {
//     console.log(event);
// })

// eslClientOutbound.addEventListener('RECORD_START', (event) => {
//     console.log(event);
// })

// eslClientOutbound.addEventListener('RECORD_STOP', (event) => {
//     console.log(event);
// })

// eslClientOutbound.addEventListener('PLAYBACK_START', (event) => {
//     console.log(event);
// })

// eslClientOutbound.addEventListener('PLAYBACK_STOP', (event) => {
//     console.log(event);
// })

// eslClientOutbound.addEventListener('CHANNEL_HANGUP', (event) => {
//     console.log(event);
// })

// eslClientOutbound.addEventListener('CHANNEL_HANGUP_COMPLETE', (event) => {
//     console.log(event);
// })


//Tier 2
eslClientOutbound.addEventListener('CHANNEL_EXECUTE', (event) => {
    console.log(event);
})

eslClientOutbound.addEventListener('CHANNEL_PROGRESS', (event) => {
    console.log(event);
})

eslClientOutbound.addEventListener('CHANNEL_PROGRESS_MEDIA', (event) => {
    console.log(event);
})

//Tier 3
// eslClientOutbound.addEventListener('RELOADXML', (event) => {
//     console.log(event);
// })

// eslClientOutbound.addEventListener('SHUTDOWN', (event) => {
//     console.log(event);
// })



// BGAPI thường dùng cho các tác vụ mất nhiều thời gian hoặc yêu cầu thực hiện song song. 
//Ví dụ: gọi điện, gửi SMS, hoặc thực hiện một thao tác lớn mà không cần chờ phản hồi ngay lập tức.
app.post('/api/send-command', async (req, res) => {
    const { command, args } = req.body;

    // Kiểm tra lệnh có được cung cấp không
    if (!command) {
        return res.status(400).json({ error: 'Command is required' });
    }

    try {
        // Gửi lệnh qua Event Socket và chờ kết quả trả về
        const response = await eslClientOutbound.api(`${command}`);
        console.log("response : ", response)
        res.json({ response });
    } catch (error) {
        res.status(500).json({ "messge": 'Failed to execute command', error });
    }
});

app.post('/api/send-command-background', (req, res) => {
    const { command, args } = req.body;

    // Kiểm tra lệnh có được cung cấp không
    if (!command) {
        return res.status(400).json({ error: 'Command is required' });
    }

    try {
        const jobId = uuidv4();
        eslClientInbound.bgapi(`${command}`, "", jobId);
        //       console.log(eslClientOutbound.bgapi(`${command}`))
        res.json({
            message: "OK",
            jobId: jobId
        });

    } catch (error) {
        res.status(500).json({ "messge": 'Failed to execute command', error });
    }
});

// API trả về dữ liệu extension
app.post("/api/getExtension", async (req, res) => {

    console.log("hehe: " , res)
    console.log("Get Extension: ", new Date());
    const filePath = path.resolve("directory1.xml"); 
    const data = await fs.readFile(filePath, "utf8");
    res.setHeader('Content-Type', 'application/xml'); // Content type is XML
    res.send(data); // Send the XML response
});

// API trả về dữ liệu diaplan
app.post("/api/getDiaplan", async (req, res) => {
    console.log("huhu: " , res)
    console.log("Get Diaplan: ", new Date());
    const filePath = path.resolve("diaplan1.xml"); 
    const data = await fs.readFile(filePath, "utf8");
    res.setHeader('Content-Type', 'application/xml'); // Content type is XML
    res.send(data); // Send the XML response
});


app.post("/api/createXMLFile", async (req, res) => {
    const { nameFile, pathFile, content } = req.body;

    if (!nameFile || !pathFile || !content) {
        return res.status(400).send({ error: 'Missing nameFile, pathFile, or content in request body' });
    }

    // Đường dẫn đầy đủ của file
    const filePath = path.join(pathFile, nameFile);
    let backupContent = null; // Lưu nội dung cũ (nếu có) để rollback
    let isNewFile = false;    // Đánh dấu file mới tạo

    try {
        // Kiểm tra thư mục pathFile có tồn tại không, nếu không thì tạo
        await fs.mkdir(pathFile, { recursive: true });

        // Kiểm tra file có tồn tại hay không
        try {
            // Nếu file tồn tại, đọc nội dung cũ để backup
            backupContent = await fs.readFile(filePath, "utf8");
            console.log("File exists, backing up content...");
        } catch (err) {
            // Nếu file không tồn tại, đánh dấu là file mới
            console.log("File does not exist, creating new file...");
            isNewFile = true;
        }

        // Ghi nội dung mới vào file (ghi đè nếu đã tồn tại)
        await fs.writeFile(filePath, content, "utf8");

        // Reload lại cấu hình FreeSWITCH
        await eslClientOutbound.api(`reloadxml`);
        console.log("FreeSWITCH XML reloaded successfully.");

        return res.status(200).send({ message: 'File saved or updated successfully', filePath });

    } catch (error) {
        console.error("Error handling file or reloading FreeSWITCH:", error);

        // Xử lý rollback nếu xảy ra lỗi
        if (isNewFile) {
            // Nếu là file mới, xóa file đã tạo
            try {
                await fs.unlink(filePath);
                console.log("New file creation failed, file deleted.");
            } catch (unlinkError) {
                console.error("Failed to delete new file:", unlinkError);
            }
        } else if (backupContent !== null) {
            // Nếu là file cũ, khôi phục nội dung backup
            try {
                await fs.writeFile(filePath, backupContent, "utf8");
                console.log("File update failed, content reverted to previous state.");
            } catch (revertError) {
                console.error("Failed to revert file to previous state:", revertError);
            }
        }

        return res.status(500).send({ error: "Failed to handle file or reload FreeSWITCH", details: error.message });
    }
});


app.get("/api/testcreateXMLFile", async (req, res) => {
    const nameFile = "test.xml" ;
    const pathFile = "/etc/freeswitch";
    const content = "Demo data xml freeswitch"
    if (!nameFile || !pathFile || !content) {
        return res.status(400).send({ error: 'Missing nameFile, pathFile, or content in request body' });
    }

    // Đường dẫn đầy đủ của file
    const filePath = path.join(pathFile, nameFile);
    let backupContent = null; // Lưu nội dung cũ (nếu có) để rollback
    let isNewFile = false;    // Đánh dấu file mới tạo

    try {
        // Kiểm tra thư mục pathFile có tồn tại không, nếu không thì tạo
        await fs.mkdir(pathFile, { recursive: true });

        // Kiểm tra file có tồn tại hay không
        try {
            // Nếu file tồn tại, đọc nội dung cũ để backup
            backupContent = await fs.readFile(filePath, "utf8");
            console.log("File exists, backing up content...");
        } catch (err) {
            // Nếu file không tồn tại, đánh dấu là file mới
            console.log("File does not exist, creating new file...");
            isNewFile = true;
        }

        // Ghi nội dung mới vào file (ghi đè nếu đã tồn tại)
        await fs.writeFile(filePath, content, "utf8");

        // Reload lại cấu hình FreeSWITCH
        await eslClientOutbound.api(`reloadxml`);
        console.log("FreeSWITCH XML reloaded successfully.");

        return res.status(200).send({ message: 'File saved or updated successfully', filePath });

    } catch (error) {
        console.error("Error handling file or reloading FreeSWITCH:", error);
        return res.status(500).send({ error: "Failed to handle file or reload FreeSWITCH", details: error.message });
    }
});



// Định nghĩa route gốc
app.get('/', (req, res) => {
    res.send('FreeSWITCH Event Socket Server is running!');
});

// Bắt đầu server Express
app.listen(PORT, "0.0.0.0", () => {
    console.log(`Express server listening on port ${PORT}`);
});


