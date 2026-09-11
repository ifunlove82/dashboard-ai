USE [VNACCS_REPORT]
GO

/****** Object:  Table [dbo].[rpHang]    Script Date: 09/06/2026 12:53:05 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[rpHang](
	[ID] [uniqueidentifier] NOT NULL,
	[Ngay_dang_ky] [date] NOT NULL,
	[Loai_XNK] [nchar](4) NOT NULL,
	[Nhom_hang] [nvarchar](50) NULL,
	[Ma_HS] [varchar](12) NOT NULL,
	[Ma_nuoc_XX] [char](2) NULL,
	[So_luong] [numeric](18, 3) NULL,
	[Tri_gia_VND] [money] NULL,
	[Tri_gia_co_thue] [money] NULL,
	[So_tien_thue_XNK] [money] NULL,
	[So_tien_thue_V] [money] NULL,
	[So_tien_thue_T] [money] NULL,
	[So_tien_thue_M] [money] NULL,
	[So_tien_thue_B] [money] NULL,
	[So_tien_thue_G] [money] NULL,
	[Tong_thue] [money] NULL,
	[Ngay_nhap_may] [datetime] NULL,
 CONSTRAINT [PK_rpHang] PRIMARY KEY CLUSTERED 
(
	[ID] ASC,
	[Ngay_dang_ky] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO

SET ANSI_PADDING OFF
GO

/****** Object:  Table [dbo].[rpToKhai]    Script Date: 09/06/2026 12:53:05 AM ******/
SET ANSI_NULLS ON
GO

SET QUOTED_IDENTIFIER ON
GO

SET ANSI_PADDING ON
GO

CREATE TABLE [dbo].[rpToKhai](
	[ID] [uniqueidentifier] NOT NULL,
	[Ngay_dang_ky] [date] NOT NULL,
	[Tong_to_khai] [int] NULL,
	[Ma_HQ] [char](4) NULL,
	[Ma_LH] [char](3) NULL,
	[Ma_DN_XNK] [varchar](20) NULL,
	[Ten_DN_XNK] [nvarchar](255) NULL,
	[Luong] [nvarchar](4) NULL,
	[Loai_XNK] [nvarchar](4) NULL,
	[Nuoc_XNK] [nvarchar](50) NULL,
	[Dia_diem_giam_sat] [nvarchar](20) NULL,
	[So_luong_cont] [int] NULL,
	[Tong_trong_luong_TNE] [numeric](38, 2) NULL,
	[Kim_ngach_USD] [numeric](38, 2) NULL,
	[Tong_thue_thu_khac_VND] [numeric](38, 2) NULL,
 CONSTRAINT [PK_rpToKhai] PRIMARY KEY CLUSTERED 
(
	[ID] ASC,
	[Ngay_dang_ky] ASC
)WITH (PAD_INDEX = OFF, STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, ALLOW_ROW_LOCKS = ON, ALLOW_PAGE_LOCKS = ON)
)

GO

SET ANSI_PADDING OFF
GO

ALTER TABLE [dbo].[rpHang] ADD  CONSTRAINT [DF_rpHang_ID]  DEFAULT (newsequentialid()) FOR [ID]
GO

ALTER TABLE [dbo].[rpHang] ADD  CONSTRAINT [DF_Table_1_TimeStamp]  DEFAULT (getdate()) FOR [Ngay_nhap_may]
GO

ALTER TABLE [dbo].[rpToKhai] ADD  CONSTRAINT [DF_rpToKhai_ID]  DEFAULT (newsequentialid()) FOR [ID]
GO

