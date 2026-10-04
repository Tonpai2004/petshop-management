using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using PetShop.Api.Common.Models;
using PetShop.Api.Contracts.Activities;
using PetShop.Api.Contracts.Products;
using PetShop.Api.Domain.Enums;
using PetShop.Api.Security;
using PetShop.Api.Services;
using PetShop.Api.Services.Abstractions;

namespace PetShop.Api.Controllers;

/// <summary>
/// CRUD for the shop's products, plus stock, photos, export and the lookups the dashboard needs.
/// </summary>
[ApiController]
[Route("api/products")]
[Authorize]
[Produces("application/json")]
[ProducesResponseType(StatusCodes.Status401Unauthorized)]
public sealed class ProductsController : ControllerBase
{
    private readonly IProductService _productService;
    private readonly IActivityService _activityService;

    public ProductsController(IProductService productService, IActivityService activityService)
    {
        _productService = productService;
        _activityService = activityService;
    }

    /// <summary>Lists products with search, filters, sorting and paging.</summary>
    [HttpGet]
    [ProducesResponseType<PagedResult<ProductResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<PagedResult<ProductResponse>>> Search([FromQuery] ProductQueryParameters query, CancellationToken cancellationToken) =>
        Ok(await _productService.SearchAsync(query, cancellationToken));

    [HttpGet("{id:int}")]
    [ProducesResponseType<ProductResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductResponse>> GetById(int id, CancellationToken cancellationToken) =>
        Ok(await _productService.GetByIdAsync(id, cancellationToken));

    [HttpPost]
    [ProducesResponseType<ProductResponse>(StatusCodes.Status201Created)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    public async Task<ActionResult<ProductResponse>> Create(ProductUpsertRequest request, CancellationToken cancellationToken)
    {
        var product = await _productService.CreateAsync(request, User.GetUserId(), cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = product.Id }, product);
    }

    [HttpPut("{id:int}")]
    [ProducesResponseType<ProductResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductResponse>> Update(int id, ProductUpsertRequest request, CancellationToken cancellationToken) =>
        Ok(await _productService.UpdateAsync(id, request, User.GetUserId(), cancellationToken));

    /// <summary>Deletes a product. Admins only.</summary>
    [HttpDelete("{id:int}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    [ProducesResponseType(StatusCodes.Status204NoContent)]
    [ProducesResponseType(StatusCodes.Status403Forbidden)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<IActionResult> Delete(int id, CancellationToken cancellationToken)
    {
        await _productService.DeleteAsync(id, User.GetUserId(), cancellationToken);
        return NoContent();
    }

    /// <summary>Adds or removes stock, e.g. a delivery came in or items were sold or damaged.</summary>
    [HttpPost("{id:int}/stock")]
    [ProducesResponseType<ProductResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductResponse>> AdjustStock(int id, StockAdjustmentRequest request, CancellationToken cancellationToken) =>
        Ok(await _productService.AdjustStockAsync(id, request, User.GetUserId(), cancellationToken));

    /// <summary>Uploads or replaces the product photo (JPG, PNG or WebP).</summary>
    [HttpPost("{id:int}/image")]
    [Consumes("multipart/form-data")]
    [RequestSizeLimit(10 * 1024 * 1024)]
    [ProducesResponseType<ProductResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ValidationProblemDetails>(StatusCodes.Status400BadRequest)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductResponse>> UploadImage(int id, IFormFile file, CancellationToken cancellationToken)
    {
        await using var stream = file.OpenReadStream();
        return Ok(await _productService.UploadImageAsync(id, stream, file.Length, User.GetUserId(), cancellationToken));
    }

    [HttpDelete("{id:int}/image")]
    [ProducesResponseType<ProductResponse>(StatusCodes.Status200OK)]
    [ProducesResponseType<ProblemDetails>(StatusCodes.Status404NotFound)]
    public async Task<ActionResult<ProductResponse>> RemoveImage(int id, CancellationToken cancellationToken) =>
        Ok(await _productService.RemoveImageAsync(id, User.GetUserId(), cancellationToken));

    /// <summary>Downloads the products that match the filters as a CSV file. Paging is ignored.</summary>
    [HttpGet("export")]
    [Produces("text/csv")]
    [ProducesResponseType<FileContentResult>(StatusCodes.Status200OK)]
    public async Task<IActionResult> Export([FromQuery] ProductQueryParameters query, CancellationToken cancellationToken)
    {
        var csv = await _productService.ExportCsvAsync(query, cancellationToken);
        return File(csv, "text/csv; charset=utf-8", $"products-{DateTime.UtcNow:yyyyMMdd-HHmm}.csv");
    }

    /// <summary>Headline numbers for the dashboard cards and chart.</summary>
    [HttpGet("summary")]
    [ProducesResponseType<InventorySummaryResponse>(StatusCodes.Status200OK)]
    public async Task<ActionResult<InventorySummaryResponse>> Summary(CancellationToken cancellationToken) =>
        Ok(await _productService.GetSummaryAsync(cancellationToken));

    [HttpGet("categories")]
    [ProducesResponseType<IReadOnlyList<CategoryResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<CategoryResponse>>> Categories(CancellationToken cancellationToken) =>
        Ok(await _productService.GetCategoriesAsync(cancellationToken));

    /// <summary>Latest activity across the shop, newest first.</summary>
    [HttpGet("activity")]
    [ProducesResponseType<IReadOnlyList<ActivityResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ActivityResponse>>> RecentActivity([FromQuery] int limit = 15, CancellationToken cancellationToken = default) =>
        Ok(await _activityService.GetRecentAsync(Math.Min(limit, ActivityService.MaxLimit), cancellationToken));

    /// <summary>History of one product, newest first.</summary>
    [HttpGet("{id:int}/activity")]
    [ProducesResponseType<IReadOnlyList<ActivityResponse>>(StatusCodes.Status200OK)]
    public async Task<ActionResult<IReadOnlyList<ActivityResponse>>> ProductActivity(int id, [FromQuery] int limit = 20, CancellationToken cancellationToken = default) =>
        Ok(await _activityService.GetForProductAsync(id, limit, cancellationToken));
}
