using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Mvc;
using FocusLearn.Models;
using System.Security.Claims;
using Microsoft.EntityFrameworkCore;

namespace FocusLearn.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase
    {
        private readonly FocusLearnDbContext _context;

        public AuthController(FocusLearnDbContext context)
        {
            _context = context;
        }

        [HttpGet("login-google")]
        public IActionResult LoginGoogle()
        {
            var redirectUrl = Url.Action("GoogleResponse", "Auth");
            return Challenge(new AuthenticationProperties { RedirectUri = redirectUrl }, GoogleDefaults.AuthenticationScheme);
        }

        [HttpGet("google-response")]
        public async Task<IActionResult> GoogleResponse()
        {
            var result = await HttpContext.AuthenticateAsync(CookieAuthenticationDefaults.AuthenticationScheme);
            if (result?.Principal == null)
                return Unauthorized("Authentication failed.");

            var email = result.Principal.FindFirstValue(ClaimTypes.Email);
            var name = result.Principal.FindFirstValue(ClaimTypes.Name);
            var providerId = result.Principal.FindFirstValue(ClaimTypes.NameIdentifier);
            var photoUrl = result.Principal.FindFirstValue("picture") ?? "default_photo_url";
            var language = result.Principal.FindFirstValue("locale");

            var user = await _context.Users
                .FirstOrDefaultAsync(u => u.ProviderId == providerId && u.AuthProvider == "Google");

            if (user == null)
            {
                user = new User
                {
                    UserName = name,
                    Email = email,
                    Role = "Student",
                    ProfilePhoto = photoUrl,
                    Language = language,
                    ProfileStatus = "Active",
                    AuthProvider = "Google",
                    ProviderId = providerId,
                    RegistrationDate = DateTime.UtcNow,
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();
            }

            return Ok(new { message = "Logged in successfully.", user });
        }
    }
}
