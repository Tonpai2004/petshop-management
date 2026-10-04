using PetShop.Api.Domain.Entities;

namespace PetShop.Api.Domain.Views;

public sealed class ActivityView : Activity
{
    public string? UserFullName { get; set; }
}
