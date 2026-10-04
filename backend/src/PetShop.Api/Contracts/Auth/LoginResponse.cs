namespace PetShop.Api.Contracts.Auth;

public sealed record LoginResponse(
    string AccessToken,
    string TokenType,
    DateTime ExpiresAt,
    UserProfileResponse User);
