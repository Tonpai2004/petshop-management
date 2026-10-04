using System.Globalization;
using System.Text;
using PetShop.Api.Domain.Enums;
using PetShop.Api.Domain.Views;

namespace PetShop.Api.Services.Export;

public static class ProductCsvWriter
{
    private static readonly string[] Header =
    [
        "SKU", "Name", "Brand", "Category", "For", "Unit", "Price (THB)", "In stock",
        "Reorder level", "Stock status", "Stock value (THB)", "Status", "Last updated (UTC)", "Updated by"
    ];

    public static byte[] Write(IEnumerable<ProductView> products)
    {
        var csv = new StringBuilder();
        csv.AppendLine(string.Join(',', Header));

        foreach (var product in products)
        {
            csv.AppendLine(string.Join(',',
                Escape(product.Sku),
                Escape(product.Name),
                Escape(product.Brand),
                Escape(product.CategoryName),
                product.PetType == PetType.SmallPet ? "Small pet" : product.PetType == PetType.AllPets ? "All pets" : product.PetType.ToString(),
                Escape(product.Unit),
                product.Price.ToString("0.00", CultureInfo.InvariantCulture),
                product.StockQuantity.ToString(CultureInfo.InvariantCulture),
                product.ReorderLevel.ToString(CultureInfo.InvariantCulture),
                product.StockLevel switch
                {
                    StockLevel.OutOfStock => "Out of stock",
                    StockLevel.LowStock => "Low stock",
                    _ => "In stock"
                },
                (product.Price * product.StockQuantity).ToString("0.00", CultureInfo.InvariantCulture),
                product.Status.ToString(),
                product.UpdatedAt.ToString("yyyy-MM-dd HH:mm", CultureInfo.InvariantCulture),
                Escape(product.UpdatedByName)));
        }

        // The BOM makes Excel open the file as UTF-8, so Thai text shows up properly.
        return Encoding.UTF8.GetPreamble().Concat(Encoding.UTF8.GetBytes(csv.ToString())).ToArray();
    }

    private static string Escape(string? value)
    {
        if (string.IsNullOrEmpty(value))
        {
            return string.Empty;
        }

        // A leading = + - @ would make Excel treat the cell as a formula.
        if ("=+-@".Contains(value[0]))
        {
            value = "'" + value;
        }

        return value.IndexOfAny([',', '"', '\n', '\r']) >= 0
            ? $"\"{value.Replace("\"", "\"\"")}\""
            : value;
    }
}
