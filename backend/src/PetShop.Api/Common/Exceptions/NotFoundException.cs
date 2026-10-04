namespace PetShop.Api.Common.Exceptions;

public sealed class NotFoundException : AppException
{
    public NotFoundException(string message)
        : base(message, StatusCodes.Status404NotFound, "Resource not found")
    {
    }

    public static NotFoundException For(string resource, object key) =>
        new($"{resource} with id '{key}' was not found.");
}
