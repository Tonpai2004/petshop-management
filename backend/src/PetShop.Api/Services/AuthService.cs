using Microsoft.Extensions.Options;
using PetShop.Api.Common.Exceptions;
using PetShop.Api.Configuration;
using PetShop.Api.Contracts.Auth;
using PetShop.Api.Domain.Entities;
using PetShop.Api.Domain.Enums;
using PetShop.Api.Repositories.Abstractions;
using PetShop.Api.Security;
using PetShop.Api.Services.Abstractions;

namespace PetShop.Api.Services;

public sealed class AuthService : IAuthService
{
    private const string InvalidCredentialsMessage = "Invalid username or password.";

    // Used when the username doesn't exist so the response time looks the same either way,
    // otherwise you could tell which usernames are real just by timing the requests.
    private static readonly string DummyHash = BCrypt.Net.BCrypt.HashPassword("not-a-real-password", 11);

    private readonly IUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenService _tokenService;
    private readonly IActivityService _activity;
    private readonly SecuritySettings _security;
    private readonly TimeProvider _clock;
    private readonly ILogger<AuthService> _logger;

    public AuthService(
        IUserRepository users,
        IPasswordHasher passwordHasher,
        ITokenService tokenService,
        IActivityService activity,
        IOptions<SecuritySettings> security,
        TimeProvider clock,
        ILogger<AuthService> logger)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _tokenService = tokenService;
        _activity = activity;
        _security = security.Value;
        _clock = clock;
        _logger = logger;
    }

    private DateTime UtcNow => _clock.GetUtcNow().UtcDateTime;

    public async Task<LoginResponse> LoginAsync(LoginRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByUsernameAsync(request.Username.Trim(), cancellationToken);

        if (user is null)
        {
            _passwordHasher.Verify(request.Password, DummyHash);
            throw new UnauthorizedException(InvalidCredentialsMessage);
        }

        if (user.LockoutEndsAt > UtcNow)
        {
            throw new AccountLockedException(user.LockoutEndsAt.Value, UtcNow);
        }

        if (!_passwordHasher.Verify(request.Password, user.PasswordHash))
        {
            await RegisterFailedAttemptAsync(user, cancellationToken);
            throw new UnauthorizedException(InvalidCredentialsMessage);
        }

        // Only tell people the account is disabled once they've proven they know the password.
        if (!user.IsActive)
        {
            throw new UnauthorizedException("This account has been disabled. Please contact your administrator.");
        }

        await _users.RecordSuccessfulLoginAsync(user.Id, UtcNow, cancellationToken);
        await _activity.LogAsync(user.Id, ActivityAction.SignedIn, Activity.UserEntity, user.Id, "signed in", cancellationToken);

        var (token, expiresAt) = _tokenService.CreateAccessToken(user);
        return new LoginResponse(token, "Bearer", expiresAt, ToProfile(user));
    }

    public async Task<UserProfileResponse> GetProfileAsync(int userId, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdAsync(userId, cancellationToken);

        if (user is null || !user.IsActive)
        {
            throw new UnauthorizedException("This account no longer exists or has been disabled.");
        }

        return ToProfile(user);
    }

    public async Task ChangePasswordAsync(int userId, ChangePasswordRequest request, CancellationToken cancellationToken = default)
    {
        var user = await _users.GetByIdAsync(userId, cancellationToken)
            ?? throw new UnauthorizedException("This account no longer exists.");

        if (!_passwordHasher.Verify(request.CurrentPassword, user.PasswordHash))
        {
            throw new ValidationException(nameof(request.CurrentPassword), "Your current password isn't right.");
        }

        if (request.CurrentPassword == request.NewPassword)
        {
            throw new ValidationException(nameof(request.NewPassword), "Pick a password that's different from the current one.");
        }

        await _users.UpdatePasswordAsync(user.Id, _passwordHasher.Hash(request.NewPassword), cancellationToken);
        await _activity.LogAsync(user.Id, ActivityAction.PasswordChanged, Activity.UserEntity, user.Id, "changed their password", cancellationToken);
    }

    private async Task RegisterFailedAttemptAsync(User user, CancellationToken cancellationToken)
    {
        var failedCount = user.FailedLoginCount + 1;
        _logger.LogWarning("Failed login attempt {Count} for {Username}", failedCount, user.Username);

        if (failedCount < _security.MaxFailedLoginAttempts)
        {
            await _users.RecordFailedLoginAsync(user.Id, failedCount, null, cancellationToken);
            return;
        }

        var lockoutEndsAt = UtcNow.AddMinutes(_security.LockoutMinutes);
        await _users.RecordFailedLoginAsync(user.Id, 0, lockoutEndsAt, cancellationToken);
        await _activity.LogAsync(
            null,
            ActivityAction.AccountLocked,
            Activity.UserEntity,
            user.Id,
            $"locked {user.FullName}'s account after {_security.MaxFailedLoginAttempts} failed sign-in attempts",
            cancellationToken);

        throw new AccountLockedException(lockoutEndsAt, UtcNow);
    }

    private static UserProfileResponse ToProfile(User user) =>
        new(user.Id, user.Username, user.FullName, user.Role);
}
