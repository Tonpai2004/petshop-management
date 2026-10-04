using PetShop.Api.Domain.Entities;

namespace PetShop.Api.Domain.Views;

/// <summary>
/// A product joined with the bits of related data the UI needs to display it.
/// </summary>
public sealed class ProductView : Product
{
    public string CategoryName { get; set; } = string.Empty;
    public string? UpdatedByName { get; set; }
}
