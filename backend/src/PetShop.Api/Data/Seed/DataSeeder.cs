using Microsoft.Extensions.Options;
using PetShop.Api.Configuration;
using PetShop.Api.Data.Json;
using PetShop.Api.Domain.Entities;
using PetShop.Api.Domain.Enums;
using PetShop.Api.Security;

namespace PetShop.Api.Data.Seed;

/// <summary>
/// Creates the JSON table files with some starter data the first time the API runs,
/// so a fresh clone is usable right away. Existing files are never touched.
/// </summary>
public sealed class DataSeeder
{
    private readonly JsonFileStore _fileStore;
    private readonly IPasswordHasher _passwordHasher;
    private readonly JsonStorageSettings _settings;
    private readonly ILogger<DataSeeder> _logger;

    public DataSeeder(
        JsonFileStore fileStore,
        IPasswordHasher passwordHasher,
        IOptions<JsonStorageSettings> settings,
        ILogger<DataSeeder> logger)
    {
        _fileStore = fileStore;
        _passwordHasher = passwordHasher;
        _settings = settings.Value;
        _logger = logger;
    }

    public async Task SeedAsync(CancellationToken cancellationToken = default)
    {
        if (!_settings.SeedWhenEmpty)
        {
            return;
        }

        await SeedTableAsync(JsonTable.Users, BuildUsers, cancellationToken);
        await SeedTableAsync(JsonTable.Categories, BuildCategories, cancellationToken);
        await SeedTableAsync(JsonTable.Products, BuildProducts, cancellationToken);
        await SeedTableAsync(JsonTable.Activities, BuildActivities, cancellationToken);
    }

    private async Task SeedTableAsync<T>(JsonTable table, Func<List<T>> build, CancellationToken cancellationToken)
    {
        if (_fileStore.Exists(table))
        {
            return;
        }

        var rows = build();
        await _fileStore.WriteAsync(table, rows, cancellationToken);
        _logger.LogInformation("Seeded {File} with {Count} row(s)", table.FileName, rows.Count);
    }

    private List<User> BuildUsers()
    {
        var createdAt = new DateTime(2026, 9, 1, 2, 0, 0, DateTimeKind.Utc);

        return
        [
            new User
            {
                Id = 1,
                Username = "admin",
                PasswordHash = _passwordHasher.Hash("Admin@123"),
                FullName = "Win Methawin",
                Role = UserRole.Admin,
                CreatedAt = createdAt
            },
            new User
            {
                Id = 2,
                Username = "staff",
                PasswordHash = _passwordHasher.Hash("Staff@123"),
                FullName = "Bie Sukrit",
                Role = UserRole.Staff,
                CreatedAt = createdAt
            }
        ];
    }

    private static List<Category> BuildCategories() =>
    [
        new() { Id = 1, Name = "Food", Description = "Dry and wet food for every life stage" },
        new() { Id = 2, Name = "Treats", Description = "Snacks, chews and training rewards" },
        new() { Id = 3, Name = "Toys", Description = "Balls, teasers and enrichment toys" },
        new() { Id = 4, Name = "Accessories", Description = "Collars, leashes, bowls and carriers" },
        new() { Id = 5, Name = "Grooming", Description = "Shampoo, brushes and litter" },
        new() { Id = 6, Name = "Health", Description = "Supplements and flea and tick care" },
        new() { Id = 7, Name = "Habitat", Description = "Beds, cages, tanks and filters" }
    ];

    // Free stock photos from Unsplash (unsplash.com/license), one per sample product in the same order,
    // so the catalogue looks like a real shop on first run. Uploading a photo in the app replaces them.
    private static readonly string[] SamplePhotoIds =
    [
        "photo-1676193866128-03a926df76ef",
        "photo-1589924691995-400dc9ecc119",
        "photo-1645773619957-ec1d128d0aa2",
        "photo-1724331524574-12356be7053f",
        "photo-1592237163215-c97b487faeb5",
        "photo-1603529387711-5de5b3e6e799",
        "photo-1592468254646-bb599a5174ad",
        "photo-1626544379809-e0031867d50c",
        "photo-1738504821302-0901a5c2b5d9",
        "photo-1535294435445-d7249524ef2e",
        "photo-1718975463931-79f68f4d5f75",
        "photo-1595343631033-53c8fc1b78fe",
        "photo-1687425961065-46efeb465c66",
        "photo-1679224106783-c21b1841412a",
        "photo-1661322563051-15248c0568a1",
        "photo-1647002380351-ba23ff97c428",
        "photo-1727510160238-3c17eb5e6120",
        "photo-1675430426271-d74b542f21e4",
        "photo-1597595735781-6a57fb8e3e3d",
        "photo-1664956618021-73c47736845e",
        "photo-1646195164326-124b72fb9d34",
        "photo-1636045466232-539c7bd7817e",
        "photo-1676918555382-fcd06a483e25",
        "photo-1767023024653-3d6f74909ccf"
    ];

    private static string SamplePhotoUrl(string photoId) =>
        $"https://images.unsplash.com/{photoId}?auto=format&fit=crop&w=800&q=75";

    private static List<Product> BuildProducts()
    {
        var products = new List<Product>
        {
            Product("FD-RC-MINI-15", "Mini Adult Dry Dog Food", "Royal Canin", 1, PetType.Dog, "1.5 kg bag", 590m, 24, 8, "Complete food for small breeds from 10 months."),
            Product("FD-SH-BEEF-3", "Adult Dog Food Roast Beef", "SmartHeart", 1, PetType.Dog, "3 kg bag", 345m, 6, 10, null),
            Product("FD-MEO-TUNA-12", "Adult Cat Food Tuna", "Me-O", 1, PetType.Cat, "1.2 kg bag", 189m, 32, 12, null),
            Product("FD-WK-POUCH-12", "Wet Cat Food Mackerel Pouch", "Whiskas", 1, PetType.Cat, "Box of 12", 228m, 0, 6, "Fast seller, reorder every Monday."),
            Product("FD-TETRA-FLK-100", "TetraMin Tropical Flakes", "Tetra", 1, PetType.Fish, "100 g tub", 165m, 14, 5, null),
            Product("FD-VL-PARROT-1", "Parrot Seed Mix", "Versele-Laga", 1, PetType.Bird, "1 kg bag", 280m, 9, 4, null),
            Product("TR-JH-STICK-70", "Jerhigh Chicken Stick", "Jerhigh", 2, PetType.Dog, "70 g pack", 59m, 48, 20, null),
            Product("TR-CIAO-CHURU-4", "Churu Tuna Puree", "Ciao", 2, PetType.Cat, "Pack of 4", 75m, 5, 15, "Customers ask for this daily."),
            Product("TR-OX-TIMOTHY-1", "Timothy Hay", "Oxbow", 2, PetType.SmallPet, "425 g bag", 320m, 11, 4, null),
            Product("TY-KG-CLASSIC-M", "Classic Rubber Chew Toy", "Kong", 3, PetType.Dog, "Medium", 450m, 7, 3, null),
            Product("TY-PB-FEATHER", "Feather Teaser Wand", "Petsuka", 3, PetType.Cat, "Each", 129m, 18, 6, null),
            Product("TY-BIRD-SWING", "Wooden Bird Swing", "Kaytee", 3, PetType.Bird, "Each", 149m, 0, 3, null),
            Product("AC-LEASH-NYL-M", "Nylon Leash", "Ferplast", 4, PetType.Dog, "1.2 m, medium", 290m, 12, 4, null),
            Product("AC-BOWL-SS-S", "Stainless Steel Bowl", "Petsuka", 4, PetType.AllPets, "Small, 350 ml", 99m, 25, 8, null),
            Product("AC-CARRIER-CAT", "Hard Shell Pet Carrier", "Ferplast", 4, PetType.Cat, "Each", 1290m, 2, 2, null),
            Product("GR-SHAMPOO-OAT", "Oatmeal Pet Shampoo", "Bearing", 5, PetType.AllPets, "300 ml bottle", 159m, 20, 6, "Gentle formula for sensitive skin."),
            Product("GR-LITTER-TOFU-6", "Tofu Cat Litter Original", "Kasty", 5, PetType.Cat, "6 L bag", 199m, 40, 15, null),
            Product("GR-SLICKER-BRUSH", "Self-Cleaning Slicker Brush", "Hertzko", 5, PetType.AllPets, "Each", 390m, 3, 3, null),
            Product("HL-FRONTLINE-S", "Frontline Plus Small Dog", "Frontline", 6, PetType.Dog, "Pack of 3", 790m, 9, 4, null),
            Product("HL-LYSINE-CAT", "L-Lysine Supplement", "Nutri-Vet", 6, PetType.Cat, "100 g", 450m, 4, 5, null),
            Product("HB-BED-DONUT-M", "Calming Donut Bed", "Petsuka", 7, PetType.AllPets, "Medium, 60 cm", 690m, 8, 3, null),
            Product("HB-TANK-FILTER-S", "Internal Aquarium Filter", "Sobo", 7, PetType.Fish, "Up to 60 L", 350m, 6, 3, null),
            Product("HB-HAMSTER-CAGE", "Hamster Cage Starter Kit", "Ferplast", 7, PetType.SmallPet, "Each", 1590m, 1, 2, null),
            Product("FD-PED-PUPPY-15", "Puppy Dry Food Chicken & Milk", "Pedigree", 1, PetType.Dog, "1.5 kg bag", 235m, 15, 6, null)
        };

        var firstArrival = new DateTime(2026, 9, 1, 3, 0, 0, DateTimeKind.Utc);
        for (var i = 0; i < products.Count; i++)
        {
            products[i].Id = i + 1;
            products[i].CreatedAt = products[i].UpdatedAt = firstArrival.AddDays(i + i / 3).AddHours(i % 6);
            products[i].ImageUrl = SamplePhotoUrl(SamplePhotoIds[i]);
        }

        // One old line the shop no longer sells, to show how discontinued products look.
        products[11].Status = ProductStatus.Discontinued;

        return products;
    }

    // The activity feed starts with the sample products being added, so the dashboard isn't empty on day one.
    private static List<Activity> BuildActivities() =>
        BuildProducts()
            .Select((product, index) => new Activity
            {
                Id = index + 1,
                UserId = 1,
                Action = ActivityAction.ProductCreated,
                EntityType = Activity.ProductEntity,
                EntityId = product.Id,
                Summary = $"added {product.Name} with {product.StockQuantity} in stock",
                CreatedAt = product.CreatedAt
            })
            .ToList();

    private static Product Product(
        string sku, string name, string brand, int categoryId, PetType petType, string unit,
        decimal price, int stock, int reorderLevel, string? description) => new()
    {
        Sku = sku,
        Name = name,
        Brand = brand,
        CategoryId = categoryId,
        PetType = petType,
        Unit = unit,
        Price = price,
        StockQuantity = stock,
        ReorderLevel = reorderLevel,
        Status = ProductStatus.Active,
        Description = description,
        CreatedBy = 1,
        UpdatedBy = 1
    };
}
