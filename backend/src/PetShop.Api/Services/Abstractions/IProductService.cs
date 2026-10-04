using PetShop.Api.Common.Models;
using PetShop.Api.Contracts.Products;

namespace PetShop.Api.Services.Abstractions;

public interface IProductService
{
    Task<PagedResult<ProductResponse>> SearchAsync(ProductQueryParameters query, CancellationToken cancellationToken = default);
    Task<ProductResponse> GetByIdAsync(int id, CancellationToken cancellationToken = default);
    Task<ProductResponse> CreateAsync(ProductUpsertRequest request, int userId, CancellationToken cancellationToken = default);
    Task<ProductResponse> UpdateAsync(int id, ProductUpsertRequest request, int userId, CancellationToken cancellationToken = default);
    Task DeleteAsync(int id, int userId, CancellationToken cancellationToken = default);
    Task<ProductResponse> AdjustStockAsync(int id, StockAdjustmentRequest request, int userId, CancellationToken cancellationToken = default);
    Task<ProductResponse> UploadImageAsync(int id, Stream content, long length, int userId, CancellationToken cancellationToken = default);
    Task<ProductResponse> RemoveImageAsync(int id, int userId, CancellationToken cancellationToken = default);
    Task<byte[]> ExportCsvAsync(ProductQueryParameters query, CancellationToken cancellationToken = default);
    Task<InventorySummaryResponse> GetSummaryAsync(CancellationToken cancellationToken = default);
    Task<IReadOnlyList<CategoryResponse>> GetCategoriesAsync(CancellationToken cancellationToken = default);
}
