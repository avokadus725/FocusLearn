﻿using FocusLearn.Repositories.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FocusLearn.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AdminController : ControllerBase
    {
        private readonly IAdminService _service;

        public AdminController(IAdminService adminService)
        {
            _service = adminService;
        }

        /// <summary>
        /// Змінити статус користувача
        /// </summary>
        [HttpPost("change-user-status")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ChangeUserStatus([FromQuery] int userId, [FromQuery] string status)
        {
            if (status != "Active" && status != "Inactive")
                return BadRequest("Invalid status. Allowed values are 'Active' and 'Inactive'.");

            var result = await _service.ChangeUserStatusAsync(userId, status);
            if (!result)
                return NotFound("User not found.");

            return Ok($"User status changed to {status}.");
        }

        /// <summary>
        /// Експорт схеми БД та даних
        /// </summary>
        /// <returns></returns>
        [HttpPost("backup-database")]
        public async Task<IActionResult> ExportDatabase()
        {
            try
            {
                var exportFilePath = await _service.BackupDatabaseAsync();
                return Ok(new { Message = "Експорт бази даних успішний", FilePath = exportFilePath });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Помилка експорту бази даних", Details = ex.Message });
            }
        }


        /// <summary>
        /// Відновлення БД
        /// </summary>
        /// <param name="customPath"></param>
        /// <returns></returns>
        [HttpPost("restore-database")]
        public async Task<IActionResult> RestoreDatabase([FromQuery] string customPath = null)
        {
            try
            {
                var success = await _service.RestoreDatabaseAsync(customPath);
                if (success)
                    return Ok("База даних успішно відновлена.");
                else
                    return StatusCode(500, "Не вдалося відновити базу даних.");
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "Помилка відновлення бази даних.", Details = ex.Message });
            }
        }

        /// <summary>
        /// Експорт даних у форматі JSON
        /// </summary>
        [HttpPost("export-data")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ExportData([FromBody] List<string> tableNames)
        {
            try
            {
                // Викликаємо метод сервісу для експорту даних
                var exportedFilePaths = await _service.ExportDataAsync(tableNames);

                // Формуємо відповідь із шляхами до файлів
                return Ok(new
                {
                    Message = "Data exported successfully.",
                    ExportedFiles = exportedFilePaths
                });
            }
            catch (ArgumentException ex)
            {
                return BadRequest(new { Message = ex.Message });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred while exporting data.", Details = ex.Message });
            }
        }

        /// <summary>
        /// Імпорт даних користувачів
        /// </summary>
        [HttpPost("import-data")]
        [Authorize(Roles = "Admin")]
        public async Task<IActionResult> ImportData([FromQuery] string tableName, IFormFile file)
        {
            if (string.IsNullOrWhiteSpace(tableName))
                return BadRequest(new { Message = "You need to enter a table name." });

            if (file == null || file.Length == 0)
                return BadRequest(new { Message = "File was not upload or is empty." });

            try
            {
                var result = await _service.ImportDataAsync(tableName, file);
                return Ok(new { Message = result });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { Message = "An error occurred.", Details = ex.Message });
            }
        }
    }
}

