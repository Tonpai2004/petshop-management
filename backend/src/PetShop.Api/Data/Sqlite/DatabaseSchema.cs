namespace PetShop.Api.Data.Sqlite;

public static class DatabaseSchema
{
    public const string CreateTables = """
        CREATE TABLE IF NOT EXISTS Users (
            Id           INTEGER PRIMARY KEY AUTOINCREMENT,
            Username     TEXT    NOT NULL UNIQUE COLLATE NOCASE,
            PasswordHash TEXT    NOT NULL,
            FullName     TEXT    NOT NULL,
            Role         INTEGER NOT NULL,
            IsActive     INTEGER NOT NULL DEFAULT 1,
            CreatedAt    TEXT    NOT NULL,
            LastLoginAt  TEXT    NULL,
            FailedLoginCount INTEGER NOT NULL DEFAULT 0,
            LockoutEndsAt    TEXT    NULL
        );

        CREATE TABLE IF NOT EXISTS Categories (
            Id          INTEGER PRIMARY KEY AUTOINCREMENT,
            Name        TEXT NOT NULL UNIQUE COLLATE NOCASE,
            Description TEXT NULL
        );

        CREATE TABLE IF NOT EXISTS Products (
            Id            INTEGER PRIMARY KEY AUTOINCREMENT,
            Sku           TEXT    NOT NULL UNIQUE COLLATE NOCASE,
            Name          TEXT    NOT NULL,
            Brand         TEXT    NOT NULL,
            CategoryId    INTEGER NOT NULL REFERENCES Categories (Id),
            PetType       INTEGER NOT NULL,
            Unit          TEXT    NULL,
            Price         NUMERIC NOT NULL,
            StockQuantity INTEGER NOT NULL DEFAULT 0,
            ReorderLevel  INTEGER NOT NULL DEFAULT 0,
            Status        INTEGER NOT NULL,
            ImageUrl      TEXT    NULL,
            Description   TEXT    NULL,
            CreatedAt     TEXT    NOT NULL,
            UpdatedAt     TEXT    NOT NULL,
            CreatedBy     INTEGER NOT NULL REFERENCES Users (Id),
            UpdatedBy     INTEGER NOT NULL REFERENCES Users (Id)
        );

        CREATE TABLE IF NOT EXISTS Activities (
            Id          INTEGER PRIMARY KEY AUTOINCREMENT,
            UserId      INTEGER NULL REFERENCES Users (Id),
            Action      INTEGER NOT NULL,
            EntityType  TEXT    NOT NULL,
            EntityId    INTEGER NULL,
            Summary     TEXT    NOT NULL,
            CreatedAt   TEXT    NOT NULL
        );

        CREATE INDEX IF NOT EXISTS IX_Products_CategoryId ON Products (CategoryId);
        CREATE INDEX IF NOT EXISTS IX_Products_PetType ON Products (PetType);
        CREATE INDEX IF NOT EXISTS IX_Activities_Entity ON Activities (EntityType, EntityId);
        """;
}
