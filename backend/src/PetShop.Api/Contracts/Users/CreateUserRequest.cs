using System.ComponentModel.DataAnnotations;
using PetShop.Api.Common.Validation;
using PetShop.Api.Domain.Enums;

namespace PetShop.Api.Contracts.Users;

public sealed record CreateUserRequest
{
    [Required, StringLength(50, MinimumLength = 3)]
    [RegularExpression("^[a-zA-Z0-9._-]+$", ErrorMessage = "Use letters, numbers, dots, dashes or underscores only.")]
    public string Username { get; init; } = string.Empty;

    [Required, StringLength(100)]
    public string FullName { get; init; } = string.Empty;

    [Required, StrongPassword, StringLength(100)]
    public string Password { get; init; } = string.Empty;

    [Required, EnumDataType(typeof(UserRole))]
    public UserRole? Role { get; init; }
}
