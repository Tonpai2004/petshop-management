using PetShop.Api.Configuration;
using PetShop.Api.Extensions;
using PetShop.Api.Middleware;

var builder = WebApplication.CreateBuilder(args);

builder.Services
    .AddApiControllers()
    .AddPersistence(builder.Configuration)
    .AddApplicationServices(builder.Configuration)
    .AddJwtAuthentication(builder.Configuration)
    .AddLoginProtection(builder.Configuration)
    .AddFrontendCors(builder.Configuration)
    .AddSwaggerDocs();

var app = builder.Build();

await app.InitializeDatabaseAsync();

app.UseMiddleware<ExceptionHandlingMiddleware>();
app.UseStatusCodePages();

if (!app.Environment.IsProduction())
{
    app.UseSwagger();
    app.UseSwaggerUI(options => options.DocumentTitle = "One Pet Shop API");
}

app.UseUploadedFiles();
app.UseCors(CorsSettings.PolicyName);
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapHealthChecks("/health");

app.Run();

// Lets the integration tests spin the API up with WebApplicationFactory.
public partial class Program;
