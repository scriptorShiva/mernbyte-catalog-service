import config from 'config';
import logger from './config/logger';
import app from './app';

const startServer = async () => {
    const PORT: number = config.get('server.port') || 6601;
    try {
        app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
            setTimeout(() => {
                // as logger work asynchronously thats why we use setTimeout
                process.exit(1); // Exit the process with error code
            }, 1000);
        }
    }
};

startServer();
