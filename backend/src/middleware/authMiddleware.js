const jwt = require('jsonwebtoken')
const { verifyToken } = require('../config/jwt')
const Caregiver = require('../models/Caregiver')

const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1] // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access token required'
      })
    }

    // Verify token
    const decoded = verifyToken(token)
    
    // Get user from database
    const user = await Caregiver.findById(decoded.userId).select('-password')
    
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid token - user not found'
      })
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Account is deactivated'
      })
    }

    // Add user to request object
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token'
      })
    }
    
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired'
      })
    }

    console.error('Auth middleware error:', error)
    return res.status(500).json({
      success: false,
      message: 'Authentication error'
    })
  }
}

const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization']
    const token = authHeader && authHeader.split(' ')[1]

    if (token) {
      const decoded = verifyToken(token)
      const user = await Caregiver.findById(decoded.userId).select('-password')
      
      if (user && user.isActive) {
        req.user = user
      }
    }
    
    next()
  } catch (error) {
    // Continue without authentication for optional auth
    next()
  }
}

const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required'
      })
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Insufficient permissions'
      })
    }

    next()
  }
}

const requireOwnership = (resourceModel, resourceIdParam = 'id') => {
  return async (req, res, next) => {
    try {
      const resourceId = req.params[resourceIdParam]
      const resource = await resourceModel.findById(resourceId)

      if (!resource) {
        return res.status(404).json({
          success: false,
          message: 'Resource not found'
        })
      }

      // Check if user owns the resource or is admin
      if (resource.caregiver && resource.caregiver.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied - resource belongs to another user'
        })
      }

      req.resource = resource
      next()
    } catch (error) {
      console.error('Ownership middleware error:', error)
      return res.status(500).json({
        success: false,
        message: 'Error checking resource ownership'
      })
    }
  }
}

module.exports = {
  authenticateToken,
  optionalAuth,
  requireRole,
  requireOwnership
}
