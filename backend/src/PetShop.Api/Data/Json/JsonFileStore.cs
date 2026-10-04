using System.Collections;
using System.Text.Json;
using System.Text.Json.Serialization;
using Microsoft.Extensions.Options;
using PetShop.Api.Configuration;

namespace PetShop.Api.Data.Json;

/// <summary>
/// Reads and writes the raw JSON "table" files on disk.
/// </summary>
public sealed class JsonFileStore
{
    public static readonly JsonSerializerOptions SerializerOptions = new(JsonSerializerDefaults.Web)
    {
        WriteIndented = true,
        Converters = { new JsonStringEnumConverter() }
    };

    private readonly string _directory;

    public JsonFileStore(IOptions<JsonStorageSettings> options, IWebHostEnvironment environment)
    {
        var configured = options.Value.DataDirectory;
        _directory = Path.IsPathRooted(configured)
            ? configured
            : Path.Combine(environment.ContentRootPath, configured);

        Directory.CreateDirectory(_directory);
    }

    public string DirectoryPath => _directory;

    public bool Exists(JsonTable table) => File.Exists(PathOf(table));

    public async Task<IList> ReadAsync(JsonTable table, CancellationToken cancellationToken = default)
    {
        var listType = typeof(List<>).MakeGenericType(table.EntityType);

        if (!Exists(table))
        {
            return (IList)Activator.CreateInstance(listType)!;
        }

        await using var stream = File.OpenRead(PathOf(table));
        var rows = await JsonSerializer.DeserializeAsync(stream, listType, SerializerOptions, cancellationToken);
        return (IList?)rows ?? (IList)Activator.CreateInstance(listType)!;
    }

    public async Task WriteAsync(JsonTable table, IEnumerable rows, CancellationToken cancellationToken = default)
    {
        var target = PathOf(table);
        var temp = target + ".tmp";

        // Write to a temp file first and then swap it in, so a crash halfway through
        // never leaves us with a half-written table.
        await using (var stream = File.Create(temp))
        {
            await JsonSerializer.SerializeAsync(stream, rows, rows.GetType(), SerializerOptions, cancellationToken);
        }

        File.Move(temp, target, overwrite: true);
    }

    private string PathOf(JsonTable table) => Path.Combine(_directory, table.FileName);
}
