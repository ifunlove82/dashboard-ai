const sql = require('mssql');
const fs = require('fs');
const path = require('path');

// Helper to load env variables from .env.local if not already loaded
function loadEnv() {
  const envPath = path.join(__dirname, '../.env.local');
  if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith('#')) {
        const parts = trimmed.split('=');
        if (parts.length >= 2) {
          const key = parts[0].trim();
          const val = parts.slice(1).join('=').trim().replace(/(^["']|["']$)/g, '');
          if (!process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    });
  }
}

loadEnv();

const dbConfig = {
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

async function seedTargets() {
    let pool;
    try {
        pool = await sql.connect(dbConfig);
        console.log('Connected to DB. Creating and seeding targets...');
        
        // Execute table creation
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='rpTargets' and xtype='U')
            BEGIN
                CREATE TABLE rpTargets (
                    ID INT IDENTITY(1,1) PRIMARY KEY,
                    Ma_HQ NVARCHAR(50),
                    Thang INT,
                    Nam INT,
                    ChiTieu_Thu DECIMAL(18,2),
                    ChiTieu_ToKhai INT,
                    ChiTieu_KimNgach DECIMAL(18,2)
                )
            END
        `);

        // Insert mock target data for 2024
        await pool.request().query(`
            INSERT INTO rpTargets (Ma_HQ, Thang, Nam, ChiTieu_Thu, ChiTieu_ToKhai, ChiTieu_KimNgach)
            VALUES 
            ('HQHN', 9, 2024, 15000000000.00, 5000, 100000000.00),
            ('HQHP', 9, 2024, 20000000000.00, 8000, 200000000.00)
        `);
        console.log('Targets seeded successfully!');
    } catch (err) {
        console.error('Seed failed:', err);
        process.exit(1);
    } finally {
        if (pool) pool.close();
    }
}

seedTargets();
