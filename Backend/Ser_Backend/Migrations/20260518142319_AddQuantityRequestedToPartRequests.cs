using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Ser_Backend.Migrations
{
    /// <inheritdoc />
    public partial class AddQuantityRequestedToPartRequests : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "QuantityRequested",
                table: "PartRequests",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "QuantityRequested",
                table: "PartRequests");
        }
    }
}
