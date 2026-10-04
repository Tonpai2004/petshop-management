using PetShop.Api.Domain.Entities;

namespace PetShop.Api.Repositories.Abstractions;

public interface IUserRepository
{
    Task<IReadOnlyList<User>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<User?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<User?> GetByUsernameAsync(string username, CancellationToken cancellationToken = default);
    Task<int> CreateAsync(User user, CancellationToken cancellationToken = default);
    Task SetActiveAsync(int id, bool isActive, CancellationToken cancellationToken = default);
    Task UpdatePasswordAsync(int id, string passwordHash, CancellationToken cancellationToken = default);
    Task RecordSuccessfulLoginAsync(int id, DateTime loggedInAt, CancellationToken cancellationToken = default);
    Task RecordFailedLoginAsync(int id, int failedCount, DateTime? lockoutEndsAt, CancellationToken cancellationToken = default);
}
