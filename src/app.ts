import express from 'express';
import { globalErrorHandler } from './common/middlewares/globalErrorHandler';
const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies

// Define your routes and application logic here
// Define a route
app.get('/', (req, res) => {
    res.send('Welcome to catalog service');
});

// Global Error Handler - This should be the last middleware in the chain
// It handles errors thrown by other middlewares
app.use(globalErrorHandler);

export default app;
