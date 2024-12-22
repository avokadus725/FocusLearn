using MQTTnet;
using MQTTnet.Client;
using MQTTnet.Protocol;
using System;
using System.Threading.Tasks;

public class MqttClientService
{
    private readonly IMqttClient _mqttClient;

    public MqttClientService()
    {
        var factory = new MqttFactory();
        _mqttClient = factory.CreateMqttClient();
    }

    // Підключення до брокера
    public async Task ConnectAsync()
    {
        if (!_mqttClient.IsConnected)
        {
            var options = new MqttClientOptionsBuilder()
                .WithTcpServer("broker.emqx.io") // Вказуємо адресу брокера MQTT
                .Build();

            await _mqttClient.ConnectAsync(options);
        }
    }

    // Публікація повідомлення
    public async Task PublishMessageAsync(string topic, string payload)
    {
        try
        {
            if (!_mqttClient.IsConnected)
            {
                await ConnectAsync();
            }

            var message = new MqttApplicationMessageBuilder()
                .WithTopic(topic)
                .WithPayload(payload)
                .WithQualityOfServiceLevel(MqttQualityOfServiceLevel.AtMostOnce)
                .Build();

            await _mqttClient.PublishAsync(message);
            Console.WriteLine($"Повідомлення надіслано: {topic}, Payload: {payload}");
        }
        catch (Exception ex)
        {
            Console.WriteLine($"Помилка публікації повідомлення: {ex.Message}");
        }
    }

}
