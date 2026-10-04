using PetShop.Api.Domain.Enums;

namespace PetShop.Api.Domain.Entities;

/// <summary>
/// One line in the audit trail: who did what, to which record, and when.
/// </summary>
public class Activity
{
    public const string ProductEntity = "Product";
    public const string UserEntity = "User";

    public int Id { get; set; }
    public int? UserId { get; set; }
    public ActivityAction Action { get; set; }
    public string EntityType { get; set; } = string.Empty;
    public int? EntityId { get; set; }
    public string Summary { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
