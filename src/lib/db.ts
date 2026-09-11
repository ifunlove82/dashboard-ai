import sql from 'mssql';

const config: sql.config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'VNACCS_REPORT',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  },
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
};

interface GlobalWithSql {
  _sqlPool?: sql.ConnectionPool | null;
  _sqlPromise?: Promise<sql.ConnectionPool> | null;
}

const g = globalThis as unknown as GlobalWithSql;

export async function getDbConnection(): Promise<sql.ConnectionPool> {
  if (g._sqlPool && g._sqlPool.connected) {
    return g._sqlPool;
  }

  if (g._sqlPromise) {
    return g._sqlPromise;
  }

  g._sqlPromise = new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
      console.log('Connected to SQL Server successfully');
      g._sqlPool = pool;
      pool.on('error', (err) => {
        console.error('SQL Server pool error:', err);
        g._sqlPool = null;
        g._sqlPromise = null;
      });
      return pool;
    })
    .catch((err) => {
      console.error('SQL Server connection failed: ', err);
      g._sqlPool = null;
      g._sqlPromise = null;
      throw err;
    });

  return g._sqlPromise;
}

export { sql };
