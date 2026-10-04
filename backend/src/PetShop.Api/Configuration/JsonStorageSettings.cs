using System.ComponentModel.DataAnnotations;

namespace PetShop.Api.Configuration;

public sealed class JsonStorageSettings
{
    public const string SectionName = "JsonStorage";

    // Relative paths are resolved from the content root.
    [Required]
    public string DataDirectory { get; init; } = "Database";

    public bool SeedWhenEmpty { get; init; } = true;
}
