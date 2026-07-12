import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-assetflow-key-phrase';

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access Denied: Missing authorization headers.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access Denied: Token value is missing.' });
  }

  try {
    const verified = jwt.verify(token, JWT_SECRET);
    req.user = verified; // verified holds uid, role, name, email
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Access Forbidden: Invalid or expired credentials token.' });
  }
};
