using PetShop.Api.Domain.Entities;

namespace PetShop.Api.Data.Json;

/// <summary>
/// Maps a SQLite table to the JSON file it is persisted in.
/// </summary>
public sealed record JsonTable(string Name, string FileName, Type EntityType, string InsertSql)
{
    public static readonly JsonTable Users = new(
        "Users",
        "users.json",
        typeof(User),
        """
        INSERT INTO Users (Id, Username, PasswordHash, FullName, Role, IsActive, CreatedAt, LastLoginAt, FailedLoginCount, LockoutEndsAt)
        VALUES (@Id, @Username, @PasswordHash, @FullName, @Role, @IsActive, @CreatedAt, @LastLoginAt, @FailedLoginCount, @LockoutEndsAt)
        """);

    public static readonly JsonTable Categories = new(
        "Categories",
        "categories.json",
        typeof(Category),
        """
        INSERT INTO Categories (Id, Name, Description)
        VALUES (@Id, @Name, @Description)
        """);

    public static readonly JsonTable Products = new(
        "Products",
        "products.json",
        typeof(Product),
        """
        INSERT INTO Products (Id, Sku, Name, Brand, CategoryId, PetType, Unit, Price, StockQuantity, ReorderLevel, Status,
                              ImageUrl, Description, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy)
        VALUES (@Id, @Sku, @Name, @Brand, @CategoryId, @PetType, @Unit, @Price, @StockQuantity, @ReorderLevel, @Status,
                @ImageUrl, @Description, @CreatedAt, @UpdatedAt, @CreatedBy, @UpdatedBy)
        """);

    public static readonly JsonTable Activities = new(
        "Activities",
        "activities.json",
        typeof(Activity),
        """
        INSERT INTO Activities (Id, UserId, Action, EntityType, EntityId, Summary, CreatedAt)
        VALUES (@Id, @UserId, @Action, @EntityType, @EntityId, @Summary, @CreatedAt)
        """);

    // Order matters: parents first so foreign keys line up when loading.
    public static IReadOnlyList<JsonTable> All { get; } = [Users, Categories, Products, Activities];
}
