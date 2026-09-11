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

let poolPromise: Promise<sql.ConnectionPool> | null = null;

export async function getDbConnection(): Promise<sql.ConnectionPool> {
  if (poolPromise) {
    return poolPromise;
  }

  poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then((pool) => {
      console.log('Connected to SQL Server successfully');
      return pool;
    })
    .catch((err) => {
      console.error('SQL Server connection failed: ', err);
      poolPromise = null;
      throw err;
    });

  return poolPromise;
}

export { sql };
