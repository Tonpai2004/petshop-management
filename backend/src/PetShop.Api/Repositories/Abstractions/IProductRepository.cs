using PetShop.Api.Contracts.Products;
using PetShop.Api.Domain.Entities;
using PetShop.Api.Domain.Views;

namespace PetShop.Api.Repositories.Abstractions;

public interface IProductRepository
{
    Task<(IReadOnlyList<ProductView> Items, int TotalItems)> SearchAsync(ProductQueryParameters query, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<ProductView>> ExportAsync(ProductQueryParameters query, CancellationToken cancellationToken = default);
    Task<ProductView?> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<bool> SkuExistsAsync(string sku, int? excludeId, CancellationToken cancellationToken = default);
    Task<int> CreateAsync(Product product, CancellationToken cancellationToken = default);
    Task<bool> UpdateAsync(Product product, CancellationToken cancellationToken = default);
    Task<int?> AdjustStockAsync(int id, int quantityChange, DateTime updatedAt, int updatedBy, CancellationToken cancellationToken = default);
    Task<bool> UpdateImageAsync(int id, string? imageUrl, DateTime updatedAt, int updatedBy, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default);
    Task<InventorySummary> GetSummaryAsync(CancellationToken cancellationToken = default);
}
