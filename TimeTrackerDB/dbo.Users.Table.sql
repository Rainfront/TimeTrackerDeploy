/****** Object:  Table [dbo].[Users]    Script Date: 11/10/2023 18:15:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[Id] [int] NOT NULL,
	[Login] [nvarchar](50) NOT NULL,
	[Password] [nvarchar](500) NOT NULL,
	[FullName] [nvarchar](max) NOT NULL,
	[Email] [nvarchar](50) NOT NULL,
	[ResetCode] [nvarchar](50) NULL,
	[Enabled] [bit] NULL,
	[TimeManagedBy] [int] NULL,
	[Salt] [nvarchar](500) NULL,
	[WorkHours] [int] NULL,
	[LastChanged] [datetime2](7) NULL,
	[VacationDays] [int] NOT NULL,
	[Key2Auth] [nvarchar](256) NULL,
 CONSTRAINT [PK_User_Id] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
ALTER TABLE [dbo].[Users] ADD  CONSTRAINT [DF_LasUpdatedBy]  DEFAULT ((0)) FOR [TimeManagedBy]
GO
ALTER TABLE [dbo].[Users] ADD  DEFAULT ('0') FOR [VacationDays]
GO
