export const authorizeRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(403).json({ error: 'Access Forbidden: Role verification scope is missing.' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ error: `Access Forbidden: Required role scope is missing. Allowed roles: ${allowedRoles.join(', ')}` });
    }

    next();
  };
};
