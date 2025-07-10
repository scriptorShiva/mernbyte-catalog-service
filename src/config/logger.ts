import winston from 'winston';

const logger = winston.createLogger({
    level: 'info', // Minimum log level
    defaultMeta: {
        serviceName: 'catalog-service', // Service name or any default metadata
    },
    transports: [
        new winston.transports.File({
            dirname: 'logs',
            filename: 'combined.log',
            level: 'info',
            silent: process.env.NODE_ENV === 'development', // Disable logs in the 'developement' environment
        }),
        new winston.transports.File({
            dirname: 'logs',
            filename: 'error.log',
            level: 'error',
            silent: process.env.NODE_ENV === 'test',
        }),
        new winston.transports.Console({
            level: 'info',
            format: winston.format.combine(
                winston.format.timestamp(),
                winston.format.json(),
            ),
        }),
    ],
});

export default logger;
