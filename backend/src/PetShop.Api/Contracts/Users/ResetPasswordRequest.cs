using System.ComponentModel.DataAnnotations;
using PetShop.Api.Common.Validation;

namespace PetShop.Api.Contracts.Users;

public sealed record ResetPasswordRequest
{
    [Required, StrongPassword, StringLength(100)]
    public string NewPassword { get; init; } = string.Empty;
}
