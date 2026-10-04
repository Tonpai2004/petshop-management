using System.ComponentModel.DataAnnotations;

namespace PetShop.Api.Common.Validation;

/// <summary>
/// At least 8 characters with an uppercase letter, a lowercase letter and a number.
/// </summary>
[AttributeUsage(AttributeTargets.Property)]
public sealed class StrongPasswordAttribute : ValidationAttribute
{
    public const int MinimumLength = 8;

    public StrongPasswordAttribute()
        : base("Password needs at least 8 characters, including an uppercase letter, a lowercase letter and a number.")
    {
    }

    public override bool IsValid(object? value) =>
        value is string password
        && password.Length >= MinimumLength
        && password.Any(char.IsUpper)
        && password.Any(char.IsLower)
        && password.Any(char.IsDigit);
}
