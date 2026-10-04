using System.Text;
using Dapper;
using PetShop.Api.Contracts.Products;
using PetShop.Api.Data;
using PetShop.Api.Data.Json;
using PetShop.Api.Domain.Entities;
using PetShop.Api.Domain.Enums;
using PetShop.Api.Domain.Views;
using PetShop.Api.Repositories.Abstractions;

namespace PetShop.Api.Repositories;

public sealed class ProductRepository : IProductRepository
{
    private const string SelectProductView = """
        SELECT p.*,
               c.Name     AS CategoryName,
               u.FullName AS UpdatedByName
        FROM Products p
        INNER JOIN Categories c ON c.Id = p.CategoryId
        LEFT JOIN Users u ON u.Id = p.UpdatedBy
        """;

    // Only these columns can be sorted on. Anything else falls back to the default,
    // which also means user input never ends up concatenated into the SQL.
    private static readonly Dictionary<string, string> SortColumns = new(StringComparer.OrdinalIgnoreCase)
    {
        ["name"] = "p.Name",
        ["price"] = "p.Price",
        ["stock"] = "p.StockQuantity",
        ["createdAt"] = "p.CreatedAt",
        ["updatedAt"] = "p.UpdatedAt"
    };

    // Export never needs more than this; it keeps one careless request from building a huge file.
    private const int MaxExportRows = 10_000;

    private readonly IDbContext _db;

    public ProductRepository(IDbContext db) => _db = db;

    public Task<(IReadOnlyList<ProductView> Items, int TotalItems)> SearchAsync(
        ProductQueryParameters query,
        CancellationToken cancellationToken = default)
    {
        var (where, orderBy, parameters) = BuildFilter(query);
        parameters.Add("limit", query.PageSize);
        parameters.Add("offset", (query.Page - 1) * query.PageSize);

        var sql = $"""
            SELECT COUNT(*) FROM Products p {where};

            {SelectProductView}
            {where}
            {orderBy}
            LIMIT @limit OFFSET @offset;
            """;

        return _db.ReadAsync(async connection =>
        {
            using var grid = await connection.QueryMultipleAsync(new CommandDefinition(sql, parameters, cancellationToken: cancellationToken));
            var total = await grid.ReadSingleAsync<int>();
            var items = (await grid.ReadAsync<ProductView>()).AsList();
            return ((IReadOnlyList<ProductView>)items, total);
        }, cancellationToken);
    }

    public async Task<IReadOnlyList<ProductView>> ExportAsync(ProductQueryParameters query, CancellationToken cancellationToken = default)
    {
        var (where, orderBy, parameters) = BuildFilter(query);
        parameters.Add("limit", MaxExportRows);

        var rows = await _db.ReadAsync(connection => connection.QueryAsync<ProductView>(
            new CommandDefinition($"{SelectProductView} {where} {orderBy} LIMIT @limit", parameters, cancellationToken: cancellationToken)),
            cancellationToken);

        return rows.AsList();
    }

    public Task<ProductView?> GetByIdAsync(int id, CancellationToken cancellationToken = default) =>
        _db.ReadAsync(connection => connection.QuerySingleOrDefaultAsync<ProductView>(
            new CommandDefinition($"{SelectProductView} WHERE p.Id = @id", new { id }, cancellationToken: cancellationToken)),
            cancellationToken);

    public Task<bool> SkuExistsAsync(string sku, int? excludeId, CancellationToken cancellationToken = default) =>
        _db.ReadAsync(connection => connection.ExecuteScalarAsync<bool>(
            new CommandDefinition(
                "SELECT EXISTS (SELECT 1 FROM Products WHERE Sku = @sku AND (@excludeId IS NULL OR Id <> @excludeId))",
                new { sku, excludeId },
                cancellationToken: cancellationToken)),
            cancellationToken);

    public Task<int> CreateAsync(Product product, CancellationToken cancellationToken = default)
    {
        const string sql = """
            INSERT INTO Products (Sku, Name, Brand, CategoryId, PetType, Unit, Price, StockQuantity, ReorderLevel, Status,
                                  ImageUrl, Description, CreatedAt, UpdatedAt, CreatedBy, UpdatedBy)
            VALUES (@Sku, @Name, @Brand, @CategoryId, @PetType, @Unit, @Price, @StockQuantity, @ReorderLevel, @Status,
                    @ImageUrl, @Description, @CreatedAt, @UpdatedAt, @CreatedBy, @UpdatedBy);

            SELECT last_insert_rowid();
            """;

        return _db.WriteAsync([JsonTable.Products], (connection, transaction) =>
            connection.ExecuteScalarAsync<int>(new CommandDefinition(sql, product, transaction, cancellationToken: cancellationToken)),
            cancellationToken);
    }

    public async Task<bool> UpdateAsync(Product product, CancellationToken cancellationToken = default)
    {
        const string sql = """
            UPDATE Products
            SET Sku = @Sku,
                Name = @Name,
                Brand = @Brand,
                CategoryId = @CategoryId,
                PetType = @PetType,
                Unit = @Unit,
                Price = @Price,
                StockQuantity = @StockQuantity,
                ReorderLevel = @ReorderLevel,
                Status = @Status,
                Description = @Description,
                UpdatedAt = @UpdatedAt,
                UpdatedBy = @UpdatedBy
            WHERE Id = @Id;
            """;

        var affected = await _db.WriteAsync([JsonTable.Products], (connection, transaction) =>
            connection.ExecuteAsync(new CommandDefinition(sql, product, transaction, cancellationToken: cancellationToken)),
            cancellationToken);

        return affected > 0;
    }

    // Done in one statement so two people adjusting at the same time can't overwrite each other,
    // and the quantity can never drop below zero.
    public Task<int?> AdjustStockAsync(int id, int quantityChange, DateTime updatedAt, int updatedBy, CancellationToken cancellationToken = default)
    {
        const string sql = """
            UPDATE Products
            SET StockQuantity = StockQuantity + @quantityChange,
                UpdatedAt = @updatedAt,
                UpdatedBy = @updatedBy
            WHERE Id = @id AND StockQuantity + @quantityChange >= 0;

            SELECT CASE WHEN changes() > 0 THEN StockQuantity END FROM Products WHERE Id = @id;
            """;

        return _db.WriteAsync([JsonTable.Products], (connection, transaction) =>
            connection.ExecuteScalarAsync<int?>(new CommandDefinition(sql, new { id, quantityChange, updatedAt, updatedBy }, transaction, cancellationToken: cancellationToken)),
            cancellationToken);
    }

    public async Task<bool> UpdateImageAsync(int id, string? imageUrl, DateTime updatedAt, int updatedBy, CancellationToken cancellationToken = default)
    {
        const string sql = "UPDATE Products SET ImageUrl = @imageUrl, UpdatedAt = @updatedAt, UpdatedBy = @updatedBy WHERE Id = @id";

        var affected = await _db.WriteAsync([JsonTable.Products], (connection, transaction) =>
            connection.ExecuteAsync(new CommandDefinition(sql, new { id, imageUrl, updatedAt, updatedBy }, transaction, cancellationToken: cancellationToken)),
            cancellationToken);

        return affected > 0;
    }

    public async Task<bool> DeleteAsync(int id, CancellationToken cancellationToken = default)
    {
        var affected = await _db.WriteAsync([JsonTable.Products], (connection, transaction) =>
            connection.ExecuteAsync(new CommandDefinition("DELETE FROM Products WHERE Id = @id", new { id }, transaction, cancellationToken: cancellationToken)),
            cancellationToken);

        return affected > 0;
    }

    public Task<InventorySummary> GetSummaryAsync(CancellationToken cancellationToken = default)
    {
        // Discontinued products are counted on their own and left out of the stock figures.
        const string sql = """
            SELECT COALESCE(SUM(CASE WHEN Status = @active THEN 1 ELSE 0 END), 0)                          AS TotalProducts,
                   COALESCE(SUM(CASE WHEN Status = @active THEN StockQuantity ELSE 0 END), 0)              AS TotalUnits,
                   COALESCE(SUM(CASE WHEN Status = @active THEN StockQuantity * Price ELSE 0 END), 0)      AS StockValue,
                   COALESCE(SUM(CASE WHEN Status = @active AND StockQuantity > ReorderLevel THEN 1 ELSE 0 END), 0) AS InStock,
                   COALESCE(SUM(CASE WHEN Status = @active AND StockQuantity > 0 AND StockQuantity <= ReorderLevel THEN 1 ELSE 0 END), 0) AS LowStock,
                   COALESCE(SUM(CASE WHEN Status = @active AND StockQuantity <= 0 THEN 1 ELSE 0 END), 0)   AS OutOfStock,
                   COALESCE(SUM(CASE WHEN Status = @discontinued THEN 1 ELSE 0 END), 0)                    AS Discontinued
            FROM Products;

            SELECT c.Id   AS CategoryId,
                   c.Name AS CategoryName,
                   COALESCE(SUM(CASE WHEN p.StockQuantity > p.ReorderLevel THEN 1 ELSE 0 END), 0)  AS InStock,
                   COALESCE(SUM(CASE WHEN p.StockQuantity <= p.ReorderLevel THEN 1 ELSE 0 END), 0) AS NeedsRestock,
                   COALESCE(SUM(p.StockQuantity * p.Price), 0)                                     AS StockValue
            FROM Categories c
            LEFT JOIN Products p ON p.CategoryId = c.Id AND p.Status = @active
            GROUP BY c.Id, c.Name
            ORDER BY c.Id;
            """;

        var parameters = new { active = ProductStatus.Active, discontinued = ProductStatus.Discontinued };

        return _db.ReadAsync(async connection =>
        {
            using var grid = await connection.QueryMultipleAsync(new CommandDefinition(sql, parameters, cancellationToken: cancellationToken));
            var summary = await grid.ReadSingleAsync<InventorySummary>();
            summary.ByCategory = (await grid.ReadAsync<CategoryBreakdown>()).AsList();
            return summary;
        }, cancellationToken);
    }

    // Shared by the paged list and the CSV export so both always agree on what "filtered" means.
    private static (string Where, string OrderBy, DynamicParameters Parameters) BuildFilter(ProductQueryParameters query)
    {
        var where = new StringBuilder("WHERE 1 = 1");
        var parameters = new DynamicParameters();

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            where.Append(" AND (p.Name LIKE @search ESCAPE '\\' OR p.Brand LIKE @search ESCAPE '\\' OR p.Sku LIKE @search ESCAPE '\\')");
            parameters.Add("search", $"%{EscapeLike(query.Search.Trim())}%");
        }

        if (query.CategoryId is not null)
        {
            where.Append(" AND p.CategoryId = @categoryId");
            parameters.Add("categoryId", query.CategoryId);
        }

        if (query.PetType is not null)
        {
            // "All pets" products show up whichever animal you filter by.
            where.Append(" AND (p.PetType = @petType OR p.PetType = @allPets)");
            parameters.Add("petType", query.PetType);
            parameters.Add("allPets", PetType.AllPets);
        }

        if (query.Status is not null)
        {
            where.Append(" AND p.Status = @status");
            parameters.Add("status", query.Status);
        }

        where.Append(query.StockLevel switch
        {
            StockLevel.OutOfStock => " AND p.StockQuantity <= 0",
            StockLevel.LowStock => " AND p.StockQuantity > 0 AND p.StockQuantity <= p.ReorderLevel",
            StockLevel.InStock => " AND p.StockQuantity > p.ReorderLevel",
            _ => string.Empty
        });

        var sortColumn = SortColumns.GetValueOrDefault(query.SortBy ?? string.Empty, "p.CreatedAt");
        var sortDirection = string.Equals(query.SortDirection, "asc", StringComparison.OrdinalIgnoreCase) ? "ASC" : "DESC";

        return (where.ToString(), $"ORDER BY {sortColumn} {sortDirection}, p.Id {sortDirection}", parameters);
    }

    private static string EscapeLike(string value) =>
        value.Replace("\\", "\\\\").Replace("%", "\\%").Replace("_", "\\_");
}
