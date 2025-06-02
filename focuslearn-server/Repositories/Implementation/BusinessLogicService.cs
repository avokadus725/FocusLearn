using FocusLearn.Models.Domain;
using FocusLearn.Models.DTO;
using FocusLearn.Repositories.Abstract;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace FocusLearn.Repositories.Implementation
{
    public class BusinessLogicService : IBusinessLogicService
    {
        private readonly FocusLearnDbContext _context;

        public BusinessLogicService(FocusLearnDbContext context)
        {
            _context = context;
        }

        /// <summary>
        /// Обчислення загальної статистики продуктивності користувача
        /// </summary>
        public async Task<UserStatisticsDTO> CalculateUserStatisticsAsync(int userId, DateTime periodStartDate, string periodType)
        {
            var periodEndDate = GetPeriodEndDate(periodStartDate, periodType);

            // ВИПРАВЛЕНО: Перевіряємо чи є дані за період (не чекаємо завершення періоду)
            var now = DateTime.UtcNow;
            var actualEndDate = periodEndDate > now ? now : periodEndDate;

            var sessions = await _context.IoTSessions
                .Where(s => s.UserId == userId &&
                            s.StartTime >= periodStartDate &&
                            s.StartTime < actualEndDate &&
                            s.SessionType == "Concentration")
                .ToListAsync();

            var totalConcentrationTime = sessions.Sum(s => s.Duration ?? 0);
            var breakCount = await _context.IoTSessions
                .CountAsync(s => s.UserId == userId &&
                                 s.StartTime >= periodStartDate &&
                                 s.StartTime < actualEndDate &&
                                 s.SessionType == "Break");

            var missedBreaks = CalculateMissedBreaks(sessions, breakCount);

            return new UserStatisticsDTO
            {
                TotalConcentrationTime = totalConcentrationTime,
                BreakCount = breakCount,
                MissedBreaks = missedBreaks
            };
        }

        /// <summary>
        /// Оновлення статистики для методик
        /// </summary>
        public async Task UpdateMethodStatisticsAsync(int userId, int methodId, DateTime periodStartDate, string periodType)
        {
            var periodEndDate = GetPeriodEndDate(periodStartDate, periodType);
            var now = DateTime.UtcNow;
            var actualEndDate = periodEndDate > now ? now : periodEndDate;

            // Отримуємо сесії для заданого користувача, методики та періоду
            var sessions = await _context.IoTSessions
                .Where(s => s.UserId == userId &&
                            s.MethodId == methodId &&
                            s.StartTime >= periodStartDate &&
                            s.StartTime < actualEndDate)
                .ToListAsync();

            if (!sessions.Any()) return;

            var totalConcentrationTime = sessions
                .Where(s => s.SessionType == "Concentration" && s.Duration.HasValue)
                .Sum(s => s.Duration.Value);

            var breakCount = sessions.Count(s => s.SessionType == "Break");
            var expectedBreaks = CalculateExpectedBreaks(sessions);
            var missedBreaks = Math.Max(0, expectedBreaks - breakCount);

            var existingStatistic = await _context.UserMethodStatistics
                .FirstOrDefaultAsync(s => s.UserId == userId &&
                                          s.MethodId == methodId &&
                                          s.PeriodStartDate == periodStartDate);

            if (existingStatistic == null)
            {
                var newStatistic = new UserMethodStatistics
                {
                    UserId = userId,
                    MethodId = methodId,
                    PeriodStartDate = periodStartDate,
                    PeriodType = periodType,
                    TotalConcentrationTime = totalConcentrationTime,
                    BreakCount = breakCount,
                    MissedBreaks = missedBreaks,
                    LastUpdated = DateTime.UtcNow
                };

                _context.UserMethodStatistics.Add(newStatistic);
            }
            else
            {
                existingStatistic.TotalConcentrationTime = totalConcentrationTime;
                existingStatistic.BreakCount = breakCount;
                existingStatistic.MissedBreaks = missedBreaks;
                existingStatistic.LastUpdated = DateTime.UtcNow;
            }

            await _context.SaveChangesAsync();
        }

        /// <summary>
        /// Визначити найефективнішу методику за період
        /// </summary>
        public async Task<string> GetMostEffectiveMethodAsync(int userId, DateTime periodStartDate, string periodType)
        {
            var periodEndDate = GetPeriodEndDate(periodStartDate, periodType);
            var now = DateTime.UtcNow;
            var actualEndDate = periodEndDate > now ? now : periodEndDate;

            // ВИПРАВЛЕНО: Шукаємо статистику за більш гнучкими критеріями
            var statistics = await _context.UserMethodStatistics
                .Where(s => s.UserId == userId &&
                            s.PeriodType.ToLower() == periodType.ToLower() &&
                            s.PeriodStartDate >= periodStartDate.AddDays(-30) && // Розширюємо пошук
                            s.PeriodStartDate <= actualEndDate)
                .Include(s => s.Method)
                .ToListAsync();

            if (!statistics.Any())
            {
                // Якщо немає готової статистики, рахуємо з IoT сесій
                var sessions = await _context.IoTSessions
                    .Where(s => s.UserId == userId &&
                               s.StartTime >= periodStartDate &&
                               s.StartTime < actualEndDate &&
                               s.SessionType == "Concentration")
                    .Include(s => s.Method)
                    .ToListAsync();

                if (!sessions.Any())
                    return "Немає достатньо даних для визначення найефективнішої методики.";

                var bestSession = sessions
                    .GroupBy(s => s.MethodId)
                    .OrderByDescending(g => g.Sum(s => s.Duration ?? 0))
                    .FirstOrDefault();

                if (bestSession != null)
                {
                    var methodName = bestSession.First().Method?.Title ?? "Невідома методика";
                    return $"У період з {periodStartDate:yyyy-MM-dd} до {actualEndDate:yyyy-MM-dd} найефективнішою методикою концентрації була '{methodName}'.";
                }
            }

            // Визначаємо найефективнішу методику зі статистики
            var mostEffectiveMethod = statistics
                .GroupBy(s => s.MethodId)
                .Select(g => new {
                    MethodId = g.Key,
                    TotalTime = g.Sum(s => s.TotalConcentrationTime),
                    TotalMissedBreaks = g.Sum(s => s.MissedBreaks),
                    Method = g.First().Method
                })
                .OrderByDescending(s => s.TotalTime)
                .ThenBy(s => s.TotalMissedBreaks)
                .FirstOrDefault();

            return mostEffectiveMethod != null
                ? $"У період з {periodStartDate:yyyy-MM-dd} до {actualEndDate:yyyy-MM-dd} найефективнішою методикою концентрації була '{mostEffectiveMethod.Method?.Title}'."
                : "Не вдалося визначити найефективнішу методику.";
        }

        /// <summary>
        /// Розрахунок коефіцієнта продуктивності користувача
        /// </summary>
        public async Task<double> CalculateProductivityCoefficientAsync(int userId, DateTime periodStartDate, string periodType)
        {
            var periodEndDate = GetPeriodEndDate(periodStartDate, periodType);
            var now = DateTime.UtcNow;
            var actualEndDate = periodEndDate > now ? now : periodEndDate;

            // Отримати статистику користувача
            var userStats = await CalculateUserStatisticsAsync(userId, periodStartDate, periodType);

            // Отримати кількість виконаних завдань
            var completedTasks = await _context.Assignments
                .CountAsync(a => a.StudentId == userId &&
                                a.Status == "Completed" &&
                                a.CreatedAt >= periodStartDate &&
                                a.CreatedAt <= actualEndDate);

            // Отримати загальну кількість завдань
            var totalTasks = await _context.Assignments
                .CountAsync(a => a.StudentId == userId &&
                                a.CreatedAt >= periodStartDate &&
                                a.CreatedAt <= actualEndDate);

            // Розрахунок коефіцієнту продуктивності
            return CalculateProductivityCoefficient(
                userStats.TotalConcentrationTime,
                userStats.BreakCount,
                userStats.MissedBreaks,
                completedTasks,
                totalTasks
            );
        }

        /// <summary>
        /// Прогнозування покращення продуктивності
        /// </summary>
        public async Task<ProductivityPredictionDTO> PredictProductivityImprovementAsync(
            int userId,
            DateTime periodStartDate,
            string periodType)
        {
            // Отримати поточний коефіцієнт продуктивності
            double currentProductivity = await CalculateProductivityCoefficientAsync(
                userId,
                periodStartDate,
                periodType);

            // Знайти найефективнішу методику для інших користувачів
            var optimalMethod = await _context.UserMethodStatistics
                .Where(s => s.UserId != userId && s.PeriodType.ToLower() == periodType.ToLower())
                .GroupBy(s => s.MethodId)
                .Select(g => new {
                    MethodId = g.Key,
                    AvgConcentrationTime = g.Average(s => s.TotalConcentrationTime),
                    AvgBreakCount = g.Average(s => s.BreakCount),
                    AvgMissedBreaks = g.Average(s => s.MissedBreaks)
                })
                .OrderByDescending(x => x.AvgConcentrationTime)
                .FirstOrDefaultAsync();

            // Отримати інформацію про виконані завдання
            var periodEndDate = GetPeriodEndDate(periodStartDate, periodType);
            var now = DateTime.UtcNow;
            var actualEndDate = periodEndDate > now ? now : periodEndDate;

            var assignments = await _context.Assignments
                .Where(a => a.StudentId == userId &&
                           a.CreatedAt >= periodStartDate &&
                           a.CreatedAt <= actualEndDate)
                .ToListAsync();

            int completedTasks = assignments.Count(a => a.Status == "Completed");
            int totalTasks = assignments.Count;

            double potentialProductivity = currentProductivity;

            // Якщо є оптимальна методика, розрахувати потенційну продуктивність
            if (optimalMethod != null)
            {
                potentialProductivity = CalculateProductivityCoefficient(
                    (int)optimalMethod.AvgConcentrationTime,
                    (int)optimalMethod.AvgBreakCount,
                    (int)optimalMethod.AvgMissedBreaks,
                    completedTasks,
                    totalTasks
                );
            }
            else
            {
                // Базове покращення на 20%
                potentialProductivity = Math.Min(100, currentProductivity * 1.2);
            }

            // Розрахунок відсотка покращення
            double improvementPercentage = currentProductivity > 0
                ? ((potentialProductivity - currentProductivity) / currentProductivity) * 100
                : 20; // Базове покращення якщо поточна продуктивність 0

            // Генерація рекомендацій
            var recommendations = await GenerateRecommendationsAsync(userId);

            return new ProductivityPredictionDTO
            {
                CurrentProductivity = Math.Round(currentProductivity, 2),
                PotentialProductivity = Math.Round(potentialProductivity, 2),
                ImprovementPercentage = Math.Round(improvementPercentage, 2),
                Recommendations = recommendations
            };
        }

        /// <summary>
        /// Аналіз тренду продуктивності
        /// </summary>
        public async Task<ProductivityTrendDTO> AnalyzeProductivityTrendAsync(int userId, int daysToAnalyze)
        {
            var endDate = DateTime.UtcNow;
            var startDate = endDate.AddDays(-daysToAnalyze);

            // Отримати сесії концентрації за вказаний період
            var sessions = await _context.IoTSessions
                .Where(s => s.UserId == userId &&
                           s.StartTime >= startDate &&
                           s.SessionType == "Concentration")
                .OrderBy(s => s.StartTime)
                .ToListAsync();

            if (sessions.Count < 2)
            {
                return new ProductivityTrendDTO
                {
                    Slope = 0,
                    Intercept = 0,
                    IsPositive = false,
                    CorrelationCoefficient = 0,
                    DailyData = new List<DailyProductivityDTO>()
                };
            }

            // Групування сесій за днями
            var dailySessions = sessions
                .GroupBy(s => s.StartTime.Date)
                .OrderBy(g => g.Key)
                .ToList();

            // Підготовка даних для лінійної регресії
            var xValues = new List<double>(); // Дні від початку
            var yValues = new List<double>(); // Продуктивність у відповідний день
            var dailyData = new List<DailyProductivityDTO>();

            var firstDay = dailySessions.First().Key;

            foreach (var day in dailySessions)
            {
                var dayIndex = (day.Key - firstDay).Days;
                var daySessions = day.ToList();

                // Отримати завдання за день
                var dailyAssignments = await _context.Assignments
                    .Where(a => a.StudentId == userId &&
                              a.CreatedAt.HasValue &&
                              a.CreatedAt.Value.Date == day.Key.Date)
                    .ToListAsync();

                int completedTasks = dailyAssignments.Count(a => a.Status == "Completed");
                int totalTasks = dailyAssignments.Count;

                // Розрахувати продуктивність за день
                int totalConcentrationTime = daySessions.Sum(s => s.Duration ?? 0);
                int breakCount = await _context.IoTSessions
                    .CountAsync(s => s.UserId == userId &&
                                    s.StartTime.Date == day.Key.Date &&
                                    s.SessionType == "Break");

                int missedBreaks = CalculateMissedBreaks(daySessions, breakCount);

                double dailyProductivity = CalculateProductivityCoefficient(
                    totalConcentrationTime,
                    breakCount,
                    missedBreaks,
                    completedTasks,
                    totalTasks
                );

                xValues.Add(dayIndex);
                yValues.Add(dailyProductivity);

                dailyData.Add(new DailyProductivityDTO
                {
                    Date = day.Key,
                    Productivity = dailyProductivity
                });
            }

            // Обчислення лінійної регресії
            double n = xValues.Count;
            double sumX = xValues.Sum();
            double sumY = yValues.Sum();
            double sumXY = 0;
            double sumX2 = 0;

            for (int i = 0; i < n; i++)
            {
                sumXY += xValues[i] * yValues[i];
                sumX2 += xValues[i] * xValues[i];
            }

            // Обчислення нахилу (slope) та перетину (intercept)
            double slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
            double intercept = (sumY - slope * sumX) / n;

            // Обчислення коефіцієнта кореляції
            double sumY2 = yValues.Sum(y => y * y);
            double numerator = n * sumXY - sumX * sumY;
            double denominator = Math.Sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY));
            double correlation = denominator != 0 ? numerator / denominator : 0;

            return new ProductivityTrendDTO
            {
                Slope = Math.Round(slope, 4),
                Intercept = Math.Round(intercept, 2),
                IsPositive = slope > 0,
                CorrelationCoefficient = Math.Round(correlation, 4),
                DailyData = dailyData
            };
        }

        #region Private Methods

        /// <summary>
        /// Розрахунок очікуваних перерв
        /// </summary>
        private int CalculateExpectedBreaks(IEnumerable<IoTSession> sessions)
        {
            return sessions.Count(s => s.SessionType == "Concentration") / 2;
        }

        /// <summary>
        /// Розрахунок пропущених перерв
        /// </summary>
        private int CalculateMissedBreaks(IEnumerable<IoTSession> sessions, int actualBreakCount)
        {
            var expectedBreakCount = CalculateExpectedBreaks(sessions);
            return Math.Max(0, expectedBreakCount - actualBreakCount);
        }

        /// <summary>
        /// Обчислення кінцевої дати періоду
        /// </summary>
        private DateTime GetPeriodEndDate(DateTime periodStartDate, string periodType)
        {
            return periodType.ToLower() switch
            {
                "day" => periodStartDate.AddDays(1),
                "week" => periodStartDate.AddDays(7),
                "month" => periodStartDate.AddMonths(1),
                _ => throw new ArgumentException("Невірний тип періоду. Допустимі значення: 'Day', 'Week', 'Month'.")
            };
        }

        /// <summary>
        /// Розрахунок коефіцієнта продуктивності
        /// </summary>
        private double CalculateProductivityCoefficient(
            int totalConcentrationTime,
            int breakCount,
            int missedBreaks,
            int completedTasks,
            int totalTasks)
        {
            // Коефіцієнт концентрації (час концентрації в годинах)
            double concentrationCoefficient = totalConcentrationTime / 60.0;

            // Коефіцієнт балансу перерв (чим менше пропущених перерв, тим краще)
            double breakBalanceCoefficient = breakCount > 0
                ? 1.0 - (missedBreaks / (double)(breakCount + missedBreaks))
                : 0;

            // Коефіцієнт виконання завдань
            double taskCompletionCoefficient = totalTasks > 0
                ? completedTasks / (double)totalTasks
                : 0;

            // Загальний коефіцієнт продуктивності (шкала 0-100)
            double productivityCoefficient = (
                concentrationCoefficient * 0.4 +
                breakBalanceCoefficient * 0.3 +
                taskCompletionCoefficient * 0.3
            ) * 100;

            // Обмеження результату від 0 до 100
            return Math.Min(100, Math.Max(0, productivityCoefficient));
        }

        /// <summary>
        /// Генерація рекомендацій для покращення продуктивності
        /// </summary>
        private async Task<List<string>> GenerateRecommendationsAsync(int userId)
        {
            var recommendations = new List<string>();

            // Отримати статистику користувача за останні 30 днів
            var endDate = DateTime.UtcNow;
            var startDate = endDate.AddDays(-30);

            var userStats = await _context.UserMethodStatistics
                .Where(s => s.UserId == userId && s.PeriodStartDate >= startDate)
                .Include(s => s.Method)
                .ToListAsync();

            var iotSessions = await _context.IoTSessions
                .Where(s => s.UserId == userId && s.StartTime >= startDate)
                .ToListAsync();

            // Аналіз статистики та генерація рекомендацій

            // 1. Пропущені перерви
            if (userStats.Any())
            {
                var totalBreaks = userStats.Sum(s => s.BreakCount) + userStats.Sum(s => s.MissedBreaks);
                var missedBreaksPercentage = totalBreaks > 0 ? userStats.Sum(s => s.MissedBreaks) / (double)totalBreaks : 0;

                if (missedBreaksPercentage > 0.3) // Якщо пропущено більше 30% перерв
                {
                    recommendations.Add("Рекомендуємо більш регулярно робити перерви. Це допоможе зберегти концентрацію протягом довшого часу.");
                }
            }

            // 2. Аналіз найбільш продуктивного часу
            var productiveSessions = iotSessions
                .Where(s => s.SessionType == "Concentration" && s.Duration.HasValue)
                .OrderByDescending(s => s.Duration.Value)
                .ToList();

            if (productiveSessions.Any())
            {
                var productiveHours = productiveSessions
                    .GroupBy(s => s.StartTime.Hour)
                    .OrderByDescending(g => g.Sum(s => s.Duration ?? 0))
                    .Take(2)
                    .Select(g => g.Key)
                    .ToList();

                if (productiveHours.Count >= 2)
                {
                    recommendations.Add($"Найбільш продуктивний час для вас: {productiveHours[0]}:00-{productiveHours[0] + 1}:00 та {productiveHours[1]}:00-{productiveHours[1] + 1}:00. Плануйте складні завдання на цей час.");
                }
            }

            // 3. Рекомендації щодо методик
            var mostEffectiveMethod = userStats
                .GroupBy(s => s.MethodId)
                .OrderByDescending(g => g.Sum(s => s.TotalConcentrationTime) / Math.Max(1, g.Sum(s => s.MissedBreaks)))
                .FirstOrDefault();

            if (mostEffectiveMethod != null)
            {
                var method = await _context.ConcentrationMethods
                    .Where(m => m.MethodId == mostEffectiveMethod.Key)
                    .FirstOrDefaultAsync();

                if (method != null)
                {
                    recommendations.Add($"Методика \"{method.Title}\" дає найкращі результати для вас. Використовуйте її для важливих завдань.");
                }
            }

            // Базові рекомендації, якщо немає достатньо даних
            if (!recommendations.Any())
            {
                recommendations.Add("Почніть використовувати методики концентрації регулярно для отримання персоналізованих рекомендацій.");
                recommendations.Add("Робіть регулярні перерви під час роботи - це покращує загальну продуктивність.");
                recommendations.Add("Експериментуйте з різними методами концентрації, щоб знайти найефективніший для себе.");
            }

            return recommendations;
        }

        #endregion
    }
}