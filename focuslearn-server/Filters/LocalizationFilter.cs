// Filters/LocalizationFilter.cs
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc;
using FocusLearn.Models.DTO;
using System.Globalization;
using Microsoft.Extensions.Localization;
using FocusLearn.Resources;

namespace FocusLearn.Filters
{
    public class LocalizationFilter : IActionFilter
    {
        private readonly IStringLocalizer<SharedResources> _localizer;

        public LocalizationFilter(IStringLocalizer<SharedResources> localizer)
        {
            _localizer = localizer;
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {
            // Логіка перед виконанням дії
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            if (context.Result is ObjectResult objectResult)
            {
                var localizedResponse = new LocalizedResponseDTO<object>
                {
                    Data = objectResult.Value,
                    Success = objectResult.StatusCode >= 200 && objectResult.StatusCode < 300,
                    Language = CultureInfo.CurrentCulture.Name,
                    Message = null
                };

                objectResult.Value = localizedResponse;
            }
        }
    }
}
