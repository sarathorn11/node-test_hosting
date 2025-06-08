export function authorize(roles = []) {
  return (req, res, next) => {
    try {
      const { user } = req
      if (roles.includes(user.role.name)) {
        next()
      } else {
        res.status(403).json({ message: 'Access Denied' })
      }
    } catch (error) {
      return res
        .status(500)
        .json({ message: 'Internal server error!', error: error.message })
    }
  }
}
