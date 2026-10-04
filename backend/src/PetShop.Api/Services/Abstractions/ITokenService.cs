using PetShop.Api.Domain.Entities;

namespace PetShop.Api.Services.Abstractions;

public interface ITokenService
{
    (string Token, DateTime ExpiresAt) CreateAccessToken(User user);
}
