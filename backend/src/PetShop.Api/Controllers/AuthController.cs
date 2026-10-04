using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using PetShop.Api.Configuration;
using PetShop.Api.Contracts.Auth;
using PetShop.Api.Contracts.Users;
using PetShop.Api.Domain.Enums;
using PetShop.Api.Security;
using PetShop.Api.Services.Abstractions;

namespace PetShop.Api.Controllers;

/// <summary>
/// Signing in, the signed-in user's own account, and team management for admins.
/// </summary>
[ApiController]
[Route("api/auth")]
[Produces("application/json")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _authService;
    private readonly IUserService _userService;

    public AuthController(IAuthService authService, IUserService userService)
    {
        _authService = authService;
        _userService = userService;
    }

    /// <summary>Signs a user in and returns a JWT access token.</summary>
    [HttpPost("login")]
    [AllowAnonymous]
    [EnableRateLimiting(SecuritySettings.LoginRateLimitPolicy)]
    [ProducesResponseType<LoginResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status401Unauthorized)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status423Locked)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status429TooManyRequests)]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest request, CancellationToken cancellationToken) =>
        Ok(await _authService.LoginAsync(request, cancellationToken));

    /// <summary>Returns the profile of the signed-in user.</summary>
    [HttpGet("me")]
    [Authorize]
    [ProducesResponseType<UserProfileResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status401Unauthorized)]
    public async Task<ActionResult<UserProfileResponse>> Me(CancellationToken cancellationToken) =>
        Ok(await _authService.GetProfileAsync(User.GetUserId(), cancellationToken));

    /// <summary>Changes the signed-in user's own password.</summary>
    [HttpPost("change-password")]
    [Authorize]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<IActionResult> ChangePassword(ChangePasswordRequest request, CancellationToken cancellationToken)
    {
        await _authService.ChangePasswordAsync(User.GetUserId(), request, cancellationToken);
        return NoContent();
    }

    /// <summary>Lists every account. Admins only.</summary>
    [HttpGet("users")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    [ProducesResponseType<IReadOnlyList<UserResponse>>(StatusCodes.Status200OK)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<IReadOnlyList<UserResponse>>> GetUsers(CancellationToken cancellationToken) =>
        Ok(await _userService.GetAllAsync(cancellationToken));

    /// <summary>Adds a new team member. Admins only.</summary>
    [HttpPost("users")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    [ProducesResponseType<UserResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    public async Task<ActionResult<UserResponse>> CreateUser(CreateUserRequest request, CancellationToken cancellationToken)
    {
        var user = await _userService.CreateAsync(request, User.GetUserId(), cancellationToken);
        return StatusCode(StatusCodes.Status201Created, user);
    }

    /// <summary>Switches an account off or back on. Admins only.</summary>
    [HttpPatch("users/{id:int}/status")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    [ProducesResponseType<UserResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<UserResponse>> UpdateUserStatus(int id, UpdateUserStatusRequest request, CancellationToken cancellationToken) =>
        Ok(await _userService.SetActiveAsync(id, request.IsActive, User.GetUserId(), cancellationToken));

    /// <summary>Sets a new password for a team member and unlocks the account. Admins only.</summary>
    [HttpPost("users/{id:int}/reset-password")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> ResetPassword(int id, ResetPasswordRequest request, CancellationToken cancellationToken)
    {
        await _userService.ResetPasswordAsync(id, request, User.GetUserId(), cancellationToken);
        return NoContent();
    }
}
