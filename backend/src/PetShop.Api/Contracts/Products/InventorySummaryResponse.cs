namespace PetShop.Api.Contracts.Products;

public sealed record InventorySummaryResponse(
    int TotalProducts,
    int TotalUnits,
    decimal StockValue,
    int InStock,
    int LowStock,
    int OutOfStock,
    int Discontinued,
    IReadOnlyList<CategoryBreakdownResponse> ByCategory);

public sealed record CategoryBreakdownResponse(int CategoryId, string CategoryName, int InStock, int NeedsRestock, decimal StockValue);
