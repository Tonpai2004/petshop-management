namespace PetShop.Api.Domain.Views;

public sealed class InventorySummary
{
    public int TotalProducts { get; set; }
    public int TotalUnits { get; set; }
    public decimal StockValue { get; set; }
    public int InStock { get; set; }
    public int LowStock { get; set; }
    public int OutOfStock { get; set; }
    public int Discontinued { get; set; }
    public IReadOnlyList<CategoryBreakdown> ByCategory { get; set; } = [];
}

public sealed class CategoryBreakdown
{
    public int CategoryId { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public int InStock { get; set; }
    public int NeedsRestock { get; set; }
    public decimal StockValue { get; set; }
}
