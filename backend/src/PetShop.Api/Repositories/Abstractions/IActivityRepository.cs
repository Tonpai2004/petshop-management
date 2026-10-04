using PetShop.Api.Domain.Entities;
using PetShop.Api.Domain.Views;

namespace PetShop.Api.Repositories.Abstractions;

public interface IActivityRepository
{
    Task AddAsync(Activity activity, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ActivityView>> GetRecentAsync(int limit, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ActivityView>> GetForEntityAsync(string entityType, int entityId, int limit, CancellationToken cancellationToken = default);
}
