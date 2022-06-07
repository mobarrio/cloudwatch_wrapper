const winston = require('winston');
const {format} = require('winston');
const timezoned = () => {
    return new Date().toLocaleString('en-US', {
        timeZone: 'Europe/Madrid'
    });
}

const logger = winston.createLogger({
    level: process.env.LOG_LEVEL,
    format: format.combine(
        format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS -' }),
        format.splat(),
        format.printf(i => `${i.timestamp} [${i.level}] ${i.message}`)
    ),
    transports: [
        new winston.transports.Console()
    ]
});

module.exports = logger;
