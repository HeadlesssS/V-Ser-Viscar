using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace Ser_Backend.Services.Pdf
{
    internal static class PdfLayout
    {
        public const string Brand = "#CC1E1E";

        public static byte[] Generate(Action<IDocumentContainer> compose) =>
            Document.Create(compose).GeneratePdf();

        public static void Page(IDocumentContainer doc, string title, string? subtitle, Action<IContainer> content)
        {
            doc.Page(page =>
            {
                page.Size(PageSizes.A4);
                page.Margin(36);
                page.DefaultTextStyle(x => x.FontSize(10).FontColor(Colors.Black));

                page.Header().Element(c => Header(c, title, subtitle));
                page.Content().PaddingTop(12).Element(content);
                page.Footer().AlignCenter().DefaultTextStyle(x => x.FontSize(8).FontColor(Colors.Grey.Medium))
                    .Text(t =>
                    {
                        t.Span("Ser-Viscar · Page ");
                        t.CurrentPageNumber();
                        t.Span(" of ");
                        t.TotalPages();
                    });
            });
        }

        public static void Header(IContainer container, string title, string? subtitle)
        {
            container.Column(col =>
            {
                col.Item().Row(row =>
                {
                    row.RelativeItem().Column(left =>
                    {
                        left.Item().Text("Ser-Viscar").FontSize(20).Bold().FontColor(Brand);
                        left.Item().Text("Vehicle Service Center").FontSize(9).FontColor(Colors.Grey.Medium);
                    });
                    row.ConstantItem(200).AlignRight().Column(right =>
                    {
                        right.Item().Text(title).FontSize(14).Bold().AlignRight();
                        if (!string.IsNullOrWhiteSpace(subtitle))
                            right.Item().Text(subtitle).FontSize(9).FontColor(Colors.Grey.Medium).AlignRight();
                        right.Item().Text($"Generated {DateTime.UtcNow:dd MMM yyyy HH:mm} UTC")
                            .FontSize(8).FontColor(Colors.Grey.Medium).AlignRight();
                    });
                });
                col.Item().PaddingTop(8).LineHorizontal(1).LineColor(Brand);
            });
        }

        public static IContainer HeaderCell(IContainer c) =>
            c.DefaultTextStyle(x => x.SemiBold().FontSize(9))
                .PaddingVertical(5).PaddingHorizontal(4)
                .Background(Colors.Grey.Lighten3);

        public static IContainer BodyCell(IContainer c) =>
            c.PaddingVertical(4).PaddingHorizontal(4).BorderBottom(0.5f).BorderColor(Colors.Grey.Lighten2);

        public static string Money(decimal amount) => $"Rs {amount:N2}";

        public static void KeyValueGrid(IContainer container, IEnumerable<(string Label, string Value)> rows)
        {
            container.Table(table =>
            {
                table.ColumnsDefinition(c =>
                {
                    c.ConstantColumn(130);
                    c.RelativeColumn();
                });
                foreach (var (label, value) in rows)
                {
                    table.Cell().Element(BodyCell).Text(label).SemiBold();
                    table.Cell().Element(BodyCell).Text(value);
                }
            });
        }
    }
}
