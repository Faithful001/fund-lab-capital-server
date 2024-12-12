import express from 'express';
import { UserInterface } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: Partial<UserInterface>;
    }
  }
}
