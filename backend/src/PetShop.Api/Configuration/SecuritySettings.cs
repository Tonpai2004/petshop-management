using System.ComponentModel.DataAnnotations;

namespace PetShop.Api.Configuration;

public sealed class SecuritySettings
{
    public const string SectionName = "Security";
    public const string LoginRateLimitPolicy = "login";

    /// <summary>Wrong passwords in a row before the account is locked.</summary>
    [Range(3, 20)]
    public int MaxFailedLoginAttempts { get; init; } = 5;

    [Range(1, 1440)]
    public int LockoutMinutes { get; init; } = 5;

    /// <summary>Login requests one IP address can make per minute, whatever the username.</summary>
    [Range(1, 10_000)]
    public int LoginRequestsPerMinute { get; init; } = 10;
}
