const fs = require('fs')    
const path = require('node:path');
const querystring = require('node:querystring'); 

const ctrl = {}

ctrl.forInvalidMethod = function(req, res){
    res.statusCode = 405;
    res.writeHead(405, {
        "Content-Type" : "application/json",
        "Allow" : "GET"
    });
    res.end(JSON.stringify({
        "status" : "error",
        "statusCode" : 405,
        "error":{
            "message" : "This method is not allowed"
        }
    }));
}

ctrl.forAudio = function(req, res){
    let ext = req.url.split('.')[1];
    const audioPath = path.join(process.env.MP3_DIR, querystring.unescape(req.url))

    fs.stat(audioPath, (err, data)=>{
        if(err){
            res.writeHead(404, {
                "Content-Type" : "application/json"
            });
            res.end(JSON.stringify({
                "status" : "error",
                "statusCode" : 404,
                "error":{
                    "message" : "Could not find mp3 file"
                }
            }));
        }else{
            if(req.headers['range']){
                let range = req.headers['range']

                var array = range.replace('bytes=', "").split("-");

                //get the starting bytes
                var start = parseInt(array[0], 10);
                
                // We check if there is and end, if not, we just send the total size of the file
                // Total size is total -1, because we start counting from the 0.
                // data.size returns the size, "data" is the object that fs.stat outputs.
                var end = array[1] ? parseInt(array[1], 10) : data.size - 1;

                // chunk size
                var chunk = 1024 * 500;

                res.writeHead(206, {
                    "Accept-Ranges" : "bytes",
                    "Content-Range" : "bytes " + start + "-" + end + "/" + data.size,
                    "Content-Length" : chunk,
                    "Content-Type": mimeNames['.' + ext],
                    "Cache-Control" : "no-cache"
                })

                let readable = fs.createReadStream(audioPath, {start, end})

                if(readable==null){
                    res.end();
                }else{
                    readable.on('open', ()=>{
                        readable.pipe(res)
                    })

                    readable.on('error', (err)=>{
                        res.writeHead(500, {
                            "Content-Type" : "application/json"
                        });
                        res.end(JSON.stringify({
                            "status" : "error",
                            "statusCode" : 500,
                            "error":{
                                "message" : `could not serve partial content for ranges ${start} to ${end}`
                            }
                        }));
                    })
                }
            }
        }
    })
}

var mimeNames = {
    '.css': 'text/css',
    '.html': 'text/html',
    '.js': 'application/javascript',
    '.mp3': 'audio/mpeg',
    '.mp4': 'video/mp4',
    '.ogg': 'application/ogg',
    '.ogv': 'video/ogg',
    '.oga': 'audio/ogg',
    '.txt': 'text/plain',
    '.wav': 'audio/x-wav',
    '.webm': 'video/webm'
};

module.exports = ctrl;