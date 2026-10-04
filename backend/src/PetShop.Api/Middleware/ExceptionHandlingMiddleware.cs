using Microsoft.AspNetCore.Mvc;
using PetShop.Api.Common.Exceptions;

namespace PetShop.Api.Middleware;

/// <summary>
/// Turns exceptions into RFC 7807 problem details so the frontend always gets the same error shape.
/// </summary>
public sealed class ExceptionHandlingMiddleware
{
    private readonly RequestDelegate _next;
    private readonly ILogger<ExceptionHandlingMiddleware> _logger;
    private readonly IHostEnvironment _environment;

    public ExceptionHandlingMiddleware(
        RequestDelegate next,
        ILogger<ExceptionHandlingMiddleware> logger,
        IHostEnvironment environment)
    {
        _next = next;
        _logger = logger;
        _environment = environment;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        try
        {
            await _next(context);
        }
        catch (OperationCanceledException) when (context.RequestAborted.IsCancellationRequested)
        {
            // The client went away, nobody is waiting for a response.
        }
        catch (AppException ex)
        {
            await WriteProblemAsync(context, ToProblem(ex));
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Unhandled exception for {Method} {Path}", context.Request.Method, context.Request.Path);

            await WriteProblemAsync(context, new ProblemDetails
            {
                Status = StatusCodes.Status500InternalServerError,
                Title = "Something went wrong on our side.",
                // Only leak the real message on a dev machine.
                Detail = _environment.IsDevelopment() ? ex.Message : "Please try again later."
            });
        }
    }

    private static ProblemDetails ToProblem(AppException ex)
    {
        if (ex is ValidationException validation)
        {
            return new ValidationProblemDetails(validation.Errors.ToDictionary(e => e.Key, e => e.Value))
            {
                Status = ex.StatusCode,
                Title = ex.Title,
                Detail = ex.Message
            };
        }

        return new ProblemDetails
        {
            Status = ex.StatusCode,
            Title = ex.Title,
            Detail = ex.Message
        };
    }

    private static async Task WriteProblemAsync(HttpContext context, ProblemDetails problem)
    {
        if (context.Response.HasStarted)
        {
            return;
        }

        problem.Instance = context.Request.Path;
        problem.Extensions["traceId"] = context.TraceIdentifier;

        context.Response.Clear();
        context.Response.StatusCode = problem.Status ?? StatusCodes.Status500InternalServerError;

        await context.Response.WriteAsJsonAsync(problem, problem.GetType(), options: null, contentType: "application/problem+json");
    }
}
