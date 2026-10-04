using PetShop.Api.Contracts.Activities;
using PetShop.Api.Domain.Entities;
using PetShop.Api.Domain.Enums;
using PetShop.Api.Domain.Views;
using PetShop.Api.Repositories.Abstractions;
using PetShop.Api.Services.Abstractions;

namespace PetShop.Api.Services;

public sealed class ActivityService : IActivityService
{
    public const int MaxLimit = 100;

    private readonly IActivityRepository _activities;
    private readonly TimeProvider _clock;
    private readonly ILogger<ActivityService> _logger;

    public ActivityService(IActivityRepository activities, TimeProvider clock, ILogger<ActivityService> logger)
    {
        _activities = activities;
        _clock = clock;
        _logger = logger;
    }

    public async Task LogAsync(int? userId, ActivityAction action, string entityType, int? entityId, string summary, CancellationToken cancellationToken = default)
    {
        try
        {
            await _activities.AddAsync(new Activity
            {
                UserId = userId,
                Action = action,
                EntityType = entityType,
                EntityId = entityId,
                Summary = summary,
                CreatedAt = _clock.GetUtcNow().UtcDateTime
            }, cancellationToken);
        }
        catch (Exception ex) when (ex is not OperationCanceledException)
        {
            // The real change already went through. A missing log line shouldn't turn it into an error for the user.
            _logger.LogError(ex, "Couldn't write activity {Action} for {EntityType} {EntityId}", action, entityType, entityId);
        }
    }

    public async Task<IReadOnlyList<ActivityResponse>> GetRecentAsync(int limit, CancellationToken cancellationToken = default) =>
        (await _activities.GetRecentAsync(Clamp(limit), cancellationToken)).Select(ToResponse).ToList();

    public async Task<IReadOnlyList<ActivityResponse>> GetForProductAsync(int productId, int limit, CancellationToken cancellationToken = default) =>
        (await _activities.GetForEntityAsync(Activity.ProductEntity, productId, Clamp(limit), cancellationToken)).Select(ToResponse).ToList();

    private static int Clamp(int limit) => Math.Clamp(limit, 1, MaxLimit);

    private static ActivityResponse ToResponse(ActivityView a) =>
        new(a.Id, a.Action, a.EntityType, a.EntityId, a.Summary, a.UserFullName, a.CreatedAt);
}
