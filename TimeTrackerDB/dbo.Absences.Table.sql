/****** Object:  Table [dbo].[Absences]    Script Date: 11/10/2023 18:15:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Absences](
	[UserId] [int] NOT NULL,
	[Type] [nvarchar](55) NOT NULL,
	[Date] [datetime2](7) NOT NULL
) ON [PRIMARY]
GO
