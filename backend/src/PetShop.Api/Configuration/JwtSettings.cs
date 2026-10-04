using System.ComponentModel.DataAnnotations;

namespace PetShop.Api.Configuration;

public sealed class JwtSettings
{
    public const string SectionName = "Jwt";

    [Required]
    public string Issuer { get; init; } = string.Empty;

    [Required]
    public string Audience { get; init; } = string.Empty;

    // HS256 needs at least 256 bits, so anything shorter than 32 chars gets rejected on startup.
    [Required, MinLength(32)]
    public string Secret { get; init; } = string.Empty;

    [Range(5, 1440)]
    public int ExpiryMinutes { get; init; } = 120;
}
