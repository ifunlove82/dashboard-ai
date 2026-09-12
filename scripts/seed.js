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
const CARGO_TYPES = ['Container', 'Hàng rời', 'Hàng lỏng'];

const OFFICERS = [
  { code: 'CC01', name: 'Nguyễn Văn An' },
  { code: 'CC02', name: 'Trần Thị Bình' },
  { code: 'CC03', name: 'Lê Hoàng Cường' },
  { code: 'CC04', name: 'Phạm Minh Đức' },
  { code: 'CC05', name: 'Hoàng Thị Mai' },
  { code: 'CC06', name: 'Vũ Quốc Hùng' },
  { code: 'CC07', name: 'Đỗ Bích Ngọc' },
  { code: 'CC08', name: 'Ngô Tuấn Anh' }
];

async function main() {
  console.log(`Connecting to SQL Server: ${config.server}:${config.port}, DB: ${config.database}...`);
  let pool;
  try {
    pool = await sql.connect(config);
    console.log('Database connected successfully!');
    
    // Check if tables exist
    console.log('Checking database tables and schema...');
    const tableCheck = await pool.request().query(`
      SELECT OBJECT_ID('dbo.rpToKhai', 'U') AS toKhaiExists,
             OBJECT_ID('dbo.rpHang', 'U') AS hangExists,
             OBJECT_ID('dbo.rpPhiCSHT', 'U') AS phiCSHTExists,
             OBJECT_ID('dbo.rpHieuSuatCongChuc', 'U') AS hieuSuatExists
    `);
    
    const { toKhaiExists, hangExists, phiCSHTExists, hieuSuatExists } = tableCheck.recordset[0];
    
    if (!toKhaiExists || !hangExists) {
      console.log('Core tables do not exist! Running Table.sql schema initialization first...');
      const schemaSql = fs.readFileSync(path.join(__dirname, '../Table.sql'), 'utf8');
      
      const commands = schemaSql.split(/\bGO\b/i);
      for (const cmd of commands) {
        const trimmed = cmd.trim();
        if (trimmed && !trimmed.startsWith('USE')) {
          try {
            await pool.request().query(trimmed);
          } catch (e) {
            console.warn('Schema statement warning:', e.message);
          }
        }
      }
      console.log('Tables created successfully from Table.sql.');
    } else {
      console.log('Core tables exist. Ensuring new columns and tables are created...');
      
      // Check for Trong_Thong_Ke column on rpToKhai
      const colCheck = await pool.request().query(`
        SELECT COLUMN_NAME FROM INFORMATION_SCHEMA.COLUMNS 
        WHERE TABLE_NAME = 'rpToKhai' AND COLUMN_NAME = 'Trong_Thong_Ke'
      `);
      if (colCheck.recordset.length === 0) {
        console.log('Adding missing tracking columns to rpToKhai...');
        await pool.request().query(`
          ALTER TABLE rpToKhai ADD 
            Trong_Thong_Ke bit NULL DEFAULT 1,
            Thoi_diem_dang_ky datetime NULL,
            Thoi_diem_phan_luong datetime NULL,
            Thoi_diem_thong_quan datetime NULL,
            Ma_Cong_Chuc varchar(50) NULL;
        `);
      }

      // Check for rpPhiCSHT
      if (!phiCSHTExists) {
        console.log('Creating rpPhiCSHT table...');
        await pool.request().query(`
          CREATE TABLE [dbo].[rpPhiCSHT](
            [ID] [uniqueidentifier] NOT NULL DEFAULT (newsequentialid()),
            [Ngay_dang_ky] [date] NOT NULL,
            [So_tien] [numeric](38, 2) NULL,
            [Ma_HQ] [char](4) NULL,
            [Loai_XNK] [nvarchar](4) NULL,
            [Ma_DN_XNK] [varchar](20) NULL,
            [Loai_hang] [nvarchar](50) NULL,
            CONSTRAINT [PK_rpPhiCSHT] PRIMARY KEY CLUSTERED ([ID] ASC, [Ngay_dang_ky] ASC)
          );
        `);
      }

      // Check for rpHieuSuatCongChuc
      if (!hieuSuatExists) {
        console.log('Creating rpHieuSuatCongChuc table...');
        await pool.request().query(`
          CREATE TABLE [dbo].[rpHieuSuatCongChuc](
            [ID] [uniqueidentifier] NOT NULL DEFAULT (newsequentialid()),
            [Ma_Cong_Chuc] [varchar](50) NOT NULL,
            [Ngay] [date] NOT NULL,
            [To_khai_xanh] [int] NULL,
            [To_khai_vang] [int] NULL,
            [To_khai_do] [int] NULL,
            [Vi_pham] [int] NULL,
            [Thoi_gian_xu_ly_tb_phut] [numeric](10, 2) NULL,
            CONSTRAINT [PK_rpHieuSuatCongChuc] PRIMARY KEY CLUSTERED ([ID] ASC)
          );
        `);
      }
    }

    console.log('Clearing existing data from all tables to start fresh...');
    await pool.request().query(`
      DELETE FROM rpHang; 
      DELETE FROM rpToKhai;
      IF OBJECT_ID('dbo.rpPhiCSHT', 'U') IS NOT NULL DELETE FROM rpPhiCSHT;
      IF OBJECT_ID('dbo.rpHieuSuatCongChuc', 'U') IS NOT NULL DELETE FROM rpHieuSuatCongChuc;
    `);
    console.log('Cleared tables.');

    console.log('Generating seed data (approx. 200 declarations, items, and infrastructure fees)...');
    
    const startDate = new Date('2026-01-01');
    const endDate = new Date('2026-06-08');
    const recordsToCreate = 200;
    const generatedDates = new Set();

    for (let i = 0; i < recordsToCreate; i++) {
      // Calculate random date
      const timeDiff = endDate.getTime() - startDate.getTime();
      const randomTime = startDate.getTime() + Math.random() * timeDiff;
      const date = new Date(randomTime);
      const dateStr = date.toISOString().slice(0, 10);
      generatedDates.add(dateStr);
      
      const id = crypto.randomUUID();
      const isImport = Math.random() > 0.45; // 55% Imports, 45% Exports
      const loaiXNK = isImport ? 'NK' : 'XK';
      
      const ent = ENTERPRISES[Math.floor(Math.random() * ENTERPRISES.length)];
      const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
      const branch = CUSTOMS_BRANCHES[Math.floor(Math.random() * CUSTOMS_BRANCHES.length)];
      const regime = REGIMES[Math.floor(Math.random() * REGIMES.length)];
      const officer = OFFICERS[Math.floor(Math.random() * OFFICERS.length)];
      
      // Determine stream (Xanh 65%, Vang 30%, Do 5%)
      const randStream = Math.random();
      const stream = randStream < 0.65 ? 'Xanh' : (randStream < 0.95 ? 'Vàng' : 'Đỏ');

      // Statistical trade flag (92% in stats, 8% non-statistical)
      const trongThongKe = Math.random() < 0.92 ? 1 : 0;

      // Registration timestamp (08:00 - 16:30)
      const regHours = 8 + Math.floor(Math.random() * 8);
      const regMins = Math.floor(Math.random() * 60);
      const regSecs = Math.floor(Math.random() * 60);
      const regTime = new Date(date);
      regTime.setHours(regHours, regMins, regSecs, 0);

      // Routing timestamp (1 - 5 mins after registration)
      const routeTime = new Date(regTime.getTime() + (1 + Math.floor(Math.random() * 5)) * 60 * 1000);

      // Clearance timestamp based on channel
      let leadMinutes = 5;
      if (stream === 'Xanh') {
        leadMinutes = 1 + Math.floor(Math.random() * 10); // 1-10 mins
      } else if (stream === 'Vàng') {
        leadMinutes = 15 + Math.floor(Math.random() * 75); // 15-90 mins
      } else {
        leadMinutes = 120 + Math.floor(Math.random() * 360); // 2-8 hours
      }
      const clearTime = new Date(routeTime.getTime() + leadMinutes * 60 * 1000);

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
      toKhaiRequest.input('Tong_thue_thu_khac_VND', sql.Numeric(38, 2), Math.round(valUSD * 250 * Math.random()));
      toKhaiRequest.input('Trong_Thong_Ke', sql.Bit, trongThongKe);
      toKhaiRequest.input('Thoi_diem_dang_ky', sql.DateTime, regTime);
      toKhaiRequest.input('Thoi_diem_phan_luong', sql.DateTime, routeTime);
      toKhaiRequest.input('Thoi_diem_thong_quan', sql.DateTime, clearTime);
      toKhaiRequest.input('Ma_Cong_Chuc', sql.VarChar(50), officer.code);

      await toKhaiRequest.query(`
        INSERT INTO rpToKhai (
          ID, Ngay_dang_ky, Tong_to_khai, Ma_HQ, Ma_LH, Ma_DN_XNK, Ten_DN_XNK, 
          Luong, Loai_XNK, Nuoc_XNK, Dia_diem_giam_sat, So_luong_cont, 
          Tong_trong_luong_TNE, Kim_ngach_USD, Tong_thue_thu_khac_VND,
          Trong_Thong_Ke, Thoi_diem_dang_ky, Thoi_diem_phan_luong, Thoi_diem_thong_quan, Ma_Cong_Chuc
        ) VALUES (
          @ID, @Ngay_dang_ky, @Tong_to_khai, @Ma_HQ, @Ma_LH, @Ma_DN_XNK, @Ten_DN_XNK,
          @Luong, @Loai_XNK, @Nuoc_XNK, @Dia_diem_giam_sat, @So_luong_cont,
          @Tong_trong_luong_TNE, @Kim_ngach_USD, @Tong_thue_thu_khac_VND,
          @Trong_Thong_Ke, @Thoi_diem_dang_ky, @Thoi_diem_phan_luong, @Thoi_diem_thong_quan, @Ma_Cong_Chuc
        )
      `);

      // Insert to rpPhiCSHT (Infrastructure Fee for shipment)
      const phiId = crypto.randomUUID();
      const cargoType = CARGO_TYPES[Math.floor(Math.random() * CARGO_TYPES.length)];
      const feeAmount = Math.round(qtyCont * 350000 + (Math.random() * 400000 + 100000));
      const phiRequest = pool.request();
      phiRequest.input('ID', sql.UniqueIdentifier, phiId);
      phiRequest.input('Ngay_dang_ky', sql.Date, dateStr);
      phiRequest.input('So_tien', sql.Numeric(38, 2), feeAmount);
      phiRequest.input('Ma_HQ', sql.Char(4), branch);
      phiRequest.input('Loai_XNK', sql.NVarChar(4), loaiXNK);
      phiRequest.input('Ma_DN_XNK', sql.VarChar(20), ent.taxId);
      phiRequest.input('Loai_hang', sql.NVarChar(50), cargoType);

      await phiRequest.query(`
        INSERT INTO rpPhiCSHT (
          ID, Ngay_dang_ky, So_tien, Ma_HQ, Loai_XNK, Ma_DN_XNK, Loai_hang
        ) VALUES (
          @ID, @Ngay_dang_ky, @So_tien, @Ma_HQ, @Loai_XNK, @Ma_DN_XNK, @Loai_hang
        )
      `);

      // 1 to 3 items per declaration
      const itemsCount = Math.floor(Math.random() * 3) + 1;
      for (let j = 0; j < itemsCount; j++) {
        const comm = COMMODITIES[Math.floor(Math.random() * COMMODITIES.length)];
        const qty = Math.round((weight / itemsCount) * 1000) / 1000;
        const valVND = Math.round((valUSD / itemsCount) * 25000); // 1 USD = 25,000 VND
        
        // Calculate taxes:
        const thueXNK = isImport ? Math.round(valVND * 0.05) : 0;
        const thueV = isImport ? Math.round((valVND + thueXNK) * 0.10) : 0;
        const thueT = comm.group === 'Nhiên liệu' ? Math.round(valVND * 0.15) : 0;
        const thueM = (comm.group === 'Nhiên liệu' || comm.group === 'Hóa chất') ? Math.round(valVND * 0.03) : 0;
        const thueB = comm.group === 'Kim loại' ? Math.round(valVND * 0.02) : 0;
        const thueG = Math.round(valVND * 0.005);
        const totalTax = thueXNK + thueV + thueT + thueM + thueB + thueG;

        const itemId = crypto.randomUUID();
        const itemRequest = pool.request();
        itemRequest.input('ID', sql.UniqueIdentifier, itemId);
        itemRequest.input('ID_ToKhai', sql.UniqueIdentifier, id);
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
            ID, ID_ToKhai, Ngay_dang_ky, Loai_XNK, Nhom_hang, Ma_HS, Ma_nuoc_XX, So_luong,
            Tri_gia_VND, Tri_gia_co_thue, So_tien_thue_XNK, So_tien_thue_V,
            So_tien_thue_T, So_tien_thue_M, So_tien_thue_B, So_tien_thue_G,
            Tong_thue
          ) VALUES (
            @ID, @ID_ToKhai, @Ngay_dang_ky, @Loai_XNK, @Nhom_hang, @Ma_HS, @Ma_nuoc_XX, @So_luong,
            @Tri_gia_VND, @Tri_gia_co_thue, @So_tien_thue_XNK, @So_tien_thue_V,
            @So_tien_thue_T, @So_tien_thue_M, @So_tien_thue_B, @So_tien_thue_G,
            @Tong_thue
          )
        `);
      }
    }

    console.log('Generating seed data for rpHieuSuatCongChuc (customs officer performance)...');
    const dateArray = Array.from(generatedDates);
    let officerRowsCount = 0;

    for (const off of OFFICERS) {
      // Seed ~15 daily records per officer spread across dates
      const selectedDates = dateArray.filter(() => Math.random() < 0.25);
      for (const dStr of selectedDates) {
        const hsId = crypto.randomUUID();
        const xanhCount = Math.floor(Math.random() * 25) + 5;
        const vangCount = Math.floor(Math.random() * 12) + 2;
        const doCount = Math.floor(Math.random() * 4) + 1;
        // Violations discovered (hit rate on yellow/red)
        const viPham = Math.random() < 0.35 ? Math.floor(Math.random() * 2) + 1 : 0;
        const avgLeadTime = Math.round((20 + Math.random() * 40) * 10) / 10;

        const hsRequest = pool.request();
        hsRequest.input('ID', sql.UniqueIdentifier, hsId);
        hsRequest.input('Ma_Cong_Chuc', sql.VarChar(50), off.code);
        hsRequest.input('Ngay', sql.Date, dStr);
        hsRequest.input('To_khai_xanh', sql.Int, xanhCount);
        hsRequest.input('To_khai_vang', sql.Int, vangCount);
        hsRequest.input('To_khai_do', sql.Int, doCount);
        hsRequest.input('Vi_pham', sql.Int, viPham);
        hsRequest.input('Thoi_gian_xu_ly_tb_phut', sql.Numeric(10, 2), avgLeadTime);

        await hsRequest.query(`
          INSERT INTO rpHieuSuatCongChuc (
            ID, Ma_Cong_Chuc, Ngay, To_khai_xanh, To_khai_vang, To_khai_do, Vi_pham, Thoi_gian_xu_ly_tb_phut
          ) VALUES (
            @ID, @Ma_Cong_Chuc, @Ngay, @To_khai_xanh, @To_khai_vang, @To_khai_do, @Vi_pham, @Thoi_gian_xu_ly_tb_phut
          )
        `);
        officerRowsCount++;
      }
    }

    console.log(`Successfully seeded ${recordsToCreate} declarations, items, ${recordsToCreate} infrastructure fee rows, and ${officerRowsCount} officer performance rows!`);
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
