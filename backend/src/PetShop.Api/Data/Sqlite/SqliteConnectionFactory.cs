using System.Data;
using Microsoft.Data.Sqlite;

namespace PetShop.Api.Data.Sqlite;

/// <summary>
/// Hands out connections to a shared in-memory SQLite database.
/// An in-memory database only lives while at least one connection is open,
/// so we keep one "anchor" connection around for the lifetime of the app.
/// </summary>
public sealed class SqliteConnectionFactory : IDisposable
{
    private readonly string _connectionString;
    private readonly SqliteConnection _anchor;

    public SqliteConnectionFactory()
    {
        // Unique name per instance so integration tests don't end up sharing the same database.
        _connectionString = new SqliteConnectionStringBuilder
        {
            DataSource = $"petshop-{Guid.NewGuid():N}",
            Mode = SqliteOpenMode.Memory,
            Cache = SqliteCacheMode.Shared
        }.ToString();

        _anchor = new SqliteConnection(_connectionString);
        _anchor.Open();
    }

    public async Task<IDbConnection> OpenAsync(CancellationToken cancellationToken = default)
    {
        var connection = new SqliteConnection(_connectionString);
        await connection.OpenAsync(cancellationToken);
        return connection;
    }

    public void Dispose() => _anchor.Dispose();
}
