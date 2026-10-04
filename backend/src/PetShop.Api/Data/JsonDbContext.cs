using System.Data;
using Dapper;
using PetShop.Api.Data.Json;
using PetShop.Api.Data.Sqlite;

namespace PetShop.Api.Data;

/// <summary>
/// The JSON files are the source of truth, SQLite is just the query engine so Dapper has a real
/// ADO.NET connection to work with. On startup every file is loaded into memory, and every write
/// is pushed back out to its file right after the transaction commits.
/// </summary>
public sealed class JsonDbContext : IDbContext, IDisposable
{
    private readonly SqliteConnectionFactory _connectionFactory;
    private readonly JsonFileStore _fileStore;
    private readonly ILogger<JsonDbContext> _logger;

    // Shared-cache in-memory SQLite uses table level locks and the files can't be written
    // concurrently either, so we simply let one operation through at a time.
    // That's plenty for a mock database.
    private readonly SemaphoreSlim _gate = new(1, 1);

    public JsonDbContext(SqliteConnectionFactory connectionFactory, JsonFileStore fileStore, ILogger<JsonDbContext> logger)
    {
        _connectionFactory = connectionFactory;
        _fileStore = fileStore;
        _logger = logger;
    }

    public async Task InitializeAsync(CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            using var connection = await _connectionFactory.OpenAsync(cancellationToken);
            await connection.ExecuteAsync(DatabaseSchema.CreateTables);

            foreach (var table in JsonTable.All)
            {
                var rows = await _fileStore.ReadAsync(table, cancellationToken);
                await connection.ExecuteAsync($"DELETE FROM {table.Name}");

                if (rows.Count > 0)
                {
                    await connection.ExecuteAsync(table.InsertSql, rows);
                }

                _logger.LogInformation("Loaded {Count} row(s) into {Table} from {File}", rows.Count, table.Name, table.FileName);
            }
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<T> ReadAsync<T>(Func<IDbConnection, Task<T>> query, CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            using var connection = await _connectionFactory.OpenAsync(cancellationToken);
            return await query(connection);
        }
        finally
        {
            _gate.Release();
        }
    }

    public async Task<T> WriteAsync<T>(
        IReadOnlyCollection<JsonTable> tables,
        Func<IDbConnection, IDbTransaction, Task<T>> command,
        CancellationToken cancellationToken = default)
    {
        await _gate.WaitAsync(cancellationToken);
        try
        {
            using var connection = await _connectionFactory.OpenAsync(cancellationToken);

            T result;
            using (var transaction = connection.BeginTransaction())
            {
                result = await command(connection, transaction);
                transaction.Commit();
            }

            foreach (var table in tables)
            {
                await FlushAsync(connection, table, cancellationToken);
            }

            return result;
        }
        finally
        {
            _gate.Release();
        }
    }

    private async Task FlushAsync(IDbConnection connection, JsonTable table, CancellationToken cancellationToken)
    {
        var rows = (await connection.QueryAsync(table.EntityType, $"SELECT * FROM {table.Name} ORDER BY Id")).ToList();
        await _fileStore.WriteAsync(table, rows, cancellationToken);
    }

    public void Dispose() => _gate.Dispose();
}
