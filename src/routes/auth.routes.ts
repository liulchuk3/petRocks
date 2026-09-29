import { Router } from 'express';
import { register, login, refresh, logout, forgotPassword, showResetForm, resetPassword } from '../controllers/auth.controller.js';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.post('/refresh', refresh);
router.post('/logout', logout);

router.post('/forgot-password', forgotPassword);           // 1. надсилає email
router.get('/set-password-form/:token', showResetForm); // 2. перевіряє токен і повертає форму
router.post('/reset-password/:token', resetPassword);      // 3. приймає новий пароль

export default router;