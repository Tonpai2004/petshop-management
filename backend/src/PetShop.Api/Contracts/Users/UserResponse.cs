using PetShop.Api.Domain.Enums;

namespace PetShop.Api.Contracts.Users;

public sealed record UserResponse(
    int Id,
    string Username,
    string FullName,
    UserRole Role,
    bool IsActive,
    bool IsLocked,
    DateTime CreatedAt,
    DateTime? LastLoginAt);
