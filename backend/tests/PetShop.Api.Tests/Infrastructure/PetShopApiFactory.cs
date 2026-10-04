using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc.Testing;

namespace PetShop.Api.Tests.Infrastructure;

/// <summary>
/// Boots the real API against a throwaway data folder, so tests never touch the repo's JSON files.
/// </summary>
public class PetShopApiFactory : WebApplicationFactory<Program>
{
    private readonly string _root = Path.Combine(Path.GetTempPath(), "petshop-tests", Guid.NewGuid().ToString("N"));

    public string DataDirectory => Path.Combine(_root, "data");
    public string UploadsDirectory => Path.Combine(_root, "uploads");

    protected override void ConfigureWebHost(IWebHostBuilder builder)
    {
        builder.UseEnvironment("Testing");
        builder.UseSetting("JsonStorage:DataDirectory", DataDirectory);
        builder.UseSetting("JsonStorage:SeedWhenEmpty", "true");
        builder.UseSetting("Uploads:Directory", UploadsDirectory);
        builder.UseSetting("Jwt:Secret", "integration-test-secret-0123456789abcdefghijkl");
        // Tests sign in a lot from the same "IP", so the per-minute limit is lifted here and tested on its own.
        builder.UseSetting("Security:LoginRequestsPerMinute", "1000");
    }

    protected override void Dispose(bool disposing)
    {
        base.Dispose(disposing);

        if (Directory.Exists(_root))
        {
            Directory.Delete(_root, recursive: true);
        }
    }
}
