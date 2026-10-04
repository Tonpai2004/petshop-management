using System.ComponentModel.DataAnnotations;
using PetShop.Api.Domain.Enums;

namespace PetShop.Api.Contracts.Products;

public sealed record StockAdjustmentRequest
{
    /// <summary>Positive to add stock (e.g. a delivery), negative to take it away (e.g. sold or damaged).</summary>
    [Range(-100_000, 100_000)]
    public int QuantityChange { get; init; }

    [Required, EnumDataType(typeof(StockAdjustmentReason))]
    public StockAdjustmentReason? Reason { get; init; }

    [StringLength(200)]
    public string? Note { get; init; }
}
