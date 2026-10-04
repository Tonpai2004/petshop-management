using Dapper;
using PetShop.Api.Data;
using PetShop.Api.Data.Json;
using PetShop.Api.Domain.Entities;
using PetShop.Api.Domain.Views;
using PetShop.Api.Repositories.Abstractions;

namespace PetShop.Api.Repositories;

public sealed class ActivityRepository : IActivityRepository
{
    private const string SelectActivityView = """
        SELECT a.*, u.FullName AS UserFullName
        FROM Activities a
        LEFT JOIN Users u ON u.Id = a.UserId
        """;

    private readonly IDbContext _db;

    public ActivityRepository(IDbContext db) => _db = db;

    public Task AddAsync(Activity activity, CancellationToken cancellationToken = default)
    {
        const string sql = """
            INSERT INTO Activities (UserId, Action, EntityType, EntityId, Summary, CreatedAt)
            VALUES (@UserId, @Action, @EntityType, @EntityId, @Summary, @CreatedAt)
            """;

        return _db.WriteAsync([JsonTable.Activities], (connection, transaction) =>
            connection.ExecuteAsync(new CommandDefinition(sql, activity, transaction, cancellationToken: cancellationToken)),
            cancellationToken);
    }

    public async Task<IReadOnlyList<ActivityView>> GetRecentAsync(int limit, CancellationToken cancellationToken = default)
    {
        var rows = await _db.ReadAsync(connection => connection.QueryAsync<ActivityView>(
            new CommandDefinition($"{SelectActivityView} ORDER BY a.CreatedAt DESC, a.Id DESC LIMIT @limit", new { limit }, cancellationToken: cancellationToken)),
            cancellationToken);

        return rows.AsList();
    }

    public async Task<IReadOnlyList<ActivityView>> GetForEntityAsync(string entityType, int entityId, int limit, CancellationToken cancellationToken = default)
    {
        var rows = await _db.ReadAsync(connection => connection.QueryAsync<ActivityView>(
            new CommandDefinition(
                $"{SelectActivityView} WHERE a.EntityType = @entityType AND a.EntityId = @entityId ORDER BY a.CreatedAt DESC, a.Id DESC LIMIT @limit",
                new { entityType, entityId, limit },
                cancellationToken: cancellationToken)),
            cancellationToken);

        return rows.AsList();
    }
}
