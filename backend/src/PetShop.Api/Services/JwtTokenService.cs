using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using PetShop.Api.Configuration;
using PetShop.Api.Domain.Entities;
using PetShop.Api.Security;
using PetShop.Api.Services.Abstractions;

namespace PetShop.Api.Services;

public sealed class JwtTokenService : ITokenService
{
    private readonly JwtSettings _settings;
    private readonly TimeProvider _clock;

    public JwtTokenService(IOptions<JwtSettings> settings, TimeProvider clock)
    {
        _settings = settings.Value;
        _clock = clock;
    }

    public (string Token, DateTime ExpiresAt) CreateAccessToken(User user)
    {
        var now = _clock.GetUtcNow().UtcDateTime;
        var expiresAt = now.AddMinutes(_settings.ExpiryMinutes);

        var claims = new[]
        {
            new Claim(AppClaimTypes.UserId, user.Id.ToString()),
            new Claim(AppClaimTypes.Username, user.Username),
            new Claim(AppClaimTypes.FullName, user.FullName),
            new Claim(AppClaimTypes.Role, user.Role.ToString()),
            new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString("N"))
        };

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_settings.Secret));

        var token = new JwtSecurityToken(
            issuer: _settings.Issuer,
            audience: _settings.Audience,
            claims: claims,
            notBefore: now,
            expires: expiresAt,
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return (new JwtSecurityTokenHandler().WriteToken(token), expiresAt);
    }
}
