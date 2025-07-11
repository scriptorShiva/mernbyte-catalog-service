import mongoose from 'mongoose';
import config from 'config';

const initDb = async () => {
    await mongoose.connect(config.get('database.url'));
};

export default initDb;
