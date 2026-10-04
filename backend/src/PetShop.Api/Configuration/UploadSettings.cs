using System.ComponentModel.DataAnnotations;

namespace PetShop.Api.Configuration;

public sealed class UploadSettings
{
    public const string SectionName = "Uploads";
    public const string RequestPath = "/uploads";

    // Relative paths are resolved from the content root.
    [Required]
    public string Directory { get; init; } = "Uploads";

    [Range(1, 20 * 1024 * 1024)]
    public long MaxFileSizeBytes { get; init; } = 5 * 1024 * 1024;
}
