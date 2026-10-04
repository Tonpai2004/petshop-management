using System.Net.Http.Headers;
using System.Net.Http.Json;
using System.Text.Json;
using System.Text.Json.Serialization;
using PetShop.Api.Contracts.Auth;

namespace PetShop.Api.Tests.Infrastructure;

public static class HttpClientExtensions
{
    public static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web)
    {
        Converters = { new JsonStringEnumConverter() }
    };

    public static async Task<HttpClient> SignInAsync(this HttpClient client, string username, string password)
    {
        var response = await client.PostAsJsonAsync("/api/auth/login", new { username, password });
        response.EnsureSuccessStatusCode();

        var login = await response.Content.ReadFromJsonAsync<LoginResponse>(Json);
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", login!.AccessToken);
        return client;
    }

    public static Task<HttpClient> SignInAsAdminAsync(this HttpClient client) => client.SignInAsync("admin", "Admin@123");

    public static Task<HttpClient> SignInAsStaffAsync(this HttpClient client) => client.SignInAsync("staff", "Staff@123");

    public static async Task<T> ReadAsAsync<T>(this HttpResponseMessage response) =>
        (await response.Content.ReadFromJsonAsync<T>(Json))!;
}
