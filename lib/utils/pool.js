const { Pool } = require('pg');

const { DATABASE_URL, PGSSLMODE } = process.env;
const config = {};
if (DATABASE_URL) config.connectionString = DATABASE_URL;
if (PGSSLMODE) config.ssl = { rejectUnauthorized: false };

const pool = new Pool(config);

let hasLogged = false;

// eslint-disable-next-line no-console
pool.on('connect', ({ database, host, port }) => {
  if (!hasLogged) {
    // eslint-disable-next-line no-console
    console.log('🐘 Postgres connected to', `${database} on ${host}:${port}`);
    hasLogged = true;
  }
});

module.exports = pool;
