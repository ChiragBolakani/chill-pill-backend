const ctrl = require('./controllers/controllers');

const app = (req, res)=>{
    const URL = req.url;

    // return invalid response incase of all requests other than GET
    if (req.method !== 'GET') {
        ctrl.forInvalidMethod(req, res);
    }

    // Handler to serve mp3
    if (URL.split('.')[1] === 'mp3') {
        ctrl.forAudio(req, res);
    }
}

module.exports = app;   