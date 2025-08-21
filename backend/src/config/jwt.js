const jwt = require('jsonwebtoken');

// JWT Configuration constants
const JWT_CONFIG = {
  ACCESS_TOKEN: {
    SECRET: process.env.JWT_ACCESS_SECRET || 'your-access-secret-key',
    EXPIRES_IN: process.env.JWT_ACCESS_EXPIRES || '15m',
    ALGORITHM: 'HS256',
    ISSUER: 'mini-dashboard-app',
    AUDIENCE: 'dashboard-users'
  },
  REFRESH_TOKEN: {
    SECRET: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key',
    EXPIRES_IN: process.env.JWT_REFRESH_EXPIRES || '7d',
    ALGORITHM: 'HS256',
    ISSUER: 'mini-dashboard-app',
    AUDIENCE: 'dashboard-users'
  }
};

/**
 * Generate JWT Access Token
 * @param {Object} payload - Token payload (typically user info)
 * @param {Object} options - Additional options for token generation
 * @returns {string} - JWT token string
 */
const generateAccessToken = (payload, options = {}) => {
  try {
    const tokenPayload = {
      ...payload,
      type: 'access',
      iat: Math.floor(Date.now() / 1000) // Issued at time
    };

    const signOptions = {
      expiresIn: options.expiresIn || JWT_CONFIG.ACCESS_TOKEN.EXPIRES_IN,
      algorithm: JWT_CONFIG.ACCESS_TOKEN.ALGORITHM,
      issuer: JWT_CONFIG.ACCESS_TOKEN.ISSUER,
      audience: JWT_CONFIG.ACCESS_TOKEN.AUDIENCE,
      ...options
    };

    return jwt.sign(tokenPayload, JWT_CONFIG.ACCESS_TOKEN.SECRET, signOptions);
  } catch (error) {
    console.error('Error generating access token:', error);
    throw new Error('Token generation failed');
  }
};

/**
 * Generate JWT Refresh Token
 * @param {Object} payload - Token payload (typically user info)
 * @param {Object} options - Additional options for token generation
 * @returns {string} - JWT token string
 */
const generateRefreshToken = (payload, options = {}) => {
  try {
    const tokenPayload = {
      ...payload,
      type: 'refresh',
      iat: Math.floor(Date.now() / 1000) // Issued at time
    };

    const signOptions = {
      expiresIn: options.expiresIn || JWT_CONFIG.REFRESH_TOKEN.EXPIRES_IN,
      algorithm: JWT_CONFIG.REFRESH_TOKEN.ALGORITHM,
      issuer: JWT_CONFIG.REFRESH_TOKEN.ISSUER,
      audience: JWT_CONFIG.REFRESH_TOKEN.AUDIENCE,
      ...options
    };

    return jwt.sign(tokenPayload, JWT_CONFIG.REFRESH_TOKEN.SECRET, signOptions);
  } catch (error) {
    console.error('Error generating refresh token:', error);
    throw new Error('Token generation failed');
  }
};

/**
 * Verify JWT Access Token
 * @param {string} token - JWT token to verify
 * @param {Object} options - Additional options for verification
 * @returns {Object} - Decoded token payload
 */
const verifyAccessToken = (token, options = {}) => {
  try {
    const verifyOptions = {
      algorithm: JWT_CONFIG.ACCESS_TOKEN.ALGORITHM,
      issuer: JWT_CONFIG.ACCESS_TOKEN.ISSUER,
      audience: JWT_CONFIG.ACCESS_TOKEN.AUDIENCE,
      ...options
    };

    const decoded = jwt.verify(token, JWT_CONFIG.ACCESS_TOKEN.SECRET, verifyOptions);

    // Additional validation - ensure it's an access token
    if (decoded.type !== 'access') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    // Log the error but don't expose details for security
    console.error('Access token verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      const expiredError = new Error('Access token expired');
      expiredError.name = 'TokenExpiredError';
      expiredError.expiredAt = error.expiredAt;
      throw expiredError;
    }
    
    if (error.name === 'JsonWebTokenError') {
      const invalidError = new Error('Invalid access token');
      invalidError.name = 'JsonWebTokenError';
      throw invalidError;
    }
    
    throw error;
  }
};

/**
 * Verify JWT Refresh Token
 * @param {string} token - JWT token to verify
 * @param {Object} options - Additional options for verification
 * @returns {Object} - Decoded token payload
 */
const verifyRefreshToken = (token, options = {}) => {
  try {
    const verifyOptions = {
      algorithm: JWT_CONFIG.REFRESH_TOKEN.ALGORITHM,
      issuer: JWT_CONFIG.REFRESH_TOKEN.ISSUER,
      audience: JWT_CONFIG.REFRESH_TOKEN.AUDIENCE,
      ...options
    };

    const decoded = jwt.verify(token, JWT_CONFIG.REFRESH_TOKEN.SECRET, verifyOptions);

    // Additional validation - ensure it's a refresh token
    if (decoded.type !== 'refresh') {
      throw new Error('Invalid token type');
    }

    return decoded;
  } catch (error) {
    console.error('Refresh token verification failed:', error.message);
    
    if (error.name === 'TokenExpiredError') {
      const expiredError = new Error('Refresh token expired');
      expiredError.name = 'TokenExpiredError';
      expiredError.expiredAt = error.expiredAt;
      throw expiredError;
    }
    
    if (error.name === 'JsonWebTokenError') {
      const invalidError = new Error('Invalid refresh token');
      invalidError.name = 'JsonWebTokenError';
      throw invalidError;
    }
    
    throw error;
  }
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {string} token - JWT token to decode
 * @returns {Object} - Decoded token payload
 */
const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    console.error('Token decode failed:', error);
    return null;
  }
};

/**
 * Check if token is expired (without verification)
 * @param {string} token - JWT token to check
 * @returns {boolean} - True if token is expired
 */
const isTokenExpired = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return true;
    
    const currentTime = Math.floor(Date.now() / 1000);
    return decoded.exp < currentTime;
  } catch (error) {
    console.error('Token expiry check failed:', error);
    return true;
  }
};

/**
 * Get token expiry time
 * @param {string} token - JWT token
 * @returns {Date|null} - Expiry date or null if invalid
 */
const getTokenExpiry = (token) => {
  try {
    const decoded = jwt.decode(token);
    if (!decoded || !decoded.exp) return null;
    
    return new Date(decoded.exp * 1000);
  } catch (error) {
    console.error('Token expiry extraction failed:', error);
    return null;
  }
};

/**
 * Get time until token expires (in milliseconds)
 * @param {string} token - JWT token
 * @returns {number|null} - Milliseconds until expiry, null if invalid/expired
 */
const getTimeUntilExpiry = (token) => {
  try {
    const expiry = getTokenExpiry(token);
    if (!expiry) return null;
    
    const timeUntilExpiry = expiry.getTime() - Date.now();
    return timeUntilExpiry > 0 ? timeUntilExpiry : null;
  } catch (error) {
    console.error('Time until expiry calculation failed:', error);
    return null;
  }
};

/**
 * Create token pair (access + refresh)
 * @param {Object} payload - User payload for tokens
 * @param {Object} options - Token options
 * @returns {Object} - Object containing both tokens
 */
const createTokenPair = (payload, options = {}) => {
  try {
    const accessToken = generateAccessToken(payload, options.access);
    const refreshToken = generateRefreshToken(payload, options.refresh);
    
    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: JWT_CONFIG.ACCESS_TOKEN.EXPIRES_IN,
      accessTokenExpiry: getTokenExpiry(accessToken),
      refreshTokenExpiry: getTokenExpiry(refreshToken)
    };
  } catch (error) {
    console.error('Token pair creation failed:', error);
    throw new Error('Failed to create token pair');
  }
};

/**
 * Blacklist token (in a real app, you'd store this in Redis or database)
 * For now, we'll use a simple in-memory Set
 * @param {string} token - Token to blacklist
 */
const blacklistedTokens = new Set();

const blacklistToken = (token) => {
  try {
    blacklistedTokens.add(token);
    console.log('Token blacklisted successfully');
  } catch (error) {
    console.error('Token blacklisting failed:', error);
  }
};

/**
 * Check if token is blacklisted
 * @param {string} token - Token to check
 * @returns {boolean} - True if token is blacklisted
 */
const isTokenBlacklisted = (token) => {
  return blacklistedTokens.has(token);
};

/**
 * Clear expired tokens from blacklist (cleanup function)
 * This should be called periodically in production
 */
const clearExpiredBlacklistedTokens = () => {
  try {
    const tokensToRemove = [];
    
    blacklistedTokens.forEach(token => {
      if (isTokenExpired(token)) {
        tokensToRemove.push(token);
      }
    });
    
    tokensToRemove.forEach(token => {
      blacklistedTokens.delete(token);
    });
    
    console.log(`Cleared ${tokensToRemove.length} expired tokens from blacklist`);
  } catch (error) {
    console.error('Blacklist cleanup failed:', error);
  }
};

/**
 * Get JWT configuration for external use
 * @returns {Object} - JWT configuration object
 */
const getJWTConfig = () => {
  return {
    access: {
      expiresIn: JWT_CONFIG.ACCESS_TOKEN.EXPIRES_IN,
      algorithm: JWT_CONFIG.ACCESS_TOKEN.ALGORITHM,
      issuer: JWT_CONFIG.ACCESS_TOKEN.ISSUER,
      audience: JWT_CONFIG.ACCESS_TOKEN.AUDIENCE
    },
    refresh: {
      expiresIn: JWT_CONFIG.REFRESH_TOKEN.EXPIRES_IN,
      algorithm: JWT_CONFIG.REFRESH_TOKEN.ALGORITHM,
      issuer: JWT_CONFIG.REFRESH_TOKEN.ISSUER,
      audience: JWT_CONFIG.REFRESH_TOKEN.AUDIENCE
    }
  };
};

// Periodic cleanup of expired blacklisted tokens (every hour)
if (process.env.NODE_ENV === 'production') {
  setInterval(clearExpiredBlacklistedTokens, 60 * 60 * 1000); // 1 hour
}

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  decodeToken,
  isTokenExpired,
  getTokenExpiry,
  getTimeUntilExpiry,
  createTokenPair,
  blacklistToken,
  isTokenBlacklisted,
  clearExpiredBlacklistedTokens,
  getJWTConfig,
  JWT_CONFIG
};