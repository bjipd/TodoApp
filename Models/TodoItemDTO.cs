using System;
using System.ComponentModel.DataAnnotations;

namespace MakeHasteApp.Models
{
    public class TodoItemDTO
    {
        public long Id { get; set; }
        [Required]
        [MaxLength(100)]
        public string? Name { get; set; }
        public bool IsComplete { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime? EstimatedDueTime { get; set; }
    }
}
