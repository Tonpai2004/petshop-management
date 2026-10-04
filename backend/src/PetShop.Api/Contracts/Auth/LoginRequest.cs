using System.ComponentModel.DataAnnotations;

namespace PetShop.Api.Contracts.Auth;

public sealed record LoginRequest
{
    [Required, StringLength(50)]
    public string Username { get; init; } = string.Empty;

    [Required, StringLength(100)]
    public string Password { get; init; } = string.Empty;
}
