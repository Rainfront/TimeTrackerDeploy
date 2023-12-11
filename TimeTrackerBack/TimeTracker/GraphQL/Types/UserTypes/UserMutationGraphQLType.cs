﻿using GraphQL;
using GraphQL.Types;
using TimeTracker.Models;
using TimeTracker.Repositories;
using TimeTracker.Services;

namespace TimeTracker.GraphQL.Types.UserTypes
{
    public class UserMutationGraphQLType : ObjectGraphType
    {
        private readonly IUserRepository repo;

        public UserMutationGraphQLType(IUserRepository Repo, IEmailSender emailSender)
        {
            repo = Repo;

            Field<StringGraphType>("createUser")
                .Argument<NonNullGraphType<UserInputGraphType>>("User")
                .Argument<NonNullGraphType<PermissionsInputGraphType>>("Permissions")
                .ResolveAsync(async context =>
                {
                    var user = context.GetArgument<User>("User");
                    var permissions = context.GetArgument<Permissions>("Permissions");
                    string code = Guid.NewGuid().ToString();
                    user.ResetCode = code;
                    user.Password = code;
                    repo.CreateUser(user, permissions);
                    emailSender.SendRegistrationEmail(code, user.Email);
                    return "User created successfully";
                });//.AuthorizeWithPolicy("CRUDUsers");

            Field<StringGraphType>("updateUser")
                .Argument<NonNullGraphType<IntGraphType>>("Id")
                .Argument<NonNullGraphType<UserInputGraphType>>("User")
                .ResolveAsync(async context =>
                {
                    var Id = context.GetArgument<int>("Id");
                    var NewUser = context.GetArgument<User>("User");
                    if (!repo.ComparePasswords(Id, NewUser.Password)) return "Password is incorrect";
                    if (repo.GetUserByEmailOrLogin(NewUser.Login) != null && repo.GetUser(Id).Login != NewUser.Login) return "Login is already used";
                    NewUser.Id = Id;
                    repo.UpdateUser(NewUser);
                    return "User updated successfully";
                });

            Field<StringGraphType>("registerUserByCode")
                .Argument<NonNullGraphType<StringGraphType>>("Code")
                .Argument<NonNullGraphType<StringGraphType>>("Login")
                .Argument<NonNullGraphType<StringGraphType>>("Password")
                .Argument<NonNullGraphType<StringGraphType>>("Email")
                .ResolveAsync(async context =>
                {
                    string code = context.GetArgument<string>("Code");
                    string login = context.GetArgument<string>("Login");
                    string password = context.GetArgument<string>("Password");
                    string email = context.GetArgument<string>("Email");
                    User? user = repo.GetUserByEmailOrLogin(email);
                    if (user == null) return "User not found";
                    if (user.ResetCode == null) return "User was not created for registration";
                    if (user.ResetCode != code) return "Reset code not match";
                    if (repo.GetUserByEmailOrLogin(login) != null) return "Login is already used";
                    user.Login = login;
                    user.Password = password;
                    repo.UpdateRegisteredUserAndCode(user);
                    return "Registered successfully";
                });

            Field<StringGraphType>("updateUserPassword")
                .Argument<NonNullGraphType<IntGraphType>>("Id")
                .Argument<NonNullGraphType<StringGraphType>>("Password")
                .Argument<NonNullGraphType<StringGraphType>>("NewPassword")
                .ResolveAsync(async context =>
                {
                    var Id = context.GetArgument<int>("Id");
                    var Password = context.GetArgument<string>("Password");
                    var NewPassword = context.GetArgument<string>("NewPassword");
                    if (!repo.ComparePasswords(Id, Password)) return "Password is incorrect";
                    repo.UpdateUserPassword(Id, NewPassword);
                    return "Password updated successfully";
                });



            Field<StringGraphType>("updateUserPermissions")
                .Argument<NonNullGraphType<PermissionsInputGraphType>>("Permissions")
                .ResolveAsync(async context =>
                {
                    var permissions = context.GetArgument<Permissions>("Permissions");
                    repo.UpdateUserPermissions(permissions);
                    return "Permissions updated successfully";
                }).AuthorizeWithPolicy("CRUDUsers");

            Field<StringGraphType>("disableUser")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .ResolveAsync(async context =>
                {
                    int id = context.GetArgument<int>("id");
                    repo.DisableUser(id);
                    return "User deleted successfully";
                }).AuthorizeWithPolicy("CRUDUsers");

            Field<StringGraphType>("deleteUser")
                .Argument<NonNullGraphType<IntGraphType>>("id")
                .ResolveAsync(async context =>
                {
                    int id = context.GetArgument<int>("id");
                    repo.DeleteUser(id);
                    return "User deleted successfully";
                }).AuthorizeWithPolicy("CRUDUsers");
        }
    }
}
