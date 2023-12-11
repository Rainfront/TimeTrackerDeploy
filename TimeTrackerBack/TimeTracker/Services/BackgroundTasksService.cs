﻿using System.Globalization;
using TimeTracker.GraphQL.Types.Calendar;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.Repositories;

namespace TimeTracker.Services
{
    public class BackgroundTasksService : BackgroundService
    {
        public ITimeRepository TimeRepository { get; }
        public IUserRepository UserRepository { get; }
        public ICalendarRepository CalendarRepository { get; }
        public IAbsenceRepository AbsenceRepository { get; }
        public IVacationRepository VacationRepository { get; }
        public IUpdateRepository UpdateRepository { get; }
        public IEmailSender EmailSender { get; }
        public ITransactionService TransactionService { get; }
        public ILogger<BackgroundTasksService> Logger { get; }

        public BackgroundTasksService(ITimeRepository timeRepository,
            IUserRepository userRepository,
            ICalendarRepository calendarRepository,
            IAbsenceRepository absenceRepository,
            IVacationRepository vacationRepository,
            IUpdateRepository updateRepository,
            IEmailSender emailSender,
            ITransactionService transactionService,
            ILogger<BackgroundTasksService> logger
            )
        {
            Logger = logger;
            TimeRepository = timeRepository;
            UserRepository = userRepository;
            CalendarRepository = calendarRepository;
            AbsenceRepository = absenceRepository;
            VacationRepository = vacationRepository;
            UpdateRepository = updateRepository;
            EmailSender = emailSender;
            TransactionService = transactionService;
        }
        protected override async Task ExecuteAsync(CancellationToken stoppingToken)
        {
            do
            {
                Comparer comparer = new Comparer();
                DateTime date = DateTime.UtcNow;

                if (!comparer.DateEquals(UpdateRepository.GetLastUpdate(), date))
                {
                    TransactionService.AddToExecuteString(UpdateRepository.GetQuerySetLastUpdate(date));
                    updateFullTimersWorkTime(date);

                    if (date.Day == 1)
                    {
                        UserRepository.AddUsersVacationDays();
                        TransactionService.AddToExecuteString(UserRepository.GetQueryAddUsersVacationDays());
                        CheckUsersWorkTime(date);
                    }
                    
                    try
                    {
                        TransactionService.Execute();
                    }
                    catch
                    {
                        Logger.LogInformation("Background task that updates time already was invoked");
                    }
                }
                await Task.Delay(TimeSpan.FromHours(24), stoppingToken);
            }
            while (!stoppingToken.IsCancellationRequested);
        }

        private void updateFullTimersWorkTime(DateTime date)
        {
            bool bIsShortDay = false;

            var globalevent = CalendarRepository.GetDateGlobalEvent(date);

            if (globalevent != null)
            {
                if (globalevent.TypeOfGlobalEvent == TypeOfGlobalEvent.ShortDay)
                {
                    bIsShortDay = true;
                }
                else return;
            }

            var users = UserRepository.GetFulltimers();

            var time = new Models.Time();

            time.StartTimeTrackDate = new DateTime(date.Year, date.Month, date.Day, 9, 0, 0);

            time.EndTimeTrackDate = bIsShortDay ? new DateTime(date.Year, date.Month, date.Day, 17, 0, 0) :
                new DateTime(date.Year, date.Month, date.Day, 16, 0, 0);

            foreach (var user in users)
            {
                if (CheckUserDay(user.Id, date) == "Work")
                {
                    //TimeRepository.CreateTimeWithEnd(time, user.Id);
                    TransactionService.AddToExecuteString(TimeRepository.GetQueryCreateTimeWithEnd(time, user.Id));
                }
            }
        }
        public string CheckUserDay(int userId, DateTime date)
        {
            if (AbsenceRepository.GetUserDayAbsence(userId, date) != null) return "Absent";
            if (VacationRepository.GetCurrentVacationRequest(userId, date) != null) return "Vacation";
            return "Work";
        }

        public void CheckUsersWorkTime(DateTime d)
        {
            d = d.AddDays(-1);
            var list = UserRepository.GetEnabledUsers();

            foreach (var user in list)
            {
                var userTime = TimeQueryGraphQLType.GetTimeFromSession(TimeRepository.GetUserMonthTime(user.Id, d.Month), new List<ViewModels.TimeMark>(), 0, startOfWeek.Monday);

                var time = TimeQueryGraphQLType.GetMonthWorkTime(user.Id, d, UserRepository, CalendarRepository);

                if (time > userTime.Time.MonthSeconds)
                {
                    EmailSender.SendBadMonthlyWorkResults(user, time, userTime.Time.MonthSeconds);
                }
            }
        }
    }
}
