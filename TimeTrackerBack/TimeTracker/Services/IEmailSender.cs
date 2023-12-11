﻿using TimeTracker.Models;

namespace TimeTracker.Services
{
    public interface IEmailSender
    {
        void SendResetPassEmail(string code, string email);
        void SendRegistrationEmail(string code, string email);
        void SendResponseOfVacationRequest(VacationRequest vacationRequest, string email);
        void SendBadMonthlyWorkResults(User user, int MonthWorkTimeSeconds, int userMonthWorkTimeSeconds);
    }
}
