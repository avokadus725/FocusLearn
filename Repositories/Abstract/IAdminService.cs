namespace FocusLearn.Repositories.Abstract
{
    public interface IAdminService
    {
        Task<bool> ChangeUserStatusAsync(int userId, string status);
        Task<string> BackupDatabaseAsync();
        Task<bool> RestoreDatabaseAsync(string customPath = null);
        Task<IEnumerable<string>> ExportDataAsync(IEnumerable<string> tableNames);
        Task<string> ImportDataAsync(string tableName, IFormFile file);
    }
}
