namespace PetShop.Api.Storage;

public interface IFileStorage
{
    /// <summary>Saves the file and returns the public path it can be downloaded from, e.g. /uploads/products/abc.webp</summary>
    Task<string> SaveAsync(Stream content, string folder, string extension, CancellationToken cancellationToken = default);

    Task DeleteAsync(string? publicPath, CancellationToken cancellationToken = default);
}
