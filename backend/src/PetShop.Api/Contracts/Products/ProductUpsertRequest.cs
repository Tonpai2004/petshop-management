using System.ComponentModel.DataAnnotations;
using PetShop.Api.Domain.Enums;

namespace PetShop.Api.Contracts.Products;

// Create and update take exactly the same payload, so one request model covers both.
// The photo has its own upload endpoint, so it isn't part of this payload.
public sealed record ProductUpsertRequest
{
    [Required, StringLength(30, MinimumLength = 3)]
    [RegularExpression("^[A-Za-z0-9-]+$", ErrorMessage = "Use letters, numbers and dashes only.")]
    public string Sku { get; init; } = string.Empty;

    [Required, StringLength(150)]
    public string Name { get; init; } = string.Empty;

    [Required, StringLength(80)]
    public string Brand { get; init; } = string.Empty;

    [Range(1, int.MaxValue, ErrorMessage = "Please choose a category.")]
    public int CategoryId { get; init; }

    [Required, EnumDataType(typeof(PetType))]
    public PetType? PetType { get; init; }

    /// <summary>Pack size as printed on the shelf label, e.g. "1.5 kg bag" or "Pack of 3".</summary>
    [StringLength(50)]
    public string? Unit { get; init; }

    [Range(0, 1_000_000, ErrorMessage = "Price must be between 0 and 1,000,000.")]
    public decimal Price { get; init; }

    [Range(0, 1_000_000, ErrorMessage = "Stock must be between 0 and 1,000,000.")]
    public int StockQuantity { get; init; }

    [Range(0, 100_000, ErrorMessage = "Reorder level must be between 0 and 100,000.")]
    public int ReorderLevel { get; init; }

    [Required, EnumDataType(typeof(ProductStatus))]
    public ProductStatus? Status { get; init; }

    [StringLength(1000)]
    public string? Description { get; init; }
}
