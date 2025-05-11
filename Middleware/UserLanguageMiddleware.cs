// Middleware/UserLanguageMiddleware.cs
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using FocusLearn.Models.Domain;
using FocusLearn.Repositories.Abstract;
using System.Globalization;
using System.Security.Claims;


namespace FocusLearn.Middleware
{
    public class UserLanguageMiddleware
    {
        private readonly RequestDelegate _next;

        public UserLanguageMiddleware(RequestDelegate next)
        {
            _next = next;
        }

        public async Task InvokeAsync(HttpContext context, IUserService userService)
        {
            if (context.User.Identity.IsAuthenticated)
            {
                var userIdClaim = context.User.FindFirst(ClaimTypes.NameIdentifier) ??
                      context.User.FindFirst("sub") ??
                      context.User.FindFirst("UserId");

                if (userIdClaim != null)
                {
                    var userId = int.Parse(userIdClaim.Value);
                    var user = await userService.GetUserByIdAsync(userId);

                    if (user != null && !string.IsNullOrEmpty(user.Language))
                    {
                        var requestCulture = new RequestCulture(user.Language);
                        context.Features.Set<IRequestCultureFeature>(
                            new RequestCultureFeature(requestCulture, null)
                        );

                        CultureInfo.CurrentCulture = new CultureInfo(user.Language);
                        CultureInfo.CurrentUICulture = new CultureInfo(user.Language);
                    }
                }
            }

            await _next(context);
        }
    }
    public static class UserLanguageMiddlewareExtensions
    {
        public static IApplicationBuilder UseUserLanguage(
            this IApplicationBuilder builder)
        {
            return builder.UseMiddleware<UserLanguageMiddleware>();
        }
    }
}
