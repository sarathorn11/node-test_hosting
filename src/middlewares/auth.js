import jwt from 'jsonwebtoken'

export function verifyToken(req, res, next) {
  try {
    if (req.url === '/auth/login' || req.url === '/auth/refresh-token') return next()

    const token = req.headers.authorization?.split(' ')[1]
    if (!token) {
      return res.status(403).json({ message: 'No token provided!' })
    }
    const user = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET)
    req.user = user
    next()
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ message: 'Invalid token!' })
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token has expired!' })
    } else {
      return res.status(500).json({ message: 'Internal server error!' })
    }
  }
}
