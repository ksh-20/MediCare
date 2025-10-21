const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const Caregiver = require('../models/Caregiver')
const { generateToken, generateRefreshToken, verifyRefreshToken } = require('../config/jwt')

// Register new caregiver
const register = async (req, res) => {
  try {
    const { firstName, lastName, email, phone, password } = req.body

    // Check if user already exists
    const existingUser = await Caregiver.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'User already exists with this email'
      })
    }

    // Create new caregiver
    const caregiver = new Caregiver({
      firstName,
      lastName,
      email,
      phone,
      password
    })

    await caregiver.save()

    // Generate tokens
    const token = generateToken({ userId: caregiver._id, email: caregiver.email })
    const refreshToken = generateRefreshToken({ userId: caregiver._id })

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: caregiver,
        token,
        refreshToken
      }
    })
  } catch (error) {
    console.error('Registration error:', error)
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message
    })
  }
}

// Login caregiver
const login = async (req, res) => {
  try {
    const { email, password } = req.body

    // Find user and include password for comparison
    const caregiver = await Caregiver.findOne({ email }).select('+password')
    
    if (!caregiver) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Check if account is active
    if (!caregiver.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      })
    }

    // Compare password
    const isPasswordValid = await caregiver.comparePassword(password)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      })
    }

    // Update last login
    caregiver.lastLogin = new Date()
    await caregiver.save()

    // Generate tokens
    const token = generateToken({ userId: caregiver._id, email: caregiver.email })
    const refreshToken = generateRefreshToken({ userId: caregiver._id })

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: caregiver,
        token,
        refreshToken
      }
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      message: 'Login failed',
      error: error.message
    })
  }
}

// Verify token
const verifyToken = async (req, res) => {
  try {
    const caregiver = await Caregiver.findById(req.user._id)
    
    if (!caregiver) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      })
    }

    res.json({
      success: true,
      data: {
        user: caregiver
      }
    })
  } catch (error) {
    console.error('Token verification error:', error)
    res.status(500).json({
      success: false,
      message: 'Token verification failed',
      error: error.message
    })
  }
}

// Refresh token
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      })
    }

    // Verify refresh token
    const decoded = verifyRefreshToken(refreshToken)
    
    // Get user
    const caregiver = await Caregiver.findById(decoded.userId)
    if (!caregiver || !caregiver.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      })
    }

    // Generate new tokens
    const newToken = generateToken({ userId: caregiver._id, email: caregiver.email })
    const newRefreshToken = generateRefreshToken({ userId: caregiver._id })

    res.json({
      success: true,
      data: {
        token: newToken,
        refreshToken: newRefreshToken
      }
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    res.status(401).json({
      success: false,
      message: 'Invalid refresh token',
      error: error.message
    })
  }
}

// Forgot password
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body

    const caregiver = await Caregiver.findOne({ email })
    if (!caregiver) {
      return res.status(404).json({
        success: false,
        message: 'User not found with this email'
      })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex')
    caregiver.resetPasswordToken = resetToken
    caregiver.resetPasswordExpires = Date.now() + 3600000 // 1 hour

    await caregiver.save()

    // TODO: Send email with reset token
    console.log('Reset token:', resetToken)

    res.json({
      success: true,
      message: 'Password reset instructions sent to your email',
      resetToken // Remove this in production
    })
  } catch (error) {
    console.error('Forgot password error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to process forgot password request',
      error: error.message
    })
  }
}

// Reset password
const resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body

    const caregiver = await Caregiver.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    })

    if (!caregiver) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired reset token'
      })
    }

    // Update password
    caregiver.password = password
    caregiver.resetPasswordToken = undefined
    caregiver.resetPasswordExpires = undefined

    await caregiver.save()

    res.json({
      success: true,
      message: 'Password reset successfully'
    })
  } catch (error) {
    console.error('Reset password error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to reset password',
      error: error.message
    })
  }
}

// Change password
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const caregiverId = req.user._id

    const caregiver = await Caregiver.findById(caregiverId).select('+password')
    
    // Verify current password
    const isCurrentPasswordValid = await caregiver.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: 'Current password is incorrect'
      })
    }

    // Update password
    caregiver.password = newPassword
    await caregiver.save()

    res.json({
      success: true,
      message: 'Password changed successfully'
    })
  } catch (error) {
    console.error('Change password error:', error)
    res.status(500).json({
      success: false,
      message: 'Failed to change password',
      error: error.message
    })
  }
}

// Logout
const logout = async (req, res) => {
  try {
    // In a more sophisticated implementation, you might want to blacklist the token
    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('Logout error:', error)
    res.status(500).json({
      success: false,
      message: 'Logout failed',
      error: error.message
    })
  }
}

module.exports = {
  register,
  login,
  verifyToken,
  refreshToken,
  forgotPassword,
  resetPassword,
  changePassword,
  logout
}
