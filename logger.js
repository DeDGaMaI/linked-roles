const bunyan = require("bunyan")

function reqSerializer(req) {
    return {
        method: req.method,
        url: req.url,
        headers: req.headers
    };
}

let logger = bunyan.createLogger({
    name: "myLogs",
    serializers: {
        req: reqSerializer
    },
    streams: [
        {
            level: 'info',
            type: "rotating-file",
            path: "./logs/info.log",
            period: "1d",
        },
        {
            level: 'error',
            type: "rotating-file",
            path: "./logs/error.log",
            period: "1d",
        }]
});

module.exports = logger;