using System;
using Microsoft.AspNetCore.Identity;

namespace MakeHasteApp.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string DisplayName { get; set; }
    }
}