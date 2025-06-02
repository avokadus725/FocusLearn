namespace FocusLearn.Models.DTO
{
    public class LocalizedResponseDTO<T>
    {
        public T Data { get; set; }
        public string Message { get; set; }
        public bool Success { get; set; }
        public string Language { get; set; }
    }
}
