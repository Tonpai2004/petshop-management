using System.Data;
using PetShop.Api.Data.Json;

namespace PetShop.Api.Data;

public interface IDbContext
{
    Task<T> ReadAsync<T>(Func<IDbConnection, Task<T>> query, CancellationToken cancellationToken = default);

    /// <summary>
    /// Runs the work inside a transaction and, once committed, flushes the touched tables back to their JSON files.
    /// </summary>
    Task<T> WriteAsync<T>(
        IReadOnlyCollection<JsonTable> tables,
        Func<IDbConnection, IDbTransaction, Task<T>> command,
        CancellationToken cancellationToken = default);
}
