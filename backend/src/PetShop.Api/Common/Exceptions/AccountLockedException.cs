namespace PetShop.Api.Common.Exceptions;

public sealed class AccountLockedException : AppException
{
    public AccountLockedException(DateTime lockoutEndsAt, DateTime now)
        : base(BuildMessage(lockoutEndsAt, now), StatusCodes.Status423Locked, "Account locked")
    {
        LockoutEndsAt = lockoutEndsAt;
    }

    public DateTime LockoutEndsAt { get; }

    private static string BuildMessage(DateTime lockoutEndsAt, DateTime now)
    {
        var minutes = Math.Max(1, (int)Math.Ceiling((lockoutEndsAt - now).TotalMinutes));
        return $"Too many failed attempts. Please try again in {minutes} minute{(minutes == 1 ? "" : "s")}.";
    }
}
