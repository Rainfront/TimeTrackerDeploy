﻿using GraphQL.Types;
using TimeTracker.Models;

namespace TimeTracker.GraphQL.Types.Vacation
{
    public class ApproverNodeType : ObjectGraphType<ApproverNode>
    {
        public ApproverNodeType()
        {
            Field(i => i.Id, type: typeof(IntGraphType));
            Field(i => i.UserIdApprover, type: typeof(IntGraphType));
            Field(i => i.Approver, type: typeof(UserTypes.UserGraphType));
            Field(i => i.Requester, type: typeof(UserTypes.UserGraphType));
            Field(i => i.UserIdRequester, type: typeof(IntGraphType));
            Field(i => i.RequestId, type: typeof(IntGraphType));
            Field(i => i.IsRequestApproved, type: typeof(BooleanGraphType));
            Field(i => i.ReactionMessage, type: typeof(StringGraphType));
        }
    }
}
