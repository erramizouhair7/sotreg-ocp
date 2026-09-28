import { jsPDF }
  from "jspdf";

import autoTable
  from "jspdf-autotable";

function protectCsvValue(value) {
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  let text = String(value);

  // Protection contre la CSV formula injection
  if (/^[=+\-@]/.test(text)) {
    text = `'${text}`;
  }

  text = text.replace(
    /"/g,
    '""'
  );

  return `"${text}"`;
}

export function exportToCsv({
  rows,
  columns,
  filename,
}) {
  const separator = ";";

  const header =
    columns
      .map((column) =>
        protectCsvValue(
          column.label
        )
      )
      .join(separator);

  const content =
    rows
      .map((row) =>
        columns
          .map((column) =>
            protectCsvValue(
              row[column.key]
            )
          )
          .join(separator)
      )
      .join("\n");

  const csv =
    `\uFEFF${header}\n${content}`;

  const blob =
    new Blob(
      [csv],
      {
        type:
          "text/csv;charset=utf-8;",
      }
    );

  const url =
    URL.createObjectURL(blob);

  const link =
    document.createElement("a");

  link.href = url;

  link.download =
    `${filename}.csv`;

  document.body.appendChild(link);

  link.click();

  link.remove();

  URL.revokeObjectURL(url);
}

export function exportToPdf({
  title,
  rows,
  columns,
  filename,
}) {
  const doc =
    new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

  doc.setFontSize(16);

  doc.text(
    title,
    14,
    16
  );

  doc.setFontSize(9);

  doc.text(
    `Généré le ${new Date().toLocaleString(
      "fr-FR"
    )}`,
    14,
    23
  );

  autoTable(doc, {
    startY: 30,

    head: [
      columns.map(
        (column) =>
          column.label
      ),
    ],

    body:
      rows.map((row) =>
        columns.map(
          (column) =>
            row[column.key] ?? ""
        )
      ),

    styles: {
      fontSize: 8,
      cellPadding: 2.5,
    },

    headStyles: {
      fillColor: [
        79,
        168,
        216,
      ],
    },
  });

  doc.save(
    `${filename}.pdf`
  );
}