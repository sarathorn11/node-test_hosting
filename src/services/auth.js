import bcrypt from 'bcryptjs'
import db from '../models/index.js'
import jwt from 'jsonwebtoken'
import { generateTokens } from '../helpers/token.js'
const { User, Role } = db

export async function login(req, res, next) {
  try {
    const { email, password } = req.body
    const user = await User.findOne({
      attributes: ['id', 'email', 'password'],
      where: { email },
      include: [
        {
          model: Role,
          as: 'role',
          attributes: ['id', 'name'],
        },
      ],
    })
    if (!user)
      return res
        .status(404)
        .json({ message: `User not found with email: ${email}` })
    if (!(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ message: 'Invalid password!' })
    }

    // Generate access token
    const payload = {
      id: user.id,
      role: user.role,
    }
    const { accessToken, refreshToken } = await generateTokens(payload)
    user.refresh_token = refreshToken
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    user.expired_date = new Date(decoded.exp * 1000)
    await user.save()
    return res.status(200).json({ accessToken, refreshToken, ...payload })
  } catch (err) {
    return res.status(401).json({ message: err.message })
  }
}

export async function renewToken(req, res) {
  try {
    const { refreshToken } = req.body
    if (!refreshToken)
      return res.status(401).json({ message: 'Refresh token is required' })
    const user = await User.findOne({
      attributes: ['refresh_token', 'expired_date'],
      where: { refresh_token: refreshToken },
    })
    if (!user) return res.status(401).json({ message: 'Invalid refresh token' })

    // Check if the refresh token has expired (if you have an expiry field in DB)
    if (new Date() > new Date(user.expired_date)) {
      return res.status(403).json({ message: 'Refresh token expired' })
    }

    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET)
    // Generate new tokens
    const payload = { id: decoded.id, role: decoded.role }
    const { accessToken } = await generateTokens(payload)
    return res.status(200).json({
      accessToken,
      refreshToken,
    })
  } catch (err) {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(403).json({ message: err.message })
    }
    return res.status(500).json({ message: 'Internal server error' })
  }
}

export async function logout(req, res) {
  const { id } = req.body
  const user = await User.findByPk(id)

  if (!user) return res.status(404).json({ message: 'User not found' })
  await user.update({ refresh_token: null, expired_date: null })
  return res.status(204).json({ message: 'Logged out successfully' })
}
