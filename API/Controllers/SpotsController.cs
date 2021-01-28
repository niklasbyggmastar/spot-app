using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using SpotAppApi.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net.Http;
using System.Threading.Tasks;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;

namespace SpotAppApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SpotsController : ControllerBase
    {
        private readonly ILogger<SpotsController> _logger;
        private string TableName = "spots";

        public SpotsController(ILogger<SpotsController> logger)
        {
            _logger = logger;
        }

        [HttpGet]
        public  IActionResult Get()
        {
            _logger.LogInformation("LOLLERO");
            return Ok("ok lol");
        }

        [HttpPost]
        [Route("update")]
        public async Task<IActionResult> UpdateSpot([FromBody] Spot spot)
        {
            _logger.LogInformation(spot.description);
            CloudStorageAccount storageAcc = CloudStorageAccount.Parse(Environment.GetEnvironmentVariable("ConnectionString"));
            CloudTableClient tblclient = storageAcc.CreateCloudTableClient();
            CloudTable table = tblclient.GetTableReference(this.TableName);

            TableOperation insertOperation = TableOperation.InsertOrMerge(spot);
            TableResult result = await table.ExecuteAsync(insertOperation).ConfigureAwait(false);
            _logger.LogInformation("OK");
            return Ok(result);

        }


        [HttpPost]
        [Route("distance")]
        public async Task<IActionResult> GetDistanceBetweenPoints([FromBody] List<Coordinates> coordinates)
        {
            Console.WriteLine("CONSOLE");
            _logger.LogInformation("LOLOL1");
            try
            {
                _logger.LogInformation($"LOCATION {coordinates[0].Latitude}, {coordinates[0].Longitude}");
                var http = new HttpClient();
                var result = await http.GetAsync(
                    $"https://maps.googleapis.com/maps/api/distancematrix/json?units=metric&origins={coordinates[0].Latitude},{coordinates[0].Longitude}&destinations={coordinates[1].Latitude},{coordinates[1].Longitude}&key={Environment.GetEnvironmentVariable("API_KEY")}").ConfigureAwait(false);

                _logger.LogInformation(result.StatusCode.ToString());
                var data = await result.Content.ReadAsStringAsync();
                _logger.LogInformation(data);
                return Ok(data);
            } catch (Exception e)
            {
                _logger.LogWarning(e.Message);
                return NotFound(e.Message);
            }
        }
    }
}
