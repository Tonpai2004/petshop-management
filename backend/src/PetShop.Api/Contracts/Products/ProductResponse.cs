using PetShop.Api.Domain.Enums;

namespace PetShop.Api.Contracts.Products;

public sealed record ProductResponse
{
    public int Id { get; init; }
    public string Sku { get; init; } = string.Empty;
    public string Name { get; init; } = string.Empty;
    public string Brand { get; init; } = string.Empty;
    public int CategoryId { get; init; }
    public string CategoryName { get; init; } = string.Empty;
    public PetType PetType { get; init; }
    public string? Unit { get; init; }
    public decimal Price { get; init; }
    public int StockQuantity { get; init; }
    public int ReorderLevel { get; init; }
    public StockLevel StockLevel { get; init; }
    public ProductStatus Status { get; init; }
    public string? ImageUrl { get; init; }
    public string? Description { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime UpdatedAt { get; init; }
    public string? UpdatedByName { get; init; }
}
