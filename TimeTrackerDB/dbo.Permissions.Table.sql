/****** Object:  Table [dbo].[Permissions]    Script Date: 11/10/2023 18:15:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Permissions](
	[userId] [int] NOT NULL,
	[CRUDUsers] [bit] NOT NULL,
	[EditApprovers] [bit] NOT NULL,
	[ViewUsers] [bit] NOT NULL,
	[EditWorkHours] [bit] NOT NULL,
	[ExportExcel] [bit] NOT NULL,
	[ControlPresence] [bit] NOT NULL,
	[ControlDayOffs] [bit] NOT NULL,
 CONSTRAINT [PK_Permissions] PRIMARY KEY CLUSTERED 
(
	[userId] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[Permissions]  WITH CHECK ADD  CONSTRAINT [FK_Permissions_Users] FOREIGN KEY([userId])
REFERENCES [dbo].[Users] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[Permissions] CHECK CONSTRAINT [FK_Permissions_Users]
GO
