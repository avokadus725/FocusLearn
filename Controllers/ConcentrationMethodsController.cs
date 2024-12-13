using FocusLearn.Models.DTO;
using FocusLearn.Repositories.Abstract;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;

namespace FocusLearn.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    //[Authorize(Roles = "Admin")]
    public class ConcentrationMethodsController : ControllerBase
    {
        private readonly IConcentrationMethodService _service;

        public ConcentrationMethodsController(IConcentrationMethodService service)
        {
            _service = service;
        }

        [HttpGet]
        public async Task<IActionResult> GetAllMethods()
        {
            var methods = await _service.GetAllMethodsAsync();
            return Ok(methods);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetMethodById(int id)
        {
            var method = await _service.GetMethodByIdAsync(id);

            if (method == null)
                return NotFound("Method not found.");

            return Ok(method);
        }

        [HttpPost]
        public async Task<IActionResult> AddMethod([FromBody] ConcentrationMethodDTO methodDto)
        {
            await _service.AddMethodAsync(methodDto);
            return StatusCode(StatusCodes.Status201Created);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateMethod(int id, [FromBody] ConcentrationMethodDTO methodDto)
        {
            var result = await _service.UpdateMethodAsync(id, methodDto);

            if (!result)
                return NotFound("Method not found.");

            return NoContent();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteMethod(int id)
        {
            var result = await _service.DeleteMethodAsync(id);

            if (!result)
                return NotFound("Method not found.");

            return NoContent();
        }
    }
}
