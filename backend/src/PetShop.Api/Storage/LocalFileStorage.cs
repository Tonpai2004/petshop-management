using Microsoft.Extensions.Options;
using PetShop.Api.Configuration;

namespace PetShop.Api.Storage;

/// <summary>
/// Keeps uploads on the local disk and serves them as static files.
/// Swapping this for S3 or Azure Blob later only means writing another IFileStorage.
/// </summary>
public sealed class LocalFileStorage : IFileStorage
{
    private readonly string _root;
    private readonly ILogger<LocalFileStorage> _logger;

    public LocalFileStorage(IOptions<UploadSettings> options, IWebHostEnvironment environment, ILogger<LocalFileStorage> logger)
    {
        _root = ResolveRoot(options.Value, environment);
        _logger = logger;
        Directory.CreateDirectory(_root);
    }

    public static string ResolveRoot(UploadSettings settings, IWebHostEnvironment environment) =>
        Path.IsPathRooted(settings.Directory)
            ? settings.Directory
            : Path.Combine(environment.ContentRootPath, settings.Directory);

    public async Task<string> SaveAsync(Stream content, string folder, string extension, CancellationToken cancellationToken = default)
    {
        var directory = Path.Combine(_root, folder);
        Directory.CreateDirectory(directory);

        // Random file names: nobody can guess other uploads, and we never trust the original name.
        var fileName = $"{Guid.NewGuid():N}{extension}";
        await using (var file = File.Create(Path.Combine(directory, fileName)))
        {
            await content.CopyToAsync(file, cancellationToken);
        }

        return $"{UploadSettings.RequestPath}/{folder}/{fileName}";
    }

    public Task DeleteAsync(string? publicPath, CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(publicPath) || !publicPath.StartsWith(UploadSettings.RequestPath + "/", StringComparison.Ordinal))
        {
            return Task.CompletedTask;
        }

        var relative = publicPath[(UploadSettings.RequestPath.Length + 1)..].Replace('/', Path.DirectorySeparatorChar);
        var fullPath = Path.GetFullPath(Path.Combine(_root, relative));

        // Never delete anything outside the uploads folder, whatever the stored path says.
        if (fullPath.StartsWith(Path.GetFullPath(_root), StringComparison.Ordinal) && File.Exists(fullPath))
        {
            File.Delete(fullPath);
            _logger.LogInformation("Deleted upload {Path}", publicPath);
        }

        return Task.CompletedTask;
    }
}
