
using GraphQL;
using GraphQL.Types;
using TimeTracker.GraphQL.Types.AbsenceTypes;
using TimeTracker.GraphQL.Types.Calendar;
using TimeTracker.GraphQL.Types.TimeQuery;
using TimeTracker.GraphQL.Types.UserTypes;
using TimeTracker.GraphQL.Types.Vacation;
using TimeTracker.Repositories;

namespace TimeTracker.GraphQL.Queries
{
    public class UserQuery : ObjectGraphType
    {
        private readonly IUserRepository repo;

        public UserQuery(IUserRepository Repo)
        {
            repo = Repo;
            Field<UserQueryGraphQLType>("user")
            .Resolve(context => new { });
            Field<TimeQueryGraphQLType>("time")
            .Resolve(context => new { });
            Field<CalendarQueryGraphQLType>("calendar")
                .Resolve(context => new { });
            Field<VacationQuery>("vacation")
            .Resolve(context => new { });
            Field<AbsenceQueryGraphQLType>("absence")
            .Resolve(context => new { });

        }
    }
}
