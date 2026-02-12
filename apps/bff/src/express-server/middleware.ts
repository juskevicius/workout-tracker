import type { Request, Response, NextFunction } from 'express';

export const checkClientOrigin = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (`${req.headers.origin}/` === process.env.CLIENT_ORIGIN) {
    next();
  } else {
    res.status(403).send('Access denied');
  }
};
