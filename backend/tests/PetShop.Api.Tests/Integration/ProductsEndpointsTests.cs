using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentAssertions;
using PetShop.Api.Common.Models;
using PetShop.Api.Contracts.Activities;
using PetShop.Api.Contracts.Products;
using PetShop.Api.Domain.Enums;
using PetShop.Api.Tests.Infrastructure;

namespace PetShop.Api.Tests.Integration;

public sealed class ProductsEndpointsTests : IClassFixture<PetShopApiFactory>
{
    private readonly PetShopApiFactory _factory;

    public ProductsEndpointsTests(PetShopApiFactory factory) => _factory = factory;

    private static object NewProduct(string sku, string name = "Test Kibble", int categoryId = 1, int stock = 10) => new
    {
        sku,
        name,
        brand = "Test Brand",
        categoryId,
        petType = "Dog",
        unit = "2 kg bag",
        price = 499.50m,
        stockQuantity = stock,
        reorderLevel = 3,
        status = "Active"
    };

    [Fact]
    public async Task Product_endpoints_require_a_token()
    {
        var response = await _factory.CreateClient().GetAsync("/api/products");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Search_returns_paged_results()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();

        var page = await client.GetFromJsonAsync<PagedResult<ProductResponse>>("/api/products?page=1&pageSize=5", HttpClientExtensions.Json);

        page!.Items.Should().HaveCount(5);
        page.TotalItems.Should().BeGreaterThanOrEqualTo(24);
        page.HasNextPage.Should().BeTrue();
    }

    [Fact]
    public async Task Search_matches_name_brand_and_sku()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();

        var byBrand = await client.GetFromJsonAsync<PagedResult<ProductResponse>>("/api/products?search=royal canin", HttpClientExtensions.Json);
        var bySku = await client.GetFromJsonAsync<PagedResult<ProductResponse>>("/api/products?search=TR-CIAO", HttpClientExtensions.Json);

        byBrand!.Items.Should().ContainSingle().Which.Sku.Should().Be("FD-RC-MINI-15");
        bySku!.Items.Should().ContainSingle().Which.Brand.Should().Be("Ciao");
    }

    [Fact]
    public async Task Stock_level_filter_finds_low_and_out_of_stock_items()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();

        var outOfStock = await client.GetFromJsonAsync<PagedResult<ProductResponse>>("/api/products?stockLevel=OutOfStock&pageSize=100", HttpClientExtensions.Json);
        var low = await client.GetFromJsonAsync<PagedResult<ProductResponse>>("/api/products?stockLevel=LowStock&pageSize=100", HttpClientExtensions.Json);

        outOfStock!.Items.Should().NotBeEmpty().And.OnlyContain(p => p.StockQuantity == 0 && p.StockLevel == StockLevel.OutOfStock);
        low!.Items.Should().NotBeEmpty().And.OnlyContain(p => p.StockQuantity > 0 && p.StockQuantity <= p.ReorderLevel);
    }

    [Fact]
    public async Task Pet_type_filter_includes_products_for_all_pets()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();

        var page = await client.GetFromJsonAsync<PagedResult<ProductResponse>>("/api/products?petType=Cat&pageSize=100", HttpClientExtensions.Json);

        page!.Items.Should().OnlyContain(p => p.PetType == PetType.Cat || p.PetType == PetType.AllPets);
        page.Items.Should().Contain(p => p.PetType == PetType.AllPets);
    }

    [Fact]
    public async Task Search_sorts_by_stock()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();

        var page = await client.GetFromJsonAsync<PagedResult<ProductResponse>>("/api/products?sortBy=stock&sortDirection=asc&pageSize=100", HttpClientExtensions.Json);

        page!.Items.Select(p => p.StockQuantity).Should().BeInAscendingOrder();
    }

    [Fact]
    public async Task Full_crud_round_trip_is_persisted_to_the_json_file()
    {
        var client = await _factory.CreateClient().SignInAsAdminAsync();

        var created = await client.PostAsJsonAsync("/api/products", NewProduct("test-crud-1", "Round Trip Kibble"));
        created.StatusCode.Should().Be(HttpStatusCode.Created);
        var product = await created.ReadAsAsync<ProductResponse>();
        created.Headers.Location!.ToString().Should().EndWith($"/api/products/{product.Id}");
        product.Sku.Should().Be("TEST-CRUD-1");
        product.Price.Should().Be(499.50m);
        product.CategoryName.Should().Be("Food");

        var updated = await client.PutAsJsonAsync($"/api/products/{product.Id}", NewProduct("TEST-CRUD-1", "Round Trip Kibble Updated"));
        updated.StatusCode.Should().Be(HttpStatusCode.OK);
        (await updated.ReadAsAsync<ProductResponse>()).Name.Should().Be("Round Trip Kibble Updated");

        var fileContent = await File.ReadAllTextAsync(Path.Combine(_factory.DataDirectory, "products.json"));
        fileContent.Should().Contain("Round Trip Kibble Updated").And.NotContain("stockLevel");

        var deleted = await client.DeleteAsync($"/api/products/{product.Id}");
        deleted.StatusCode.Should().Be(HttpStatusCode.NoContent);

        (await client.GetAsync($"/api/products/{product.Id}")).StatusCode.Should().Be(HttpStatusCode.NotFound);
        fileContent = await File.ReadAllTextAsync(Path.Combine(_factory.DataDirectory, "products.json"));
        fileContent.Should().NotContain("Round Trip Kibble Updated");
    }

    [Fact]
    public async Task Duplicate_sku_is_rejected()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();

        var response = await client.PostAsJsonAsync("/api/products", NewProduct("fd-rc-mini-15"));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var problem = await response.ReadAsAsync<JsonElement>();
        problem.GetProperty("errors").TryGetProperty("sku", out _).Should().BeTrue();
    }

    [Fact]
    public async Task Create_with_unknown_category_returns_validation_error()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();

        var response = await client.PostAsJsonAsync("/api/products", NewProduct("TEST-CAT-999", categoryId: 999));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        var problem = await response.ReadAsAsync<JsonElement>();
        problem.GetProperty("errors").TryGetProperty("categoryId", out _).Should().BeTrue();
    }

    [Fact]
    public async Task Create_with_missing_fields_returns_validation_error()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();

        var response = await client.PostAsJsonAsync("/api/products", new { name = "" });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Stock_can_be_received_and_sold_but_never_goes_below_zero()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();
        var product = await (await client.PostAsJsonAsync("/api/products", NewProduct("TEST-STOCK-1", "Stock Test", stock: 5))).ReadAsAsync<ProductResponse>();

        var received = await client.PostAsJsonAsync($"/api/products/{product.Id}/stock", new { quantityChange = 20, reason = "Received" });
        var sold = await client.PostAsJsonAsync($"/api/products/{product.Id}/stock", new { quantityChange = -24, reason = "Sold" });
        var oversold = await client.PostAsJsonAsync($"/api/products/{product.Id}/stock", new { quantityChange = -5, reason = "Sold" });

        (await received.ReadAsAsync<ProductResponse>()).StockQuantity.Should().Be(25);
        var afterSale = await sold.ReadAsAsync<ProductResponse>();
        afterSale.StockQuantity.Should().Be(1);
        afterSale.StockLevel.Should().Be(StockLevel.LowStock);
        oversold.StatusCode.Should().Be(HttpStatusCode.BadRequest);

        var history = await client.GetFromJsonAsync<List<ActivityResponse>>($"/api/products/{product.Id}/activity", HttpClientExtensions.Json);
        history!.Take(2).Should().OnlyContain(a => a.Action == ActivityAction.StockAdjusted);
        history.First().Summary.Should().Contain("sold 24").And.Contain("1 left");
    }

    [Fact]
    public async Task Staff_cannot_delete_products()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();

        var response = await client.DeleteAsync("/api/products/1");

        response.StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Updating_a_missing_product_returns_404()
    {
        var client = await _factory.CreateClient().SignInAsAdminAsync();

        var response = await client.PutAsJsonAsync("/api/products/99999", NewProduct("TEST-MISSING"));

        response.StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Summary_counts_add_up()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();

        var summary = await client.GetFromJsonAsync<InventorySummaryResponse>("/api/products/summary", HttpClientExtensions.Json);

        summary!.TotalProducts.Should().Be(summary.InStock + summary.LowStock + summary.OutOfStock);
        summary.ByCategory.Sum(c => c.InStock + c.NeedsRestock).Should().Be(summary.TotalProducts);
        summary.Discontinued.Should().BeGreaterThan(0);
        summary.StockValue.Should().BeGreaterThan(0);
    }

    [Fact]
    public async Task Categories_are_listed()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();

        var categories = await client.GetFromJsonAsync<List<CategoryResponse>>("/api/products/categories", HttpClientExtensions.Json);

        categories!.Select(c => c.Name).Should().Contain(["Food", "Toys", "Grooming"]);
    }
}
