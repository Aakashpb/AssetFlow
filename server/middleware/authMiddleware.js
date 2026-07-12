import jwt from 'jsonwebtoken';
import axios from 'axios';

const JWT_SECRET = process.env.JWT_SECRET || 'default-jwt-secret-assetflow-key-phrase';
const FIREBASE_PROJECT_ID = 'my-project-66efd';

let cachedCertificates = null;
let cacheExpiry = 0;

const getGoogleCertificates = async () => {
  const now = Date.now();
  if (cachedCertificates && now < cacheExpiry) {
    return cachedCertificates;
  }
  try {
    const { data } = await axios.get('https://www.googleapis.com/robot/v1/metadata/x509/securetoken@system.gserviceaccount.com');
    cachedCertificates = data;
    cacheExpiry = now + 60 * 60 * 1000; // Cache for 1 hour
    return cachedCertificates;
  } catch (error) {
    console.error('Failed to fetch Google SSO signing certs:', error.message);
    throw error;
  }
};

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    return res.status(401).json({ error: 'Access Denied: Missing authorization headers.' });
  }

  const token = authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: 'Access Denied: Token value is missing.' });
  }

  // 1. Jest unit testing/Local secret bypass fallback
  if (process.env.NODE_ENV === 'test' || token.length < 150) {
    try {
      const verified = jwt.verify(token, JWT_SECRET);
      req.user = verified;
      return next();
    } catch (err) {
      // Continue to Firebase token validation
    }
  }

  // 2. Custom native Firebase ID Token Verification
  try {
    const decodedToken = jwt.decode(token, { complete: true });
    if (!decodedToken || !decodedToken.header || !decodedToken.header.kid) {
      return res.status(403).json({ error: 'Access Forbidden: Invalid token structure.' });
    }

    const certs = await getGoogleCertificates();
    const cert = certs[decodedToken.header.kid];
    if (!cert) {
      return res.status(403).json({ error: 'Access Forbidden: Signing certificate expired.' });
    }

    const decoded = jwt.verify(token, cert, {
      audience: FIREBASE_PROJECT_ID,
      issuer: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
      algorithms: ['RS256']
    });

    req.user = {
      uid: decoded.user_id || decoded.sub,
      email: decoded.email,
      name: decoded.name || decoded.email.split('@')[0],
      role: 'Employee' // Default fallback
    };
    next();
  } catch (err) {
    console.error('Firebase JWT Verification Failed:', err.message);
    return res.status(403).json({ error: 'Access Forbidden: Invalid or expired credentials token.' });
  }
};
