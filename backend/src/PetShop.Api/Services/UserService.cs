using PetShop.Api.Common.Exceptions;
using PetShop.Api.Contracts.Users;
using PetShop.Api.Domain.Entities;
using PetShop.Api.Domain.Enums;
using PetShop.Api.Repositories.Abstractions;
using PetShop.Api.Security;
using PetShop.Api.Services.Abstractions;

namespace PetShop.Api.Services;

/// <summary>
/// Team management for admins: add staff, switch accounts off and on, reset passwords.
/// </summary>
public sealed class UserService : IUserService
{
    private readonly IUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IActivityService _activity;
    private readonly TimeProvider _clock;

    public UserService(IUserRepository users, IPasswordHasher passwordHasher, IActivityService activity, TimeProvider clock)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _activity = activity;
        _clock = clock;
    }

    private DateTime UtcNow => _clock.GetUtcNow().UtcDateTime;

    public async Task<IReadOnlyList<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default) =>
        (await _users.GetAllAsync(cancellationToken)).Select(ToResponse).ToList();

    public async Task<UserResponse> CreateAsync(CreateUserRequest request, int actorId, CancellationToken cancellationToken = default)
    {
        var username = request.Username.Trim().ToLowerInvariant();

        if (await _users.GetByUsernameAsync(username, cancellationToken) is not null)
        {
            throw new ValidationException(nameof(request.Username), "That username is already taken.");
        }

        var user = new User
        {
            Username = username,
            FullName = request.FullName.Trim(),
            PasswordHash = _passwordHasher.Hash(request.Password),
            Role = request.Role!.Value,
            IsActive = true,
            CreatedAt = UtcNow
        };

        user.Id = await _users.CreateAsync(user, cancellationToken);
        await _activity.LogAsync(actorId, ActivityAction.UserCreated, Activity.UserEntity, user.Id,
            $"added {user.FullName} as {user.Role.ToString().ToLowerInvariant()}", cancellationToken);

        return ToResponse(user);
    }

    public async Task<UserResponse> SetActiveAsync(int userId, bool isActive, int actorId, CancellationToken cancellationToken = default)
    {
        if (userId == actorId && !isActive)
        {
            throw new ValidationException("isActive", "You can't disable your own account.");
        }

        var user = await _users.GetByIdAsync(userId, cancellationToken) ?? throw NotFoundException.For("User", userId);

        if (user.IsActive != isActive)
        {
            await _users.SetActiveAsync(userId, isActive, cancellationToken);
            await _activity.LogAsync(actorId, isActive ? ActivityAction.UserEnabled : ActivityAction.UserDisabled, Activity.UserEntity, userId,
                $"{(isActive ? "re-enabled" : "disabled")} {user.FullName}'s account", cancellationToken);
            user.IsActive = isActive;
        }

        return ToResponse(user);
    }

    public async Task ResetPasswordAsync(int userId, ResetPasswordRequest request, int actorId, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdAsync(userId, cancellationToken) ?? throw NotFoundException.For("User", userId);

        await _users.UpdatePasswordAsync(userId, _passwordHasher.Hash(request.NewPassword), cancellationToken);
        await _activity.LogAsync(actorId, ActivityAction.PasswordReset, Activity.UserEntity, userId,
            $"reset {user.FullName}'s password", cancellationToken);
    }

    private UserResponse ToResponse(User user) =>
        new(user.Id, user.Username, user.FullName, user.Role, user.IsActive,
            user.LockoutEndsAt > UtcNow, user.CreatedAt, user.LastLoginAt);
}
