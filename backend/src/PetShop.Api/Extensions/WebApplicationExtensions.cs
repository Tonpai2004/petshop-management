using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using PetShop.Api.Configuration;
using PetShop.Api.Data;
using PetShop.Api.Data.Seed;
using PetShop.Api.Storage;

namespace PetShop.Api.Extensions;

public static class WebApplicationExtensions
{
    public static async Task InitializeDatabaseAsync(this WebApplication app)
    {
        await app.Services.GetRequiredService<DataSeeder>().SeedAsync();
        await app.Services.GetRequiredService<JsonDbContext>().InitializeAsync();
    }

    /// <summary>Serves uploaded photos from /uploads.</summary>
    public static WebApplication UseUploadedFiles(this WebApplication app)
    {
        var settings = app.Services.GetRequiredService<IOptions<UploadSettings>>().Value;
        var root = LocalFileStorage.ResolveRoot(settings, app.Environment);
        Directory.CreateDirectory(root);

        app.UseStaticFiles(new StaticFileOptions
        {
            FileProvider = new PhysicalFileProvider(root),
            RequestPath = UploadSettings.RequestPath,
            OnPrepareResponse = context =>
            {
                // File names are random and never reused, so browsers can cache them for a long time.
                context.Context.Response.Headers.CacheControl = "public, max-age=604800, immutable";
                context.Context.Response.Headers.XContentTypeOptions = "nosniff";
            }
        });

        return app;
    }
}
