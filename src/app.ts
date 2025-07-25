import express from 'express';
import { globalErrorHandler } from './common/middlewares/globalErrorHandler';
import categoryRouter from './category/category-router';
import cookieParser from 'cookie-parser';
import ProductRouter from './product/product-router';
import ToppingsRouter from './toppings/topping-router';

const app = express();

// Middleware
app.use(express.json()); // Parse JSON request bodies

app.use(cookieParser());

// Define your routes and application logic here
// Define a route
app.get('/', (req, res) => {
    res.send('Welcome to catalog service');
});

app.use('/categories', categoryRouter);
app.use('/products', ProductRouter);
app.use('/toppings', ToppingsRouter);

// Global Error Handler - This should be the last middleware in the chain
// It handles errors thrown by other middlewares
app.use(globalErrorHandler);

export default app;
