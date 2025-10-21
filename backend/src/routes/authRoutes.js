const express = require('express')
const {
  register,
  login,
  verifyToken,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  logout
} = require('../controllers/authController')
const { validateRegister, validateLogin } = require('../middleware/validator')
const { authenticateToken } = require('../middleware/authMiddleware')

const router = express.Router()

// Public routes
router.post('/register', validateRegister, register)
router.post('/login', validateLogin, login)
router.post('/forgot-password', forgotPassword)
router.post('/reset-password', resetPassword)

// Protected routes
router.get('/verify', authenticateToken, verifyToken)
router.post('/refresh-token', refreshToken)
router.post('/change-password', authenticateToken, changePassword)
router.post('/logout', authenticateToken, logout)

module.exports = router
