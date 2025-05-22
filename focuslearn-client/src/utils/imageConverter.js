// Універсальна функція для всіх соціальних мереж
export function getProxiedImageUrl(originalUrl) {
    if (!originalUrl) return null;
    
    // Перевіряємо чи це зображення з соціальних мереж, які потребують проксі
    const needsProxy = 
        originalUrl.includes('googleusercontent.com') ||
        originalUrl.includes('facebook.com') ||
        originalUrl.includes('fbcdn.net') ||
        originalUrl.includes('fbsbx.com') ||
        originalUrl.includes('scontent') ||
        originalUrl.includes('graph.facebook.com');
    
    if (needsProxy) {
        return `https://images.weserv.nl/?url=${encodeURIComponent(originalUrl)}&w=200&h=200&fit=cover&we`;
    }
    
    return originalUrl;
}

// Функція для генерації аватару з ініціалів
export function generateInitialsAvatar(name, email) {
    if (name && name.trim()) {
        // Якщо є ім'я, використовуємо перші літери слів
        return name.split(' ')
                  .map(word => word.charAt(0))
                  .join('')
                  .toUpperCase()
                  .substring(0, 2);
    } else if (email && email.trim()) {
        // Якщо тільки email, використовуємо першу літеру
        return email.charAt(0).toUpperCase();
    }
    
    return 'К'; // За замовчуванням
}

// Функція для перевірки чи URL є валідним зображенням
export function isValidImageUrl(url) {
    if (!url) return false;
    
    try {
        const parsedUrl = new URL(url);
        // Перевіряємо чи є домен у списку відомих
        const validDomains = [
            'googleusercontent.com',
            'facebook.com',
            'fbcdn.net',
            'fbsbx.com',
            'scontent',
            'graph.facebook.com',
            'githubusercontent.com'
        ];
        
        return validDomains.some(domain => parsedUrl.hostname.includes(domain));
    } catch {
        return false;
    }
}