using FocusLearn.Models.DTO;
using FocusLearn.Repositories.Abstract;
using FocusLearn.Resources;
using Microsoft.AspNetCore.Localization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Localization;
using System.Security.Claims;

namespace FocusLearn.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class LocalizationController : Controller
    {
        private readonly IStringLocalizer<SharedResources> _localizer;
        private readonly IUserService _userService;

        public LocalizationController(
            IStringLocalizer<SharedResources> localizer,
            IUserService userService)
        {
            _localizer = localizer;
            _userService = userService;
        }

        /// <summary>
        /// Змінити мову для поточного запиту та зберегти в cookie
        /// </summary>
        [HttpGet("set-language")]
        public IActionResult SetLanguage([FromQuery] string culture)
        {
            if (string.IsNullOrWhiteSpace(culture))
            {
                return BadRequest("Culture parameter is required");
            }

            // Встановлюємо cookie з бажаною культурою
            Response.Cookies.Append(
                CookieRequestCultureProvider.DefaultCookieName,
                CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(culture)),
                new CookieOptions { Expires = DateTimeOffset.UtcNow.AddYears(1) }
            );

            return Ok(new { Message = _localizer["LanguageChanged", culture] });
        }

        /// <summary>
        /// Змінити мову для користувача (зберігається в профілі)
        /// </summary>
        [HttpPost("change-user-language")]
        public async Task<IActionResult> ChangeUserLanguage([FromQuery] string language)
        {
            if (string.IsNullOrWhiteSpace(language))
            {
                return BadRequest("Language parameter is required");
            }

            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                  User.FindFirst("sub") ??
                  User.FindFirst("UserId");

            if (userIdClaim == null)
            {
                return Unauthorized("User ID not found in token");
            }

            var userId = int.Parse(userIdClaim.Value);

            var updateProfileDto = new UpdateProfileDTO { Language = language };
            var result = await _userService.UpdateUserAsync(userId, updateProfileDto);

            if (!result)
                return NotFound(_localizer["UserNotFound"]);

            Response.Cookies.Append(
                CookieRequestCultureProvider.DefaultCookieName,
                CookieRequestCultureProvider.MakeCookieValue(new RequestCulture(language)),
                new CookieOptions { Expires = DateTimeOffset.UtcNow.AddYears(1) }
            );

            return Ok(new { Message = _localizer["LanguageChanged", language] });
        }
    }
}
