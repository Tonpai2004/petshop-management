using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using PetShop.Api.Contracts.Auth;
using PetShop.Api.Domain.Enums;
using PetShop.Api.Tests.Infrastructure;

namespace PetShop.Api.Tests.Integration;

public sealed class AuthEndpointsTests : IClassFixture<PetShopApiFactory>
{
    private readonly PetShopApiFactory _factory;

    public AuthEndpointsTests(PetShopApiFactory factory) => _factory = factory;

    [Fact]
    public async Task Login_with_valid_credentials_returns_token_and_profile()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", new { username = "admin", password = "Admin@123" });

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var body = await response.ReadAsAsync<LoginResponse>();
        body.AccessToken.Should().NotBeNullOrWhiteSpace();
        body.TokenType.Should().Be("Bearer");
        body.User.Role.Should().Be(UserRole.Admin);
        body.ExpiresAt.Should().BeAfter(DateTime.UtcNow);
    }

    [Theory]
    [InlineData("admin", "wrong-password")]
    [InlineData("nobody", "Admin@123")]
    public async Task Login_with_bad_credentials_returns_401(string username, string password)
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", new { username, password });

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_without_body_fields_returns_400()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/auth/login", new { });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Me_returns_the_signed_in_user()
    {
        var client = await _factory.CreateClient().SignInAsStaffAsync();

        var profile = await client.GetFromJsonAsync<UserProfileResponse>("/api/auth/me", HttpClientExtensions.Json);

        profile!.Username.Should().Be("staff");
        profile.Role.Should().Be(UserRole.Staff);
    }

    [Fact]
    public async Task Me_without_token_returns_401()
    {
        var response = await _factory.CreateClient().GetAsync("/api/auth/me");

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }
}
