using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text;
using FluentAssertions;
using PetShop.Api.Contracts.Activities;
using PetShop.Api.Contracts.Products;
using PetShop.Api.Domain.Enums;
using PetShop.Api.Tests.Infrastructure;

namespace PetShop.Api.Tests.Integration;

public sealed class ProductPhotoAndExportTests : IClassFixture<PetShopApiFactory>
{
    // Smallest valid PNG header plus a little padding, enough for the type check.
    private static readonly byte[] PngBytes = [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A, 0, 0, 0, 13, 0x49, 0x48, 0x44, 0x52];

    private readonly PetShopApiFactory _factory;

    public ProductPhotoAndExportTests(PetShopApiFactory factory) => _factory = factory;

    private static MultipartFormDataContent FileContent(byte[] bytes, string fileName, string contentType)
    {
        var file = new ByteArrayContent(bytes);
        file.Headers.ContentType = new MediaTypeHeaderValue(contentType);
        return new MultipartFormDataContent { { file, "file", fileName } };
    }

    [Fact]
    public async Task Uploading_a_photo_stores_it_and_serves_it_back()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();

        var response = await client.PostAsync("/api/products/2/image", FileContent(PngBytes, "food.png", "image/png"));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var product = await response.ReadAsAsync<ProductResponse>();
        product.ImageUrl.Should().StartWith("/uploads/products/").And.EndWith(".png");

        var file = await _factory.CreateClient().GetAsync(product.ImageUrl);
        file.StatusCode.Should().Be(HttpStatusCode.OK);
        (await file.Content.ReadAsByteArrayAsync()).Should().Equal(PngBytes);
    }

    [Fact]
    public async Task Files_that_are_not_images_are_rejected_even_with_an_image_name()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();

        var response = await client.PostAsync("/api/products/3/image", FileContent(Encoding.UTF8.GetBytes("<script>alert(1)</script>"), "cat.png", "image/png"));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Removing_a_photo_deletes_the_file()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();
        var uploaded = await (await client.PostAsync("/api/products/4/image", FileContent(PngBytes, "pouch.png", "image/png"))).ReadAsAsync<ProductResponse>();

        var removed = await (await client.DeleteAsync("/api/products/4/image")).ReadAsAsync<ProductResponse>();

        removed.ImageUrl.Should().BeNull();
        (await _factory.CreateClient().GetAsync(uploaded.ImageUrl)).StatusCode.Should().Be(HttpStatusCode.NotFound);
    }

    [Fact]
    public async Task Export_returns_a_csv_that_respects_the_filters()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();

        var response = await client.GetAsync("/api/products/export?stockLevel=OutOfStock&sortBy=name&sortDirection=asc");

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        response.Content.Headers.ContentType!.MediaType.Should().Be("text/csv");
        response.Content.Headers.ContentDisposition!.FileName.Should().EndWith(".csv");

        var lines = (await response.Content.ReadAsStringAsync()).TrimStart('﻿').Trim().Split('\n');
        lines[0].Should().StartWith("SKU,Name,Brand");
        lines.Skip(1).Should().NotBeEmpty().And.OnlyContain(line => line.Contains(",Out of stock,"));
    }

    [Fact]
    public async Task Changes_to_a_product_are_recorded_in_its_history()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();
        var product = await client.GetFromJsonAsync<ProductResponse>("/api/products/5", HttpClientExtensions.Json);

        await client.PutAsJsonAsync("/api/products/5", new
        {
            product!.Sku,
            product.Name,
            product.Brand,
            product.CategoryId,
            petType = product.PetType.ToString(),
            product.Unit,
            product.Price,
            product.StockQuantity,
            product.ReorderLevel,
            status = "Discontinued",
            product.Description
        });

        var history = await client.GetFromJsonAsync<List<ActivityResponse>>("/api/products/5/activity", HttpClientExtensions.Json);

        history!.First().Action.Should().Be(ActivityAction.ProductUpdated);
        history.First().Summary.Should().StartWith("discontinued");
        history.First().UserFullName.Should().Be("Bie Sukrit");
    }
}
