using System.Text.Json.Serialization;
using PetShop.Api.Domain.Enums;

namespace PetShop.Api.Domain.Entities;

public class Product
{
    public int Id { get; set; }
    public string Sku { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public PetType PetType { get; set; }
    public string? Unit { get; set; }
    public decimal Price { get; set; }
    public int StockQuantity { get; set; }
    public int ReorderLevel { get; set; }
    public ProductStatus Status { get; set; }
    public string? ImageUrl { get; set; }
    public string? Description { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime UpdatedAt { get; set; }
    public int CreatedBy { get; set; }
    public int UpdatedBy { get; set; }

    // Derived, so it stays out of the JSON table file.
    [JsonIgnore]
    public StockLevel StockLevel =>
        StockQuantity <= 0 ? StockLevel.OutOfStock
        : StockQuantity <= ReorderLevel ? StockLevel.LowStock
        : StockLevel.InStock;
}
