import config from 'config';
import logger from './config/logger';
import app from './app';
import initDb from './config/db';

const startServer = async () => {
    const PORT: number = config.get('server.port') || 6601;
    try {
        await initDb();
        logger.info('Connected to database');

        app.listen(PORT, () => logger.info(`Listening on port ${PORT}`));
    } catch (err) {
        if (err instanceof Error) {
            logger.error(err.message);
            setTimeout(() => {
                // as logger work asynchronously thats why we use setTimeout
                process.exit(1); // Exit the process with error code if error came from db as db errors are fatal.
            }, 1000);
        }
    }
};

void startServer();
