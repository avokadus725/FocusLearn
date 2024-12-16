using FocusLearn.Models.DTO;
using FocusLearn.Models.Domain;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using FocusLearn.Repositories.Abstract;
using FocusLearn.Repositories.Implementation;
using System.Security.Claims;


namespace FocusLearn.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    [Authorize] // Доступ лише для авторизованих користувачів
    public class UsersController : ControllerBase
    {
        private readonly IUserService _service;
        public UsersController(IUserService service)
        {
            _service = service;
        }

        [HttpGet("my-profile")]
        public async Task<IActionResult> GetMyProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                      User.FindFirst("sub") ??
                      User.FindFirst("UserId");

            if (userIdClaim == null)
            {
                return Unauthorized("User ID not found in token");
            }

            var userId = int.Parse(userIdClaim.Value);

            var user = await _service.GetUserByIdAsync(userId);

            if (user == null)
                return NotFound("User not found.");

            return Ok(user);
        }

        [HttpPut("my-profile")]
        public async Task<IActionResult> UpdateMyProfile([FromBody] UpdateProfileDTO updateUserDto)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                                  User.FindFirst("sub") ??
                                  User.FindFirst("UserId");


            if (userIdClaim == null)
            {
                return Unauthorized("User ID not found in token");
            }

            var userId = int.Parse(userIdClaim.Value);

            var result = await _service.UpdateUserAsync(userId, updateUserDto);

            if (!result)
                return NotFound("User not found.");

            return NoContent();
        }

        [HttpDelete("my-profile")]
        public async Task<IActionResult> DeleteMyProfile()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier) ??
                      User.FindFirst("sub") ??
                      User.FindFirst("UserId");

            if (userIdClaim == null)
            {
                return Unauthorized("User ID not found in token");
            }
            var userId = int.Parse(userIdClaim.Value);


            var result = await _service.DeleteUserAsync(userId);

            if (!result)
                return NotFound("User not found.");

            return NoContent();
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetUserById(int id)
        {
            var user = await _service.GetUserByIdAsync(id);

            if (user == null)
                return NotFound("User with inserted ID not found.");

            return Ok(user);
        }

        [HttpGet]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> GetAllUsers()
        {
            var users = await _service.GetAllUsersAsync();
            return Ok(users);
        }

        [HttpGet("tutors")]
        public async Task<IActionResult> GetAllTutors()
        {
            var users = await _service.GetAllTutorsAsync();
            return Ok(users);
        }

    }
}

