USE [master]
GO
/****** Object:  Database [TimeTracker]    Script Date: 7/3/2023 6:04:35 PM ******/
CREATE DATABASE [TimeTracker]
 CONTAINMENT = NONE
 ON  PRIMARY 
( NAME = N'TimeTracker', FILENAME = N'D:\App\MSSQL15.SQLEXPRESS\MSSQL\DATA\TimeTracker.mdf' , SIZE = 8192KB , MAXSIZE = UNLIMITED, FILEGROWTH = 65536KB )
 LOG ON 
( NAME = N'TimeTracker_log', FILENAME = N'D:\App\MSSQL15.SQLEXPRESS\MSSQL\DATA\TimeTracker_log.ldf' , SIZE = 8192KB , MAXSIZE = 2048GB , FILEGROWTH = 65536KB )
 WITH CATALOG_COLLATION = DATABASE_DEFAULT
GO
ALTER DATABASE [TimeTracker] SET COMPATIBILITY_LEVEL = 150
GO
IF (1 = FULLTEXTSERVICEPROPERTY('IsFullTextInstalled'))
begin
EXEC [TimeTracker].[dbo].[sp_fulltext_database] @action = 'enable'
end
GO
ALTER DATABASE [TimeTracker] SET ANSI_NULL_DEFAULT OFF 
GO
ALTER DATABASE [TimeTracker] SET ANSI_NULLS OFF 
GO
ALTER DATABASE [TimeTracker] SET ANSI_PADDING OFF 
GO
ALTER DATABASE [TimeTracker] SET ANSI_WARNINGS OFF 
GO
ALTER DATABASE [TimeTracker] SET ARITHABORT OFF 
GO
ALTER DATABASE [TimeTracker] SET AUTO_CLOSE OFF 
GO
ALTER DATABASE [TimeTracker] SET AUTO_SHRINK OFF 
GO
ALTER DATABASE [TimeTracker] SET AUTO_UPDATE_STATISTICS ON 
GO
ALTER DATABASE [TimeTracker] SET CURSOR_CLOSE_ON_COMMIT OFF 
GO
ALTER DATABASE [TimeTracker] SET CURSOR_DEFAULT  GLOBAL 
GO
ALTER DATABASE [TimeTracker] SET CONCAT_NULL_YIELDS_NULL OFF 
GO
ALTER DATABASE [TimeTracker] SET NUMERIC_ROUNDABORT OFF 
GO
ALTER DATABASE [TimeTracker] SET QUOTED_IDENTIFIER OFF 
GO
ALTER DATABASE [TimeTracker] SET RECURSIVE_TRIGGERS OFF 
GO
ALTER DATABASE [TimeTracker] SET  DISABLE_BROKER 
GO
ALTER DATABASE [TimeTracker] SET AUTO_UPDATE_STATISTICS_ASYNC OFF 
GO
ALTER DATABASE [TimeTracker] SET DATE_CORRELATION_OPTIMIZATION OFF 
GO
ALTER DATABASE [TimeTracker] SET TRUSTWORTHY OFF 
GO
ALTER DATABASE [TimeTracker] SET ALLOW_SNAPSHOT_ISOLATION OFF 
GO
ALTER DATABASE [TimeTracker] SET PARAMETERIZATION SIMPLE 
GO
ALTER DATABASE [TimeTracker] SET READ_COMMITTED_SNAPSHOT OFF 
GO
ALTER DATABASE [TimeTracker] SET HONOR_BROKER_PRIORITY OFF 
GO
ALTER DATABASE [TimeTracker] SET RECOVERY SIMPLE 
GO
ALTER DATABASE [TimeTracker] SET  MULTI_USER 
GO
ALTER DATABASE [TimeTracker] SET PAGE_VERIFY CHECKSUM  
GO
ALTER DATABASE [TimeTracker] SET DB_CHAINING OFF 
GO
ALTER DATABASE [TimeTracker] SET FILESTREAM( NON_TRANSACTED_ACCESS = OFF ) 
GO
ALTER DATABASE [TimeTracker] SET TARGET_RECOVERY_TIME = 60 SECONDS 
GO
ALTER DATABASE [TimeTracker] SET DELAYED_DURABILITY = DISABLED 
GO
ALTER DATABASE [TimeTracker] SET ACCELERATED_DATABASE_RECOVERY = OFF  
GO
ALTER DATABASE [TimeTracker] SET QUERY_STORE = OFF
GO
USE [TimeTracker]
GO
/****** Object:  Table [dbo].[Users]    Script Date: 7/3/2023 6:04:35 PM ******/
SET ANSI_NULLS ON
GO
SET QUOTED_IDENTIFIER ON
GO
CREATE TABLE [dbo].[Users](
	[Id] [int] NOT NULL,
	[Login] [nvarchar](50) NOT NULL,
	[Password] [nvarchar](50) NOT NULL,
	[FullName] [nvarchar](max) NOT NULL,
	[CRUDUsers] [bit] NOT NULL,
	[EditPermiters] [bit] NOT NULL,
	[ViewUsers] [bit] NOT NULL,
	[EditWorkHours] [bit] NOT NULL,
	[ImportExcel] [bit] NOT NULL,
	[ControlPresence] [bit] NOT NULL,
	[ControlDayOffs] [bit] NOT NULL
) ON [PRIMARY] TEXTIMAGE_ON [PRIMARY]
GO
USE [master]
GO
ALTER DATABASE [TimeTracker] SET  READ_WRITE 
GO
