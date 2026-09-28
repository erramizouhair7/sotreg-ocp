import {
  exportToCsv,
  exportToPdf,
} from "../utils/exportUtils";

export default function ExportButtons({
  rows,
  columns,
  title,
  filename,
}) {
  return (
    <div className="export-buttons">

      <button
        className="export-btn csv"
        onClick={() =>
          exportToCsv({
            rows,
            columns,
            filename,
          })
        }
      >
        Export Excel / CSV
      </button>

      <button
        className="export-btn pdf"
        onClick={() =>
          exportToPdf({
            rows,
            columns,
            title,
            filename,
          })
        }
      >
        Export PDF
      </button>

    </div>
  );
}