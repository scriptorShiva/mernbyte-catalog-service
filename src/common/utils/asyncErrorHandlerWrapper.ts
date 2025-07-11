import express, { NextFunction } from 'express';
import createHttpError from 'http-errors';
import { RequestHandler } from 'express';

// error handler wrapper way to handle errors
export const asyncErrorHandlerWrapper = (requestHandler: RequestHandler) => {
    return async (
        req: express.Request,
        res: express.Response,
        next: NextFunction,
    ) => {
        Promise.resolve(requestHandler(req, res, next)).catch((err) => {
            if (err instanceof Error) {
                return next(err);
            }
            return next(createHttpError(500, 'Internal Server Error'));
        });
    };
};
