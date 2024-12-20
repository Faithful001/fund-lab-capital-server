import express from 'express';
import { AdminInterface, UserInterface } from '../types';

declare global {
  namespace Express {
    interface Request {
      user?: Partial<UserInterface>;
      admin?: Partial<AdminInterface>;
    }
  }
}
