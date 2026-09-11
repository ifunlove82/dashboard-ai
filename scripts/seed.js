const sql = require('mssql');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

// Simple helper to load env variables from .env.local
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
          const val = parts.slice(1).join('=').trim().replace(/(^"|"$|^'|'$)/g, '');
          process.env[key] = val;
        }
      }
    });
  }
}

loadEnv();

const config = {
  user: process.env.DB_USER || 'sa',
  password: process.env.DB_PASSWORD || '',
  server: process.env.DB_SERVER || 'localhost',
  database: process.env.DB_DATABASE || 'VNACCS_REPORT',
  port: parseInt(process.env.DB_PORT || '1433', 10),
  options: {
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_SERVER_CERTIFICATE === 'true',
  },
};

const ENTERPRISES = [
  { taxId: '0100793405', name: 'CÔNG TY TNHH SAMSUNG ELECTRONICS VIỆT NAM' },
  { taxId: '3600252879', name: 'CÔNG TY CỔ PHẦN THÉP HÒA PHÁT DUNG QUẤT' },
  { taxId: '0100101308', name: 'TỔNG CÔNG TY HÀNG KHÔNG VIỆT NAM - CTCP' },
  { taxId: '3500101112', name: 'LIÊN DOANH VIỆT - NGA VIETSOVPETRO' },
  { taxId: '0302568603', name: 'CÔNG TY CỔ PHẦN SỮA VIỆT NAM (VINAMILK)' },
  { taxId: '0100150619', name: 'TẬP ĐOÀN XĂNG DẦU VIỆT NAM (PETROLIMEX)' },
  { taxId: '1800155054', name: 'CÔNG TY CỔ PHẦN LỌC HÓA DẦU BÌNH SƠN' },
  { taxId: '0300996328', name: 'CÔNG TY TNHH NƯỚC GIẢI KHÁT COCA-COLA VIỆT NAM' },
  { taxId: '3700148156', name: 'CÔNG TY TNHH MINH LONG I' },
  { taxId: '0300481234', name: 'TẬP ĐOÀN DỆT MAY VIỆT NAM (VINATEX)' }
];

const COMMODITIES = [
  { name: 'Máy tính, sản phẩm điện tử và linh kiện', hs: '85176200', group: 'Điện tử' },
  { name: 'Máy móc, thiết bị, dụng cụ phụ tùng khác', hs: '84713010', group: 'Máy móc' },
  { name: 'Điện thoại các loại và linh kiện', hs: '85171300', group: 'Điện thoại' },
  { name: 'Sắt thép các loại', hs: '72083990', group: 'Kim loại' },
  { name: 'Dệt, may, da giày', hs: '64039990', group: 'Dệt may' },
  { name: 'Xăng dầu các loại', hs: '27101919', group: 'Nhiên liệu' },
  { name: 'Hóa chất và sản phẩm hóa chất', hs: '28030041', group: 'Hóa chất' },
  { name: 'Nông sản, thủy sản các loại', hs: '03061790', group: 'Nông sản' }
];

const COUNTRIES = [
  { code: 'CN', name: 'Trung Quốc' },
  { code: 'US', name: 'Hoa Kỳ' },
  { code: 'KR', name: 'Hàn Quốc' },
  { code: 'JP', name: 'Nhật Bản' },
  { code: 'DE', name: 'Đức' },
  { code: 'SG', name: 'Singapore' },
  { code: 'TH', name: 'Thái Lan' },
  { code: 'AU', name: 'Australia' }
];

const CUSTOMS_BRANCHES = ['01AB', '02CI', '03EE', '43NG', '51CD'];
const REGIMES = ['A11', 'A12', 'B11', 'E31', 'G11', 'H11'];
const STREAM_CHANNELS = ['Xanh', 'Vàng', 'Đỏ'];

async function main() {
  console.log(`Connecting to SQL Server: ${config.server}:${config.port}, DB: ${config.database}...`);
  let pool;
  try {
    pool = await sql.connect(config);
    console.log('Database connected successfully!');
    
    // Check if tables exist
    console.log('Checking if tables exist...');
    const tableCheck = await pool.request().query(`
      SELECT OBJECT_ID('dbo.rpToKhai', 'U') AS toKhaiExists,
             OBJECT_ID('dbo.rpHang', 'U') AS hangExists
    `);
    
    const { toKhaiExists, hangExists } = tableCheck.recordset[0];
    
    if (!toKhaiExists || !hangExists) {
      console.log('Tables do not exist! Running Table.sql schema initialization first...');
      const schemaSql = fs.readFileSync(path.join(__dirname, '../Table.sql'), 'utf8');
      
      // Split script by GO statement (case insensitive)
      const commands = schemaSql.split(/\bGO\b/i);
      
      for (const cmd of commands) {
        const trimmed = cmd.trim();
        if (trimmed && !trimmed.startsWith('USE')) {
          await pool.request().query(trimmed);
        }
      }
      console.log('Tables created successfully from Table.sql.');
    } else {
      console.log('Tables rpToKhai and rpHang already exist.');
    }

    console.log('Clearing existing data from rpToKhai and rpHang to start fresh...');
    await pool.request().query('DELETE FROM rpHang; DELETE FROM rpToKhai;');
    console.log('Cleared tables.');

    console.log('Generating seed data (approx. 200 records)...');
    
    const startDate = new Date('2026-01-01');
    const endDate = new Date('2026-06-08');
    const recordsToCreate = 200;

    for (let i = 0; i < recordsToCreate; i++) {
      // Calculate random date
      const timeDiff = endDate.getTime() - startDate.getTime();
      const randomTime = startDate.getTime() + Math.random() * timeDiff;
      const date = new Date(randomTime);
      const dateStr = date.toISOString().slice(0, 10);
      
      const id = crypto.randomUUID();
      const isImport = Math.random() > 0.45; // 55% Imports, 45% Exports
      const loaiXNK = isImport ? 'NK' : 'XK';
      
      const ent = ENTERPRISES[Math.floor(Math.random() * ENTERPRISES.length)];
      const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
      const branch = CUSTOMS_BRANCHES[Math.floor(Math.random() * CUSTOMS_BRANCHES.length)];
      const regime = REGIMES[Math.floor(Math.random() * REGIMES.length)];
      
      // Determine stream (Xanh 65%, Vang 30%, Do 5%)
      const randStream = Math.random();
      const stream = randStream < 0.65 ? 'Xanh' : (randStream < 0.95 ? 'Vàng' : 'Đỏ');

      const qtyCont = Math.floor(Math.random() * 8) + 1; // 1-8 containers
      const weight = Math.round((qtyCont * (5 + Math.random() * 15)) * 100) / 100; // 5-20 tons per cont
      const valUSD = Math.round((weight * (1500 + Math.random() * 4000)) * 100) / 100; // 1500-5500 USD per ton
      
      // Insert to rpToKhai
      const toKhaiRequest = pool.request();
      toKhaiRequest.input('ID', sql.UniqueIdentifier, id);
      toKhaiRequest.input('Ngay_dang_ky', sql.Date, dateStr);
      toKhaiRequest.input('Tong_to_khai', sql.Int, 1);
      toKhaiRequest.input('Ma_HQ', sql.Char(4), branch);
      toKhaiRequest.input('Ma_LH', sql.Char(3), regime);
      toKhaiRequest.input('Ma_DN_XNK', sql.VarChar(20), ent.taxId);
      toKhaiRequest.input('Ten_DN_XNK', sql.NVarChar(255), ent.name);
      toKhaiRequest.input('Luong', sql.NVarChar(4), stream);
      toKhaiRequest.input('Loai_XNK', sql.NVarChar(4), loaiXNK);
      toKhaiRequest.input('Nuoc_XNK', sql.NVarChar(50), country.name);
      toKhaiRequest.input('Dia_diem_giam_sat', sql.NVarChar(20), 'CẢNG HẢI PHÒNG');
      toKhaiRequest.input('So_luong_cont', sql.Int, qtyCont);
      toKhaiRequest.input('Tong_trong_luong_TNE', sql.Numeric(38, 2), weight);
      toKhaiRequest.input('Kim_ngach_USD', sql.Numeric(38, 2), valUSD);
      toKhaiRequest.input('Tong_thue_thu_khac_VND', sql.Numeric(38, 2), Math.round(valUSD * 250 * Math.random())); // Small other tax

      await toKhaiRequest.query(`
        INSERT INTO rpToKhai (
          ID, Ngay_dang_ky, Tong_to_khai, Ma_HQ, Ma_LH, Ma_DN_XNK, Ten_DN_XNK, 
          Luong, Loai_XNK, Nuoc_XNK, Dia_diem_giam_sat, So_luong_cont, 
          Tong_trong_luong_TNE, Kim_ngach_USD, Tong_thue_thu_khac_VND
        ) VALUES (
          @ID, @Ngay_dang_ky, @Tong_to_khai, @Ma_HQ, @Ma_LH, @Ma_DN_XNK, @Ten_DN_XNK,
          @Luong, @Loai_XNK, @Nuoc_XNK, @Dia_diem_giam_sat, @So_luong_cont,
          @Tong_trong_luong_TNE, @Kim_ngach_USD, @Tong_thue_thu_khac_VND
        )
      `);

      // 1 to 3 items per declaration
      const itemsCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < itemsCount; j++) {
        const comm = COMMODITIES[Math.floor(Math.random() * COMMODITIES.length)];
        const qty = Math.round((weight / itemsCount) * 1000) / 1000;
        const valVND = Math.round((valUSD / itemsCount) * 25000); // 1 USD = 25,000 VND
        
        // Calculate taxes:
        // thue_XNK: 5% of value for Import, 0% for Export
        const thueXNK = isImport ? Math.round(valVND * 0.05) : 0;
        // thue_V (VAT): 10% of value
        const thueV = isImport ? Math.round((valVND + thueXNK) * 0.10) : 0;
        // thue_T (SCT): 15% for fuel/special goods, 0% others
        const thueT = comm.group === 'Nhiên liệu' ? Math.round(valVND * 0.15) : 0;
        // thue_M (Env): environmental tax, 2% for chemicals/fuel
        const thueM = (comm.group === 'Nhiên liệu' || comm.group === 'Hóa chất') ? Math.round(valVND * 0.03) : 0;
        // thue_B (Defense): 1% for steel
        const thueB = comm.group === 'Kim loại' ? Math.round(valVND * 0.02) : 0;
        // thue_G (Other): 0.5%
        const thueG = Math.round(valVND * 0.005);

        const totalTax = thueXNK + thueV + thueT + thueM + thueB + thueG;

        const itemId = crypto.randomUUID();
        const itemRequest = pool.request();
        itemRequest.input('ID', sql.UniqueIdentifier, itemId);
        itemRequest.input('Ngay_dang_ky', sql.Date, dateStr);
        itemRequest.input('Loai_XNK', sql.NChar(4), loaiXNK);
        itemRequest.input('Nhom_hang', sql.NVarChar(50), comm.name);
        itemRequest.input('Ma_HS', sql.VarChar(12), comm.hs);
        itemRequest.input('Ma_nuoc_XX', sql.Char(2), country.code);
        itemRequest.input('So_luong', sql.Numeric(18, 3), qty);
        itemRequest.input('Tri_gia_VND', sql.Money, valVND);
        itemRequest.input('Tri_gia_co_thue', sql.Money, valVND + thueXNK);
        itemRequest.input('So_tien_thue_XNK', sql.Money, thueXNK);
        itemRequest.input('So_tien_thue_V', sql.Money, thueV);
        itemRequest.input('So_tien_thue_T', sql.Money, thueT);
        itemRequest.input('So_tien_thue_M', sql.Money, thueM);
        itemRequest.input('So_tien_thue_B', sql.Money, thueB);
        itemRequest.input('So_tien_thue_G', sql.Money, thueG);
        itemRequest.input('Tong_thue', sql.Money, totalTax);

        await itemRequest.query(`
          INSERT INTO rpHang (
            ID, Ngay_dang_ky, Loai_XNK, Nhom_hang, Ma_HS, Ma_nuoc_XX, So_luong,
            Tri_gia_VND, Tri_gia_co_thue, So_tien_thue_XNK, So_tien_thue_V,
            So_tien_thue_T, So_tien_thue_M, So_tien_thue_B, So_tien_thue_G,
            Tong_thue
          ) VALUES (
            @ID, @Ngay_dang_ky, @Loai_XNK, @Nhom_hang, @Ma_HS, @Ma_nuoc_XX, @So_luong,
            @Tri_gia_VND, @Tri_gia_co_thue, @So_tien_thue_XNK, @So_tien_thue_V,
            @So_tien_thue_T, @So_tien_thue_M, @So_tien_thue_B, @So_tien_thue_G,
            @Tong_thue
          )
        `);
      }
    }

    console.log(`Successfully seeded ${recordsToCreate} declarations and item rows!`);
  } catch (err) {
    console.error('Seeding process failed:', err);
  } finally {
    if (pool) {
      await pool.close();
      console.log('Database connection closed.');
    }
  }
}

main();
