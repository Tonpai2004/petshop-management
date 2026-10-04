using Dapper;
using PetShop.Api.Data;
using PetShop.Api.Data.Json;
using PetShop.Api.Domain.Entities;
using PetShop.Api.Repositories.Abstractions;

namespace PetShop.Api.Repositories;

public sealed class UserRepository : IUserRepository
{
    private readonly IDbContext _db;

    public UserRepository(IDbContext db) => _db = db;

    public async Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        var rows = await _db.ReadAsync(connection => connection.QueryAsync<User>(
            new CommandDefinition("SELECT * FROM Users ORDER BY Role, FullName", cancellationToken: cancellationToken)),
            cancellationToken);

        return rows.AsList();
    }

    public Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _db.ReadAsync(connection => connection.QuerySingleOrDefaultAsync<User>(
            new CommandDefinition("SELECT * FROM Users WHERE Id = @id", new { id }, cancellationToken: cancellationToken)),
            cancellationToken);

    public Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default) =>
        _db.ReadAsync(connection => connection.QuerySingleOrDefaultAsync<User>(
            new CommandDefinition("SELECT * FROM Users WHERE Username = @username", new { username }, cancellationToken: cancellationToken)),
            cancellationToken);

    public Task<int> CreateAsync(User user, CancellationToken cancellationToken = default)
    {
        const string sql = """
            INSERT INTO Users (Username, PasswordHash, FullName, Role, IsActive, CreatedAt, FailedLoginCount)
            VALUES (@Username, @PasswordHash, @FullName, @Role, @IsActive, @CreatedAt, 0);

            SELECT last_insert_rowid();
            """;

        return _db.WriteAsync([JsonTable.Users], (connection, transaction) =>
            connection.ExecuteScalarAsync<int>(new CommandDefinition(sql, user, transaction, cancellationToken: cancellationToken)),
            cancellationToken);
    }

    public Task SetActiveAsync(int id, bool isActive, CancellationToken cancellationToken = default) =>
        ExecuteAsync("UPDATE Users SET IsActive = @isActive WHERE Id = @id", new { id, isActive }, cancellationToken);

    // A new password also clears any lockout, otherwise an admin reset wouldn't help a locked out user.
    public Task UpdatePasswordAsync(int id, string passwordHash, CancellationToken cancellationToken = default) =>
        ExecuteAsync(
            "UPDATE Users SET PasswordHash = @passwordHash, FailedLoginCount = 0, LockoutEndsAt = NULL WHERE Id = @id",
            new { id, passwordHash },
            cancellationToken);

    public Task RecordSuccessfulLoginAsync(int id, DateTime loggedInAt, CancellationToken cancellationToken = default) =>
        ExecuteAsync(
            "UPDATE Users SET LastLoginAt = @loggedInAt, FailedLoginCount = 0, LockoutEndsAt = NULL WHERE Id = @id",
            new { id, loggedInAt },
            cancellationToken);

    public Task RecordFailedLoginAsync(int id, int failedCount, DateTime? lockoutEndsAt, CancellationToken cancellationToken = default) =>
        ExecuteAsync(
            "UPDATE Users SET FailedLoginCount = @failedCount, LockoutEndsAt = @lockoutEndsAt WHERE Id = @id",
            new { id, failedCount, lockoutEndsAt },
            cancellationToken);

    private Task ExecuteAsync(string sql, object parameters, CancellationToken cancellationToken) =>
        _db.WriteAsync([JsonTable.Users], (connection, transaction) =>
            connection.ExecuteAsync(new CommandDefinition(sql, parameters, transaction, cancellationToken: cancellationToken)),
            cancellationToken);
}
