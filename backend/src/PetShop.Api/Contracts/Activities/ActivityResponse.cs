using PetShop.Api.Domain.Enums;

namespace PetShop.Api.Contracts.Activities;

public sealed record ActivityResponse(
    int Id,
    ActivityAction Action,
    string EntityType,
    int? EntityId,
    string Summary,
    string? UserFullName,
    DateTime CreatedAt);
