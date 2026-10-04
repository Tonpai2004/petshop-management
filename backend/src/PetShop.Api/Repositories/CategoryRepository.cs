using Dapper;
using PetShop.Api.Data;
using PetShop.Api.Domain.Entities;
using PetShop.Api.Repositories.Abstractions;

namespace PetShop.Api.Repositories;

public sealed class CategoryRepository : ICategoryRepository
{
    private readonly IDbContext _db;

    public CategoryRepository(IDbContext db) => _db = db;

    public async Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _db.ReadAsync(connection => connection.QueryAsync<Category>(
            new CommandDefinition("SELECT * FROM Categories ORDER BY Id", cancellationToken: cancellationToken)),
            cancellationToken);

        return rows.AsList();
    }

    public Task<bool> ExistsAsync(int id, CancellationToken cancellationToken = default) =>
        _db.ReadAsync(connection => connection.ExecuteScalarAsync<bool>(
            new CommandDefinition("SELECT EXISTS (SELECT 1 FROM Categories WHERE Id = @id)", new { id }, cancellationToken: cancellationToken)),
            cancellationToken);
}
