namespace PetShop.Api.Storage;

/// <summary>
/// Works out the real image type from the first bytes of the file.
/// The Content-Type header and file name come from the client, so they can't be trusted on their own.
/// </summary>
public static class ImageFileInspector
{
    public static string? DetectExtension(ReadOnlySpan<byte> header)
    {
        if (header.Length >= 3 && header[0] == 0xFF && header[1] == 0xD8 && header[2] == 0xFF)
        {
            return ".jpg";
        }

        if (header.Length >= 8 && header[..8].SequenceEqual(new byte[] { 0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A }))
        {
            return ".png";
        }

        // RIFF....WEBP
        if (header.Length >= 12
            && header[..4].SequenceEqual("RIFF"u8)
            && header[8..12].SequenceEqual("WEBP"u8))
        {
            return ".webp";
        }

        return null;
    }
}
