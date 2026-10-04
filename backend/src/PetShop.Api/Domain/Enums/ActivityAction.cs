namespace PetShop.Api.Domain.Enums;

public enum ActivityAction
{
    SignedIn = 1,
    AccountLocked = 2,
    PasswordChanged = 3,
    ProductCreated = 10,
    ProductUpdated = 11,
    ProductDeleted = 12,
    ProductPhotoChanged = 13,
    ProductPhotoRemoved = 14,
    StockAdjusted = 15,
    UserCreated = 20,
    UserDisabled = 21,
    UserEnabled = 22,
    PasswordReset = 23
}
