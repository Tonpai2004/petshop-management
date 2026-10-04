using System.IdentityModel.Tokens.Jwt;

namespace PetShop.Api.Security;

// We keep the short JWT claim names instead of the long .NET URIs, so the tokens stay readable on jwt.io.
public static class AppClaimTypes
{
    public const string UserId = JwtRegisteredClaimNames.Sub;
    public const string Username = JwtRegisteredClaimNames.UniqueName;
    public const string FullName = JwtRegisteredClaimNames.Name;
    public const string Role = "role";
}
