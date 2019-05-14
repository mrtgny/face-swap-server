const express = require("express");
const logger = require("morgan");
const bodyParser = require("body-parser");
const { exec } = require('child_process');
const fs = require('fs');

const app = express();

app.use(logger("dev"));
app.use(bodyParser.urlencoded({ extended: false, limit: '50mb' }));

app.post("/api/faceSwap", (req, res) => {
    const { src, dest } = req.body;
    console.log("request came");
    //console.log("src", src)
    //console.log("dest", dest)
    var srcImg = "data:image/jpg;base64," + src;
    var destImg = "data:image/jpg;base64," + dest;
    // strip off the data: url prefix to get just the base64-encoded bytes
    var data = srcImg.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');
    fs.writeFile('./faceSwapPython/imgs/src.jpg', buf);

    var data = destImg.replace(/^data:image\/\w+;base64,/, "");
    var buf = new Buffer(data, 'base64');
    fs.writeFile('./faceSwapPython/imgs/dest.jpg', buf);
    //python main.py --src src.jpg --dst dest.jpg --out output.jpg --correct_color
    exec(`cd faceSwapPython; ./faceswap.sh;cd ..`, (err, stdout, stderr) => {
        if (err) {
            console.log(`err: ${err}`);
            // node couldn't execute the command
            return;
        }

        // the *entire* stdout and stderr (buffered)
        console.log(`stdout: ${stdout}`);
        console.log(`stderr: ${stderr}`);

        let buf = fs.readFileSync("./faceSwapPython/results/output_src_dest.jpg").toString("base64");
        if (stdout) {
            res.status(200).send({
                success: 0,
                target:stdout
            })
        } else {
            res.status(200).send({
                success: 1,
                data: buf.toString()
            })
        }

    });
}
);

module.exports = app;
