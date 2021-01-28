using Microsoft.WindowsAzure.Storage.Table;

namespace SpotAppApi
{
    public class Spot : TableEntity
    {
        public Spot() { }

        public Spot(string name, string type, string lat, string lon, string desc, string imgurls, float dist)
        {
            this.name = name;
            this.type = type;
            this.lat = lat;
            this.lon = lon;
            this.description = desc;
            this.imgUrls = imgurls;
            this.distance = dist;
        }

        public string name { get; set; }
        public string type { get; set; }
        public string lat { get; set; }
        public string lon { get; set; }
        public string description { get; set; }
        public string imgUrls { get; set; }
        public float distance { get; set; }
        public bool isLoading { get; set; } = true;
    }
}
