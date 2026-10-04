using FluentAssertions;
using PetShop.Api.Contracts.Products;
using PetShop.Api.Domain.Entities;
using PetShop.Api.Domain.Enums;

namespace PetShop.Api.Tests.Unit;

public sealed class ProductMappingsTests
{
    [Theory]
    [InlineData(0, 5, StockLevel.OutOfStock)]
    [InlineData(3, 5, StockLevel.LowStock)]
    [InlineData(5, 5, StockLevel.LowStock)]
    [InlineData(6, 5, StockLevel.InStock)]
    [InlineData(1, 0, StockLevel.InStock)]
    public void Stock_level_comes_from_quantity_and_reorder_level(int quantity, int reorderLevel, StockLevel expected)
    {
        var product = new Product { StockQuantity = quantity, ReorderLevel = reorderLevel };

        product.StockLevel.Should().Be(expected);
    }

    [Fact]
    public void Apply_tidies_up_text_and_turns_blank_optional_fields_into_null()
    {
        var product = new Product();
        var request = new ProductUpsertRequest
        {
            Sku = " fd-test-1 ",
            Name = "  Puppy Food  ",
            Brand = " Pedigree ",
            CategoryId = 1,
            PetType = PetType.Dog,
            Unit = "   ",
            Price = 235m,
            StockQuantity = 10,
            ReorderLevel = 2,
            Status = ProductStatus.Active,
            Description = " Chicken & milk "
        };

        Services.Mapping.ProductMappings.Apply(product, request);

        product.Sku.Should().Be("FD-TEST-1");
        product.Name.Should().Be("Puppy Food");
        product.Brand.Should().Be("Pedigree");
        product.Unit.Should().BeNull();
        product.Description.Should().Be("Chicken & milk");
    }
}
