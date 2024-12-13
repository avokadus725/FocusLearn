using FocusLearn.Models.DTO;
using FocusLearn.Repositories.Abstract;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FocusLearn.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Autorize]
    public class LearningMaterialsController : ControllerBase
    {
        private readonly ILearningMaterialService _service;

        public LearningMaterialsController(ILearningMaterialService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMaterials()
        {
            var materials = await _service.GetAllMaterialsAsync();
            return Ok(materials);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMaterialById(int id)
        {
            var material = await _service.GetMaterialByIdAsync(id);

            if (material == null)
                return NotFound("Material not found.");

            return Ok(material);
        }

        [HttpPost]
        public async Task<IActionResult> AddMaterial([FromBody] LearningMaterialDTO materialDto)
        {
            var creatorId = int.Parse(User.FindFirst("UserId")?.Value ?? "0");

            if (creatorId == 0)
                return Unauthorized("User ID not found in token.");

            await _service.AddMaterialAsync(creatorId, materialDto);
            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMaterial(int id, [FromBody] LearningMaterialDTO materialDto)
        {
            var result = await _service.UpdateMaterialAsync(id, materialDto);

            if (!result)
                return NotFound("Material not found.");

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMaterial(int id)
        {
            var result = await _service.DeleteMaterialAsync(id);

            if (!result)
                return NotFound("Material not found.");

            return NoContent();
        }
    }
}
