using GraphQL.Types;
using Microsoft.AspNetCore.Antiforgery;
using TimeTracker.GraphQL.Types.AbsenceTypes;
using TimeTracker.GraphQL.Types.Calendar;
using TimeTracker.GraphQL.Types.Time;
using TimeTracker.GraphQL.Types.UserTypes;
using TimeTracker.GraphQL.Types.Vacation;
using TimeTracker.Repositories;

namespace TimeTracker.GraphQL.Queries
{
    public class UserMutation : ObjectGraphType
    {
        private readonly IUserRepository repo;

        public UserMutation(IUserRepository Repo)
        {
            repo = Repo;

            Field<UserMutationGraphQLType>("user")
            .Resolve(context => new { });
            Field<TimeMutationGraphQLType>("time")
            .Resolve(context => new { });
            Field<CalendarMutationGraphQLType>("calendar")
                .Resolve(context => new { });
            Field<VacationMutation>("vacation")
            .Resolve(context => new { });
            Field<AbsenceMutationGraphQLType>("absence")
            .Resolve(context => new { });

        }
    }
}