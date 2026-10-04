using Microsoft.Extensions.Options;
using PetShop.Api.Common.Exceptions;
using PetShop.Api.Common.Models;
using PetShop.Api.Configuration;
using PetShop.Api.Contracts.Products;
using PetShop.Api.Domain.Entities;
using PetShop.Api.Domain.Enums;
using PetShop.Api.Repositories.Abstractions;
using PetShop.Api.Services.Abstractions;
using PetShop.Api.Services.Export;
using PetShop.Api.Services.Mapping;
using PetShop.Api.Storage;

namespace PetShop.Api.Services;

public sealed class ProductService : IProductService
{
    private const string PhotoFolder = "products";

    private readonly IProductRepository _products;
    private readonly ICategoryRepository _categories;
    private readonly IActivityService _activity;
    private readonly IFileStorage _files;
    private readonly UploadSettings _uploads;
    private readonly TimeProvider _clock;

    public ProductService(
        IProductRepository products,
        ICategoryRepository categories,
        IActivityService activity,
        IFileStorage files,
        IOptions<UploadSettings> uploads,
        TimeProvider clock)
    {
        _products = products;
        _categories = categories;
        _activity = activity;
        _files = files;
        _uploads = uploads.Value;
        _clock = clock;
    }

    private DateTime UtcNow => _clock.GetUtcNow().UtcDateTime;

    public async Task<PagedResult<ProductResponse>> SearchAsync(ProductQueryParameters query, CancellationToken cancellationToken = default)
    {
        var (items, total) = await _products.SearchAsync(query, cancellationToken);
        return new PagedResult<ProductResponse>(items.Select(p => p.ToResponse()).ToList(), query.Page, query.PageSize, total);
    }

    public async Task<ProductResponse> GetByIdAsync(int id, CancellationToken cancellationToken = default)
    {
        var product = await _products.GetByIdAsync(id, cancellationToken) ?? throw NotFoundException.For("Product", id);
        return product.ToResponse();
    }

    public async Task<ProductResponse> CreateAsync(ProductUpsertRequest request, int userId, CancellationToken cancellationToken = default)
    {
        await EnsureValidAsync(request, null, cancellationToken);

        var now = UtcNow;
        var product = new Product
        {
            CreatedAt = now,
            UpdatedAt = now,
            CreatedBy = userId,
            UpdatedBy = userId
        };
        product.Apply(request);

        var id = await _products.CreateAsync(product, cancellationToken);
        await _activity.LogAsync(userId, ActivityAction.ProductCreated, Activity.ProductEntity, id,
            $"added {product.Name} with {product.StockQuantity} in stock", cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<ProductResponse> UpdateAsync(int id, ProductUpsertRequest request, int userId, CancellationToken cancellationToken = default)
    {
        var existing = await _products.GetByIdAsync(id, cancellationToken) ?? throw NotFoundException.For("Product", id);
        await EnsureValidAsync(request, id, cancellationToken);

        var previousStock = existing.StockQuantity;
        var previousStatus = existing.Status;
        existing.Apply(request);
        existing.UpdatedAt = UtcNow;
        existing.UpdatedBy = userId;

        if (!await _products.UpdateAsync(existing, cancellationToken))
        {
            throw NotFoundException.For("Product", id);
        }

        // Call out the changes people care about most, so the log reads like what actually happened.
        var summary = previousStatus != existing.Status
            ? existing.Status == ProductStatus.Discontinued ? $"discontinued {existing.Name}" : $"brought {existing.Name} back into the range"
            : previousStock != existing.StockQuantity
                ? $"set {existing.Name}'s stock from {previousStock} to {existing.StockQuantity}"
                : $"updated {existing.Name}'s details";
        await _activity.LogAsync(userId, ActivityAction.ProductUpdated, Activity.ProductEntity, id, summary, cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task DeleteAsync(int id, int userId, CancellationToken cancellationToken = default)
    {
        var product = await _products.GetByIdAsync(id, cancellationToken) ?? throw NotFoundException.For("Product", id);

        if (!await _products.DeleteAsync(id, cancellationToken))
        {
            throw NotFoundException.For("Product", id);
        }

        await _files.DeleteAsync(product.ImageUrl, cancellationToken);
        await _activity.LogAsync(userId, ActivityAction.ProductDeleted, Activity.ProductEntity, id, $"removed {product.Name} ({product.Sku})", cancellationToken);
    }

    public async Task<ProductResponse> AdjustStockAsync(int id, StockAdjustmentRequest request, int userId, CancellationToken cancellationToken = default)
    {
        var product = await _products.GetByIdAsync(id, cancellationToken) ?? throw NotFoundException.For("Product", id);

        if (request.QuantityChange == 0)
        {
            throw new ValidationException(nameof(request.QuantityChange), "Enter how many items to add or take away.");
        }

        var newQuantity = await _products.AdjustStockAsync(id, request.QuantityChange, UtcNow, userId, cancellationToken)
            ?? throw new ValidationException(nameof(request.QuantityChange),
                $"There are only {product.StockQuantity} in stock, so you can't take away {Math.Abs(request.QuantityChange)}.");

        var amount = Math.Abs(request.QuantityChange);
        var verb = request.Reason switch
        {
            StockAdjustmentReason.Received => $"received {amount} × {product.Name}",
            StockAdjustmentReason.Sold => $"sold {amount} × {product.Name}",
            StockAdjustmentReason.Damaged => $"wrote off {amount} damaged {product.Name}",
            StockAdjustmentReason.Returned => $"took back {amount} returned {product.Name}",
            _ => $"corrected {product.Name}'s stock by {request.QuantityChange:+#;-#}"
        };
        var note = string.IsNullOrWhiteSpace(request.Note) ? string.Empty : $" ({request.Note.Trim()})";

        await _activity.LogAsync(userId, ActivityAction.StockAdjusted, Activity.ProductEntity, id,
            $"{verb}{note}, {newQuantity} left", cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<ProductResponse> UploadImageAsync(int id, Stream content, long length, int userId, CancellationToken cancellationToken = default)
    {
        var product = await _products.GetByIdAsync(id, cancellationToken) ?? throw NotFoundException.For("Product", id);

        if (length == 0)
        {
            throw new ValidationException("file", "Please choose an image.");
        }

        if (length > _uploads.MaxFileSizeBytes)
        {
            throw new ValidationException("file", $"Images can be up to {_uploads.MaxFileSizeBytes / (1024 * 1024)} MB.");
        }

        // Read it into memory once: we need the first bytes to check the type and the whole thing to save it.
        using var buffer = new MemoryStream();
        await content.CopyToAsync(buffer, cancellationToken);

        var extension = ImageFileInspector.DetectExtension(buffer.GetBuffer().AsSpan(0, (int)Math.Min(buffer.Length, 16)))
            ?? throw new ValidationException("file", "Only JPG, PNG or WebP images are supported.");

        buffer.Position = 0;
        var imageUrl = await _files.SaveAsync(buffer, PhotoFolder, extension, cancellationToken);

        await _products.UpdateImageAsync(id, imageUrl, UtcNow, userId, cancellationToken);
        await _files.DeleteAsync(product.ImageUrl, cancellationToken);
        await _activity.LogAsync(userId, ActivityAction.ProductPhotoChanged, Activity.ProductEntity, id, $"updated {product.Name}'s photo", cancellationToken);

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<ProductResponse> RemoveImageAsync(int id, int userId, CancellationToken cancellationToken = default)
    {
        var product = await _products.GetByIdAsync(id, cancellationToken) ?? throw NotFoundException.For("Product", id);

        if (product.ImageUrl is not null)
        {
            await _products.UpdateImageAsync(id, null, UtcNow, userId, cancellationToken);
            await _files.DeleteAsync(product.ImageUrl, cancellationToken);
            await _activity.LogAsync(userId, ActivityAction.ProductPhotoRemoved, Activity.ProductEntity, id, $"removed {product.Name}'s photo", cancellationToken);
        }

        return await GetByIdAsync(id, cancellationToken);
    }

    public async Task<byte[]> ExportCsvAsync(ProductQueryParameters query, CancellationToken cancellationToken = default) =>
        ProductCsvWriter.Write(await _products.ExportAsync(query, cancellationToken));

    public async Task<InventorySummaryResponse> GetSummaryAsync(CancellationToken cancellationToken = default) =>
        (await _products.GetSummaryAsync(cancellationToken)).ToResponse();

    public async Task<IReadOnlyList<CategoryResponse>> GetCategoriesAsync(CancellationToken cancellationToken = default)
    {
        var categories = await _categories.GetAllAsync(cancellationToken);
        return categories.Select(c => new CategoryResponse(c.Id, c.Name, c.Description)).ToList();
    }

    // Rules that need data, which plain attributes on the request can't express.
    private async Task EnsureValidAsync(ProductUpsertRequest request, int? productId, CancellationToken cancellationToken)
    {
        if (!await _categories.ExistsAsync(request.CategoryId, cancellationToken))
        {
            throw new ValidationException(nameof(request.CategoryId), $"Category {request.CategoryId} doesn't exist.");
        }

        if (await _products.SkuExistsAsync(request.Sku.Trim().ToUpperInvariant(), productId, cancellationToken))
        {
            throw new ValidationException(nameof(request.Sku), "Another product already uses this SKU.");
        }
    }
}
