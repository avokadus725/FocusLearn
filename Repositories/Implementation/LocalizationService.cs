// Repositories/Implementation/LocalizationService.cs
using Microsoft.Extensions.Localization;
using System.Globalization;
using FocusLearn.Repositories.Abstract;
using FocusLearn.Resources;

namespace FocusLearn.Repositories.Implementation
{
    public class LocalizationService : ILocalizationService
    {
        private readonly IStringLocalizer<SharedResources> _localizer;

        public LocalizationService(IStringLocalizer<SharedResources> localizer)
        {
            _localizer = localizer;
        }

        public string GetString(string key)
        {
            return _localizer[key];
        }

        public string GetString(string key, params object[] args)
        {
            return _localizer[key, args];
        }

        public string CurrentCulture => CultureInfo.CurrentCulture.Name;

        public bool IsUkrainianCulture => CultureInfo.CurrentCulture.Name.StartsWith("uk");
    }
}
