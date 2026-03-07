using System; 

namespace MakeHasteApp.Models
{
    public class TodoItem
    {
        public long Id { get; set; }
        public string? Name { get; set; }
        public bool IsComplete { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime? EstimatedDueTime { get; set; }
        public DateTime? LastReminderAt { get; set; }
        public ApplicationUser User { get; set; }
    }
}