namespace FocusLearn.Repositories.Abstract
{
    public interface ILocalizationService
    {
        string GetString(string key);
        string GetString(string key, params object[] args);
        string CurrentCulture { get; }
        bool IsUkrainianCulture { get; }
    }
}
