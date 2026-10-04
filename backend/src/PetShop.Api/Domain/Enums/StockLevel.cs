namespace PetShop.Api.Domain.Enums;

/// <summary>Worked out from the quantity and the reorder level, never stored.</summary>
public enum StockLevel
{
    InStock = 1,
    LowStock = 2,
    OutOfStock = 3
}
