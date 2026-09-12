### Task 1: Database Setup for Targets (Budget vs Actual)

**Files:**
- Create: `Table_Targets.sql`
- Create: `scripts/seed-targets.js`

**Interfaces:**
- Produces: `rpTargets` table in the database with columns for unit, month, year, and target metrics.

- [ ] **Step 1: Write the SQL schema**
Create `Table_Targets.sql` with the following content:
```sql
CREATE TABLE rpTargets (
    ID INT IDENTITY(1,1) PRIMARY KEY,
    Ma_HQ NVARCHAR(50),
    Thang INT,
    Nam INT,
    ChiTieu_Thu DECIMAL(18,2),
    ChiTieu_ToKhai INT,
    ChiTieu_KimNgach DECIMAL(18,2)
);
```

- [ ] **Step 2: Write the database seed script**
Create `scripts/seed-targets.js` with the following content:
```javascript
import sql from 'mssql';
import { dbConfig } from '../src/lib/db.js'; // Adjust path if necessary, assuming ESM or change to require if CJS

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
```

- [ ] **Step 3: Run the seed script**
Run: `node scripts/seed-targets.js`
Expected: Output showing "Targets seeded successfully!"

- [ ] **Step 4: Commit**
```bash
git add Table_Targets.sql scripts/seed-targets.js
git commit -m "feat(db): add targets table and seed script for budget vs actual"
```
