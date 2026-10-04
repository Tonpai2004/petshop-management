using PetShop.Api.Contracts.Products;
using PetShop.Api.Domain.Entities;
using PetShop.Api.Domain.Views;

namespace PetShop.Api.Services.Mapping;

public static class ProductMappings
{
    public static ProductResponse ToResponse(this ProductView product) => new()
    {
        Id = product.Id,
        Sku = product.Sku,
        Name = product.Name,
        Brand = product.Brand,
        CategoryId = product.CategoryId,
        CategoryName = product.CategoryName,
        PetType = product.PetType,
        Unit = product.Unit,
        Price = product.Price,
        StockQuantity = product.StockQuantity,
        ReorderLevel = product.ReorderLevel,
        StockLevel = product.StockLevel,
        Status = product.Status,
        ImageUrl = product.ImageUrl,
        Description = product.Description,
        CreatedAt = product.CreatedAt,
        UpdatedAt = product.UpdatedAt,
        UpdatedByName = product.UpdatedByName
    };

    public static void Apply(this Product product, ProductUpsertRequest request)
    {
        product.Sku = request.Sku.Trim().ToUpperInvariant();
        product.Name = request.Name.Trim();
        product.Brand = request.Brand.Trim();
        product.CategoryId = request.CategoryId;
        product.PetType = request.PetType!.Value;
        product.Unit = NullIfBlank(request.Unit);
        product.Price = request.Price;
        product.StockQuantity = request.StockQuantity;
        product.ReorderLevel = request.ReorderLevel;
        product.Status = request.Status!.Value;
        product.Description = NullIfBlank(request.Description);
    }

    public static InventorySummaryResponse ToResponse(this InventorySummary summary) => new(
        summary.TotalProducts,
        summary.TotalUnits,
        summary.StockValue,
        summary.InStock,
        summary.LowStock,
        summary.OutOfStock,
        summary.Discontinued,
        summary.ByCategory
            .Select(c => new CategoryBreakdownResponse(c.CategoryId, c.CategoryName, c.InStock, c.NeedsRestock, c.StockValue))
            .ToList());

    private static string? NullIfBlank(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
