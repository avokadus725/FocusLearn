using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using FocusLearn.Models;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.Facebook;
using FocusLearn.Repositories.Abstract;

namespace FocusLearn.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly IAuthService _service;
        private readonly IConfiguration _configuration;

        public AuthController(IAuthService authService, IConfiguration configuration)
        {
            _service = authService;
            _configuration = configuration;
        }

        /// <summary>
        /// Авторизація за допомогою Google
        /// </summary>
        [HttpGet("login-google")]
        public IActionResult LoginGoogle()
        {
            var redirectUrl = Url.Action(nameof(GoogleResponse), "Auth");
            return Challenge(new AuthenticationProperties { RedirectUri = redirectUrl }, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("google-response")]
        public async Task<IActionResult> GoogleResponse()
        {
            try
            {
                var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
                if (result?.Principal == null)
                {
                    return Unauthorized("Google authentication failed.");
                }

                var token = await _service.AuthenticateGoogleUserAsync(result.Principal);
                
                var userAgent = HttpContext.Request.Headers.UserAgent.ToString();
                var host = HttpContext.Request.Host.Host;
                
                // Якщо запит прийшов через ngrok І це Android WebView
                if (host.Contains("ngrok") && userAgent.Contains("Android") && userAgent.Contains("WebView"))
                {
                    return Redirect($"https://{HttpContext.Request.Host}/auth-callback.html?token={token}");
                }
                
                // ВСЕ ІНШЕ - веб-сайт
                var clientUrl = _configuration["ClientUrl"];
                if (string.IsNullOrEmpty(clientUrl))
                {
                    clientUrl = "http://localhost:3000";
                }
                
                return Redirect($"{clientUrl}/auth-callback.html?token={token}");
            }
            catch (Exception ex)
            {
                return Unauthorized("Authentication failed.");
            }
        }

        /// <summary>
        /// Авторизація за допомогою Facebook
        /// </summary>
        [HttpGet("login-facebook")]
        public IActionResult LoginFacebook()
        {
            var redirectUrl = Url.Action(nameof(FacebookResponse), "Auth");
            return Challenge(new AuthenticationProperties { RedirectUri = redirectUrl }, FacebookDefaults.AuthenticationScheme);
        }

        [HttpGet("facebook-response")]
        public async Task<IActionResult> FacebookResponse()
        {
            var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            if (result?.Principal == null)
                return Unauthorized("Authentication failed.");

            var token = await _service.AuthenticateFacebookUserAsync(result.Principal);
            var clientUrl = _configuration["ClientUrl"];
            if (string.IsNullOrEmpty(clientUrl))
            {
                clientUrl = "http://localhost:3000"; // Значення за замовчуванням
            }

            // Перенаправляємо на сторінку обробки авторизації з токеном
            return Redirect($"{clientUrl}/auth-callback.html?token={token}");
        }
    }
}
