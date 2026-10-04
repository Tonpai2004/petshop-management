using System.Security.Claims;
using PetShop.Api.Common.Exceptions;

namespace PetShop.Api.Security;

public static class ClaimsPrincipalExtensions
{
    public static int GetUserId(this ClaimsPrincipal principal)
    {
        var value = principal.FindFirstValue(AppClaimTypes.UserId);

        return int.TryParse(value, out var userId)
            ? userId
            : throw new UnauthorizedException("The access token does not contain a valid user id.");
    }
}
