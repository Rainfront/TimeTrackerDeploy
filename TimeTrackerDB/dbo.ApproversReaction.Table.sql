/****** Object:  Table [dbo].[ApproversReaction]    Script Date: 11/10/2023 18:15:49 ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[ApproversReaction](
	[Id] [int] IDENTITY(1,1) NOT NULL,
	[UserIdApprover] [int] NOT NULL,
	[UserIdRequester] [int] NOT NULL,
	[RequestId] [int] NOT NULL,
	[IsRequestApproved] [bit] NULL,
	[ReactionMessage] [nvarchar](50) NULL,
 CONSTRAINT [PK_ApproversReaction] PRIMARY KEY CLUSTERED 
(
	[Id] ASC
)WITH (STATISTICS_NORECOMPUTE = OFF, IGNORE_DUP_KEY = OFF, OPTIMIZE_FOR_SEQUENTIAL_KEY = OFF) ON [PRIMARY]
) ON [PRIMARY]
GO
ALTER TABLE [dbo].[ApproversReaction]  WITH CHECK ADD  CONSTRAINT [FK_ApproversReactionApprover_Users] FOREIGN KEY([UserIdApprover])
REFERENCES [dbo].[Users] ([Id])
ON DELETE CASCADE
GO
ALTER TABLE [dbo].[ApproversReaction] CHECK CONSTRAINT [FK_ApproversReactionApprover_Users]
GO
ALTER TABLE [dbo].[ApproversReaction]  WITH CHECK ADD  CONSTRAINT [FK_ApproversReactionRequester_ApproversReaction] FOREIGN KEY([UserIdRequester])
REFERENCES [dbo].[Users] ([Id])
GO
ALTER TABLE [dbo].[ApproversReaction] CHECK CONSTRAINT [FK_ApproversReactionRequester_ApproversReaction]
GO
ALTER TABLE [dbo].[ApproversReaction]  WITH CHECK ADD  CONSTRAINT [FK_ApproversReactionRequestId_ApproversReaction] FOREIGN KEY([RequestId])
REFERENCES [dbo].[VacationRequests] ([Id])
GO
ALTER TABLE [dbo].[ApproversReaction] CHECK CONSTRAINT [FK_ApproversReactionRequestId_ApproversReaction]
GO
