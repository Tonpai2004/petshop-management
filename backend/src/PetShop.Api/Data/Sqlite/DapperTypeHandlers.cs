using System.Data;
using System.Globalization;
using Dapper;

namespace PetShop.Api.Data.Sqlite;

public static class DapperTypeHandlers
{
    private static int _registered;

    public static void Register()
    {
        if (Interlocked.Exchange(ref _registered, 1) == 1)
        {
            return;
        }

        SqlMapper.AddTypeHandler(new UtcDateTimeHandler());
        SqlMapper.AddTypeHandler(new DecimalHandler());
    }

    // SQLite has no real date type, it just stores text. We always write ISO-8601 in UTC
    // and mark the value as UTC when reading so the API never returns "unspecified" dates.
    private sealed class UtcDateTimeHandler : SqlMapper.TypeHandler<DateTime>
    {
        public override void SetValue(IDbDataParameter parameter, DateTime value)
        {
            parameter.DbType = DbType.String;
            parameter.Value = value.ToUniversalTime().ToString("O", CultureInfo.InvariantCulture);
        }

        public override DateTime Parse(object value) =>
            DateTime.Parse(
                Convert.ToString(value, CultureInfo.InvariantCulture)!,
                CultureInfo.InvariantCulture,
                DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal);
    }

    // SQLite hands NUMERIC values back as long or double depending on what's stored,
    // and Dapper won't turn a double into a decimal by itself.
    private sealed class DecimalHandler : SqlMapper.TypeHandler<decimal>
    {
        public override void SetValue(IDbDataParameter parameter, decimal value)
        {
            parameter.DbType = DbType.Decimal;
            parameter.Value = value;
        }

        public override decimal Parse(object value) =>
            Math.Round(Convert.ToDecimal(value, CultureInfo.InvariantCulture), 2);
    }
}
