using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Microsoft.WindowsAzure.Storage;
using Microsoft.WindowsAzure.Storage.Table;
using SpotAppApi.Models;
using System;
using System.Collections.Generic;
using System.ComponentModel;
using System.IO;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;

namespace SpotAppApi.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SpotsController : ControllerBase
    {
        private readonly ILogger<SpotsController> _logger;
        private string TableName = "spots";
        private readonly BlobServiceClient _blobServiceClient;

        public SpotsController(ILogger<SpotsController> logger, BlobServiceClient blobServiceClient)
        {
            _logger = logger;
            _blobServiceClient = blobServiceClient;
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
            if (spot.PartitionKey == null)
            {
                spot.PartitionKey = "spot";
            }
            CloudStorageAccount storageAcc = CloudStorageAccount.Parse(Environment.GetEnvironmentVariable("ConnectionString"));
            CloudTableClient tblclient = storageAcc.CreateCloudTableClient();
            CloudTable table = tblclient.GetTableReference(this.TableName);

            TableOperation insertOperation = TableOperation.InsertOrMerge(spot);
            TableResult result = await table.ExecuteAsync(insertOperation).ConfigureAwait(false);
            _logger.LogInformation("OK");
            return Ok(result);

        }

        [HttpPost]
        [Route("remove-spot")]
        public async Task<IActionResult> RemoveSpot([FromBody] Spot spot)
        {
            spot.ETag = "*";

            foreach (PropertyDescriptor descriptor in TypeDescriptor.GetProperties(spot))
            {
                string name = descriptor.Name;
                object value = descriptor.GetValue(spot);
                _logger.LogInformation("{0}={1}", name, value);
            }

            CloudStorageAccount storageAcc = CloudStorageAccount.Parse(Environment.GetEnvironmentVariable("ConnectionString"));
            CloudTableClient tblclient = storageAcc.CreateCloudTableClient();
            CloudTable table = tblclient.GetTableReference(this.TableName);

            TableOperation insertOperation = TableOperation.Delete(spot);
            TableResult result = await table.ExecuteAsync(insertOperation).ConfigureAwait(false);
            _logger.LogInformation("OK");
            return Ok(result);

        }

        [HttpPost]
        [Route("add-image")]
        public async Task<IActionResult> AddImage([FromBody] JsonElement data)
        {
            string filename = data.GetProperty("name").GetString();
            string b64image = data.GetProperty("data").GetString().Split(',')[1];
            var bytes = Convert.FromBase64String(b64image);

            var containerClient = _blobServiceClient.GetBlobContainerClient("images");
            var blobClient = containerClient.GetBlobClient($"{filename}.jpg");

            using (var fileStream = new MemoryStream(bytes))
            {
                // upload image stream to blob
                await blobClient.UploadAsync(fileStream, new BlobHttpHeaders { ContentType = "image/jpeg" });
            }
            return Ok("{\"result\":\"" + blobClient.Uri + "?sp=racwdl&st=2021-02-05T13:51:37Z&se=2028-01-06T13:51:00Z&sv=2019-12-12&sr=c&sig=lsFQhB%2F6GdUvCgj8%2Fk%2FB4qDqKfPCaBspOlMVnUarKdo%3D\"}");
        }

        [HttpPost]
        [Route("get-coordinates")]
        public async Task<IActionResult> GetCoordinatesFromAddress([FromBody] JsonElement json)
        {
            try
            {
                string address = json.GetProperty("address").GetString();
                _logger.LogInformation($"ADDRESS {address}");
                var http = new HttpClient();
                var result = await http.GetAsync(
                    $"https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={Environment.GetEnvironmentVariable("API_KEY")}").ConfigureAwait(false);

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

        [HttpPost]
        [Route("distance")]
        public async Task<IActionResult> GetDistanceBetweenPoints([FromBody] List<Coordinates> coordinates)
        {
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
