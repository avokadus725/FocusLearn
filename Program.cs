using Microsoft.EntityFrameworkCore;
using FocusLearn.Models;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.Extensions.Options;
using System.Security.Claims;


var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// Configure Authentication
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = GoogleDefaults.AuthenticationScheme;
})
.AddCookie(CookieAuthenticationDefaults.AuthenticationScheme)
.AddGoogle(googleOptions =>
{
    googleOptions.ClientId = builder.Configuration["Authentication:Google:ClientId"];
    googleOptions.ClientSecret = builder.Configuration["Authentication:Google:ClientSecret"];
    googleOptions.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    googleOptions.Scope.Add("https://www.googleapis.com/auth/userinfo.email");
    googleOptions.Scope.Add("https://www.googleapis.com/auth/userinfo.profile");
    googleOptions.Events.OnCreatingTicket = (context) =>
    {
        var pictureClaim = context.User.TryGetProperty("picture", out var pictureJson)
            ? pictureJson.GetString()
            : "default_photo_url";

        if (!string.IsNullOrEmpty(pictureClaim))
        {
            context.Identity.AddClaim(new Claim("picture", pictureClaim));
        }

        var localeClaim = context.User.TryGetProperty("locale", out var localeJson)
            ? localeJson.GetString()
            : "en";
        if (!string.IsNullOrEmpty(localeClaim))
        {
            context.Identity.AddClaim(new Claim("locale", localeClaim));
        }

        return Task.CompletedTask;
    };
})
.AddFacebook(facebookOptions =>
{
    facebookOptions.AppId = builder.Configuration["Authentication:Facebook:AppId"];
    facebookOptions.AppSecret = builder.Configuration["Authentication:Facebook:AppSecret"];
    facebookOptions.SignInScheme = CookieAuthenticationDefaults.AuthenticationScheme;
    facebookOptions.Fields.Add("picture");
    facebookOptions.Fields.Add("locale");
    facebookOptions.Events.OnCreatingTicket = (context) =>
    {
        // Отримання URL фото профілю
        var picture = context.User.TryGetProperty("picture", out var pictureJson) &&
                      pictureJson.TryGetProperty("data", out var dataJson) &&
                      dataJson.TryGetProperty("url", out var urlJson)
            ? urlJson.GetString()
            : "default_photo_url";

        if (!string.IsNullOrEmpty(picture))
        {
            context.Identity.AddClaim(new Claim("picture", picture));
        }

        // Отримання мови
        var locale = context.User.TryGetProperty("locale", out var localeJson)
            ? localeJson.GetString()
            : "en";

        if (!string.IsNullOrEmpty(locale))
        {
            context.Identity.AddClaim(new Claim("locale", locale));
        }

        return Task.CompletedTask;
    };

});

// Add database context
builder.Services.AddDbContext<FocusLearnDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// Add memory cache for sessions
builder.Services.AddDistributedMemoryCache();
builder.Services.AddSession(options =>
{
    options.Cookie.Name = ".FocusLearn.Session";
    options.IdleTimeout = TimeSpan.FromMinutes(30); // Session timeout
    options.Cookie.HttpOnly = true;
    options.Cookie.IsEssential = true;
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseSession();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
