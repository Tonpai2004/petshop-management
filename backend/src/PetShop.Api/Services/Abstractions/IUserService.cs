using PetShop.Api.Contracts.Users;

namespace PetShop.Api.Services.Abstractions;

public interface IUserService
{
    Task<IReadOnlyList<UserResponse>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<UserResponse> CreateAsync(CreateUserRequest request, int actorId, CancellationToken cancellationToken = default);
    Task<UserResponse> SetActiveAsync(int userId, bool isActive, int actorId, CancellationToken cancellationToken = default);
    Task ResetPasswordAsync(int userId, ResetPasswordRequest request, int actorId, CancellationToken cancellationToken = default);
}
