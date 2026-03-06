using System; 

namespace MakeHasteApp.Models
{
    public class TodoItem
    {
        public long Id { get; set; }
        public string? Name { get; set; }
        public bool IsComplete { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public TimeSpan? CompletedAt { get; set; }
        public string? Secret { get; set; }
    }
}