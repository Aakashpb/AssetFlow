# MongoDB Backend Migration Checklist

- [x] Install `mongoose` and uninstall `sequelize`/`mysql2` on backend
- [x] Configure `server/.env` with `MONGODB_URI` connection string
- [x] Rewrite `server/config/db.js` to connect via Mongoose
- [x] Implement Mongoose Schemas in `server/models/`
- [x] Update MVC Controllers to execute Mongoose queries
- [x] Update `server/server.js` database initialization and seeding scripts
- [x] Execute Jest tests and perform client compilation verify checks
