using System.ComponentModel.DataAnnotations;
using PetShop.Api.Domain.Enums;

namespace PetShop.Api.Contracts.Products;

public sealed record ProductQueryParameters
{
    public const int MaxPageSize = 100;

    /// <summary>Matches name, brand or SKU.</summary>
    [StringLength(100)]
    public string? Search { get; init; }

    public int? CategoryId { get; init; }

    [EnumDataType(typeof(PetType))]
    public PetType? PetType { get; init; }

    [EnumDataType(typeof(StockLevel))]
    public StockLevel? StockLevel { get; init; }

    [EnumDataType(typeof(ProductStatus))]
    public ProductStatus? Status { get; init; }

    [Range(1, int.MaxValue)]
    public int Page { get; init; } = 1;

    [Range(1, MaxPageSize)]
    public int PageSize { get; init; } = 10;

    /// <summary>name, price, stock, createdAt or updatedAt</summary>
    public string? SortBy { get; init; }

    /// <summary>asc or desc</summary>
    public string? SortDirection { get; init; }
}
