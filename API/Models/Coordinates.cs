namespace SpotAppApi.Models
{
    public class Coordinates
    {
        public string Latitude { get; set; }
        public string Longitude { get; set; }

        public Coordinates() { }

        public Coordinates(string latitude, string longitude)
        {
            Latitude = latitude;
            Longitude = longitude;
        }
    }
}
