using PetShop.Api.Domain.Enums;

namespace PetShop.Api.Contracts.Auth;

public sealed record UserProfileResponse(int Id, string Username, string FullName, UserRole Role);
