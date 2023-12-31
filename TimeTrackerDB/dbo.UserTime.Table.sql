/****** Object:  Table [dbo].[UserTime]    Script Date: 11/10/2023 18:15:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[UserTime](
	[UserId] [int] NOT NULL,
	[StartTimeTrackDate] [datetime2](0) NOT NULL,
	[EndTimeTrackDate] [datetime2](0) NULL,
 CONSTRAINT [PK_UserTime] PRIMARY KEY CLUSTERED 
(
	[UserId] ASC,
	[StartTimeTrackDate] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[UserTime]  WITH CHECK ADD  CONSTRAINT [FK_UserTime_User] FOREIGN KEY([UserId])
REFERENCES [dbo].[Users] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[UserTime] CHECK CONSTRAINT [FK_UserTime_User]
GO
