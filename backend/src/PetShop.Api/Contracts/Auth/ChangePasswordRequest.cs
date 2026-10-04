using System.ComponentModel.DataAnnotations;
using PetShop.Api.Common.Validation;

namespace PetShop.Api.Contracts.Auth;

public sealed record ChangePasswordRequest
{
    [Required]
    public string CurrentPassword { get; init; } = string.Empty;

    [Required, StrongPassword, StringLength(100)]
    public string NewPassword { get; init; } = string.Empty;
}
