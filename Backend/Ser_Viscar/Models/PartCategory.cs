namespace Ser_Viscar.Models
{
    public class PartCategory
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        public ICollection<Part> Parts { get; set; } = new List<Part>();
    }
}
