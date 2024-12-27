using FocusLearn.Models.Domain;
using FocusLearn.Repositories.Abstract;
using Microsoft.Data.SqlClient;
using Microsoft.EntityFrameworkCore;
using System.IO;
using System.Text.Json;

namespace FocusLearn.Repositories.Implementation
{
    public class AdminService : IAdminService
    {
        private readonly FocusLearnDbContext _context;
        private readonly IConfiguration _configuration;
        public AdminService(FocusLearnDbContext context, IConfiguration configuration)
        {
            _context = context;
            _configuration = configuration;
        }

        /// <summary>
        /// Змінити статус користувача
        /// </summary>
        public async Task<bool> ChangeUserStatusAsync(int userId, string status)
        {
            var user = await _context.Users.FindAsync(userId);
            if (user == null)
                return false;

            user.ProfileStatus = status;
            await _context.SaveChangesAsync();
            return true;
        }

        /// <summary>
        /// Зробити бекап БД
        /// </summary>
        public async Task<string> BackupDatabaseAsync()
        {
            try
            {
                var backupFileName = $"FocusLearnDB_{DateTime.UtcNow:yyyyMMdd_HHmmss}.bak";
                var backupPath = Path.Combine("C:\\SQLBackups", backupFileName);

                if (!Directory.Exists("Backups"))
                    Directory.CreateDirectory("Backups");

                var sql = $"BACKUP DATABASE FocusLearnDB TO DISK = '{backupPath}'";

                await using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();
                using var command = new SqlCommand(sql, connection);
                await command.ExecuteNonQueryAsync();

                return backupPath;
            }
            catch (Exception ex)
            {
                throw new Exception($"Error creating backup: {ex.Message}");
            }
        }

        /// <summary>
        /// Відновити базу даних з бекапу
        /// </summary>
        /// <param name="customPath">Шлях до SQL-файлу (опційно)</param>
        /// <returns>Чи успішно відновлено базу даних</returns>
        public async Task<bool> RestoreDatabaseAsync(string customPath = null)
        {
            try
            {
                string sqlFilePath;

                // Перевіряємо, чи є файли у стандартній папці Backups
                var defaultBackupPath = Path.Combine(Environment.CurrentDirectory, "Backups");
                if (!Directory.Exists(defaultBackupPath))
                {
                    Directory.CreateDirectory(defaultBackupPath);
                }

                var backupFiles = Directory.GetFiles(defaultBackupPath, "*.bak");

                if (backupFiles.Any())
                {
                    // Використовуємо останній бекап із папки
                    sqlFilePath = backupFiles.OrderByDescending(File.GetCreationTime).First();
                    Console.WriteLine($"Використовується останній бекап із папки Backups: {sqlFilePath}");
                }
                else if (!string.IsNullOrWhiteSpace(customPath) && File.Exists(customPath))
                {
                    // Використовуємо вказаний шлях
                    sqlFilePath = customPath;
                    Console.WriteLine($"Використовується бекап із вказаного шляху: {sqlFilePath}");
                }
                else
                {
                    throw new FileNotFoundException("Бекапи відсутні. Вкажіть шлях до бекапу.");
                }

                // Виконуємо відновлення бази даних
                var sql = $"RESTORE DATABASE FocusLearnDB FROM DISK = '{sqlFilePath}' WITH REPLACE";

                await using var connection = new SqlConnection(_configuration.GetConnectionString("DefaultConnection"));
                await connection.OpenAsync();

                using var command = new SqlCommand(sql, connection);
                await command.ExecuteNonQueryAsync();

                return true;
            }
            catch (Exception ex)
            {
                throw new Exception($"Помилка відновлення бази даних: {ex.Message}");
            }
        }

        /// <summary>
        /// Експорт даних у форматі JSON
        /// </summary>
        public async Task<IEnumerable<string>> ExportDataAsync(IEnumerable<string> tableNames)
        {
            var exportedFilePaths = new List<string>();

            foreach (var tableName in tableNames)
            {
                string jsonData;
                switch (tableName.ToLower())
                {
                    case "users":
                        var users = await _context.Users.ToListAsync();
                        jsonData = JsonSerializer.Serialize(users);
                        break;

                    case "assignments":
                        var assignments = await _context.Assignments.ToListAsync();
                        jsonData = JsonSerializer.Serialize(assignments);
                        break;

                    case "learningmaterials":
                        var materials = await _context.LearningMaterials.ToListAsync();
                        jsonData = JsonSerializer.Serialize(materials);
                        break;

                    default:
                        throw new ArgumentException($"Таблиця '{tableName}' не підтримується для експорту.");
                }

                var fileName = $"{tableName}_{DateTime.UtcNow:yyyyMMdd_HHmmss}.json";
                var filePath = Path.Combine(Environment.CurrentDirectory, "Exports", fileName);

                if (!Directory.Exists("Exports"))
                    Directory.CreateDirectory("Exports");

                await File.WriteAllTextAsync(filePath, jsonData);
                exportedFilePaths.Add(filePath);
            }

            return exportedFilePaths;
        }

        /// <summary>
        /// Імпорт даних користувачів
        /// </summary>
        public async Task<string> ImportDataAsync(string tableName, IFormFile file)
        {
            if (file == null || file.Length == 0)
                return "Файл не завантажено або він порожній.";

            var uploadsPath = Path.Combine(Environment.CurrentDirectory, "Uploads");
            if (!Directory.Exists(uploadsPath))
                Directory.CreateDirectory(uploadsPath);

            var filePath = Path.Combine(uploadsPath, file.FileName);
            using (var stream = new FileStream(filePath, FileMode.Create))
            {
                await file.CopyToAsync(stream);
            }

            var jsonData = await File.ReadAllTextAsync(filePath);

            switch (tableName.ToLower())
            {
                case "users":
                    var users = JsonSerializer.Deserialize<List<User>>(jsonData);
                    if (users != null)
                    {
                        _context.Users.AddRange(users);
                        await _context.SaveChangesAsync();
                    }
                    break;

                case "assignments":
                    var assignments = JsonSerializer.Deserialize<List<Assignment>>(jsonData);
                    if (assignments != null)
                    {
                        _context.Assignments.AddRange(assignments);
                        await _context.SaveChangesAsync();
                    }
                    break;

                case "learningmaterials":
                    var materials = JsonSerializer.Deserialize<List<LearningMaterial>>(jsonData);
                    if (materials != null)
                    {
                        _context.LearningMaterials.AddRange(materials);
                        await _context.SaveChangesAsync();
                    }
                    break;

                case "iotsessions":
                    var sessions = JsonSerializer.Deserialize<List<IoTSession>>(jsonData);
                    if (sessions != null)
                    {
                        _context.IoTSessions.AddRange(sessions);
                        await _context.SaveChangesAsync();
                    }
                    break;

                default:
                    return $"Таблиця '{tableName}' не підтримується для імпорту.";
            }

            return $"Дані успішно імпортовані у таблицю {tableName}.";
        }
    }
}

