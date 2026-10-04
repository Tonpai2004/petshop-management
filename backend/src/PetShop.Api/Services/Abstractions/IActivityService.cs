using PetShop.Api.Contracts.Activities;
using PetShop.Api.Domain.Enums;

namespace PetShop.Api.Services.Abstractions;

public interface IActivityService
{
    Task LogAsync(int? userId, ActivityAction action, string entityType, int? entityId, string summary, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ActivityResponse>> GetRecentAsync(int limit, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ActivityResponse>> GetForProductAsync(int productId, int limit, CancellationToken cancellationToken = default);
}
