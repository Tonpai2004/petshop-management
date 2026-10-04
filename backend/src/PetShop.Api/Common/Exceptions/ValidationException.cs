using System.Text.Json;

namespace PetShop.Api.Common.Exceptions;

public sealed class ValidationException : AppException
{
    public ValidationException(string field, string message)
        : base(message, StatusCodes.Status400BadRequest, "One or more validation errors occurred.")
    {
        // Keep keys camelCase so they match the JSON body and the model validation errors.
        Errors = new Dictionary<string, string[]> { [JsonNamingPolicy.CamelCase.ConvertName(field)] = [message] };
    }

    public IReadOnlyDictionary<string, string[]> Errors { get; }
}
