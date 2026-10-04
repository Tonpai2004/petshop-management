using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using PetShop.Api.Contracts.Activities;
using PetShop.Api.Contracts.Users;
using PetShop.Api.Domain.Enums;
using PetShop.Api.Tests.Infrastructure;

namespace PetShop.Api.Tests.Integration;

public sealed class TeamAndSecurityTests : IClassFixture<PetShopApiFactory>
{
    private readonly PetShopApiFactory _factory;

    public TeamAndSecurityTests(PetShopApiFactory factory) => _factory = factory;

    private async Task<UserResponse> CreateStaffAsync(HttpClient admin, string username, string password = "Welcome123")
    {
        var response = await admin.PostAsJsonAsync("/api/auth/users", new { username, fullName = $"Test {username}", password, role = "Staff" });
        response.StatusCode.Should().Be(HttpStatusCode.Created);
        return await response.ReadAsAsync<UserResponse>();
    }

    [Fact]
    public async Task Admin_can_add_a_staff_member_who_can_then_sign_in()
    {
        var admin = await _factory.CreateClient().SignInAsAdminAsync();

        var created = await CreateStaffAsync(admin, "newbie");

        created.Role.Should().Be(UserRole.Staff);
        created.IsActive.Should().BeTrue();
        await _factory.CreateClient().SignInAsync("newbie", "Welcome123");
    }

    [Fact]
    public async Task Staff_cannot_manage_the_team()
    {
        var staff = await _factory.CreateClient().SignInAsStaffAsync();

        (await staff.GetAsync("/api/auth/users")).StatusCode.Should().Be(HttpStatusCode.Forbidden);
    }

    [Fact]
    public async Task Weak_passwords_and_duplicate_usernames_are_rejected()
    {
        var admin = await _factory.CreateClient().SignInAsAdminAsync();

        var weak = await admin.PostAsJsonAsync("/api/auth/users", new { username = "weakling", fullName = "Weak", password = "password", role = "Staff" });
        var duplicate = await admin.PostAsJsonAsync("/api/auth/users", new { username = "admin", fullName = "Again", password = "Welcome123", role = "Staff" });

        weak.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        duplicate.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Disabling_an_account_blocks_new_sign_ins_and_kills_existing_tokens()
    {
        var admin = await _factory.CreateClient().SignInAsAdminAsync();
        var user = await CreateStaffAsync(admin, "leaver");
        var leaver = await _factory.CreateClient().SignInAsync("leaver", "Welcome123");

        var disable = await admin.PatchAsJsonAsync($"/api/auth/users/{user.Id}/status", new { isActive = false });

        disable.StatusCode.Should().Be(HttpStatusCode.OK);
        (await leaver.GetAsync("/api/products")).StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        var login = await _factory.CreateClient().PostAsJsonAsync("/api/auth/login", new { username = "leaver", password = "Welcome123" });
        login.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Admin_cannot_disable_their_own_account()
    {
        var admin = await _factory.CreateClient().SignInAsAdminAsync();

        var response = await admin.PatchAsJsonAsync("/api/auth/users/1/status", new { isActive = false });

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task Too_many_wrong_passwords_lock_the_account_until_an_admin_resets_it()
    {
        var admin = await _factory.CreateClient().SignInAsAdminAsync();
        var user = await CreateStaffAsync(admin, "forgetful");
        var client = _factory.CreateClient();

        for (var i = 0; i < 4; i++)
        {
            (await client.PostAsJsonAsync("/api/auth/login", new { username = "forgetful", password = "Wrong1234" }))
                .StatusCode.Should().Be(HttpStatusCode.Unauthorized);
        }

        (await client.PostAsJsonAsync("/api/auth/login", new { username = "forgetful", password = "Wrong1234" }))
            .StatusCode.Should().Be(HttpStatusCode.Locked);
        // Even the right password is refused while locked.
        (await client.PostAsJsonAsync("/api/auth/login", new { username = "forgetful", password = "Welcome123" }))
            .StatusCode.Should().Be(HttpStatusCode.Locked);

        var reset = await admin.PostAsJsonAsync($"/api/auth/users/{user.Id}/reset-password", new { newPassword = "Fresh12345" });

        reset.StatusCode.Should().Be(HttpStatusCode.NoContent);
        await _factory.CreateClient().SignInAsync("forgetful", "Fresh12345");
    }

    [Fact]
    public async Task Users_can_change_their_own_password()
    {
        var admin = await _factory.CreateClient().SignInAsAdminAsync();
        await CreateStaffAsync(admin, "rotator");
        var client = await _factory.CreateClient().SignInAsync("rotator", "Welcome123");

        var wrongCurrent = await client.PostAsJsonAsync("/api/auth/change-password", new { currentPassword = "Nope12345", newPassword = "Brandnew123" });
        var ok = await client.PostAsJsonAsync("/api/auth/change-password", new { currentPassword = "Welcome123", newPassword = "Brandnew123" });

        wrongCurrent.StatusCode.Should().Be(HttpStatusCode.BadRequest);
        ok.StatusCode.Should().Be(HttpStatusCode.NoContent);
        await _factory.CreateClient().SignInAsync("rotator", "Brandnew123");
    }

    [Fact]
    public async Task Sign_ins_and_team_changes_show_up_in_the_activity_feed()
    {
        var admin = await _factory.CreateClient().SignInAsAdminAsync();
        await CreateStaffAsync(admin, "logged");

        var feed = await admin.GetFromJsonAsync<List<ActivityResponse>>("/api/products/activity?limit=10", HttpClientExtensions.Json);

        feed!.Should().Contain(a => a.Action == ActivityAction.UserCreated && a.Summary.Contains("Test logged"));
        feed.Should().Contain(a => a.Action == ActivityAction.SignedIn);
    }
}

public sealed class LoginRateLimitTests : IClassFixture<LoginRateLimitTests.StrictFactory>
{
    public sealed class StrictFactory : PetShopApiFactory
    {
        protected override void ConfigureWebHost(Microsoft.AspNetCore.Hosting.IWebHostBuilder builder)
        {
            base.ConfigureWebHost(builder);
            builder.UseSetting("Security:LoginRequestsPerMinute", "3");
        }
    }

    private readonly StrictFactory _factory;

    public LoginRateLimitTests(StrictFactory factory) => _factory = factory;

    [Fact]
    public async Task Hammering_the_login_endpoint_gets_429()
    {
        var client = _factory.CreateClient();
        HttpResponseMessage? last = null;

        for (var i = 0; i < 4; i++)
        {
            last = await client.PostAsJsonAsync("/api/auth/login", new { username = $"ghost{i}", password = "Whatever1" });
        }

        last!.StatusCode.Should().Be(HttpStatusCode.TooManyRequests);
    }
}
