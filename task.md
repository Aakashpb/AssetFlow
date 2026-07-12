# Firebase Integration Checklist

- [x] Install dependencies (`firebase` on frontend, `jwks-rsa` on backend)
- [x] Create `src/config/firebase.js` with Firebase configuration parameters
- [x] Modify `src/context/AuthContext.jsx` to wire sign-in/register/SSO with Firebase Auth
- [x] Update backend `authMiddleware.js` to fetch and verify Google certificates signatures
- [x] Update backend `authController.js` to handle dynamic user profile syncing with MySQL
- [x] Execute tests and compile verify checkouts
