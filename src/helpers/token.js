import jwt from 'jsonwebtoken'

export async function generateTokens(payload) {
  try {
    const accessToken = jwt.sign(payload, process.env.ACCESS_TOKEN_SECRET, {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRATION,
    })
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRATION,
    })
    return {
      accessToken,
      refreshToken,
    }
  } catch (err) {
    throw err
  }
}
