
// Published CSV links for each sheet
const SHEET_URLS = {
  Tab1:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSwF6VZvHcjiO_sUrY6AL1Q7xWGJlBcZE3wvE-c4FM3d6rm-Ksb7qiG5bhbioD9lA/pub?gid=152605945&single=true&output=csv",

  Tab2:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSwF6VZvHcjiO_sUrY6AL1Q7xWGJlBcZE3wvE-c4FM3d6rm-Ksb7qiG5bhbioD9lA/pub?gid=2141179500&single=true&output=csv",

  Tab3:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSwF6VZvHcjiO_sUrY6AL1Q7xWGJlBcZE3wvE-c4FM3d6rm-Ksb7qiG5bhbioD9lA/pub?gid=866385473&single=true&output=csv",

  Tab4:
    "https://docs.google.com/spreadsheets/d/e/2PACX-1vSwF6VZvHcjiO_sUrY6AL1Q7xWGJlBcZE3wvE-c4FM3d6rm-Ksb7qiG5bhbioD9lA/pub?gid=1526385489&single=true&output=csv",
};

const HEADER_ROWS_TO_SKIP = 1;

// Optional topics filter
export const TOPICS = ["Topic 1", "Topic 2", "Topic 3"];

// CSV parser
function parseCSV(csvText) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index++) {
    const character = csvText[index];
    const nextCharacter = csvText[index + 1];

    // Handle escaped quotes inside quoted values
    if (character === '"' && insideQuotes && nextCharacter === '"') {
      value += '"';
      index++;
      continue;
    }

    // Start or end quoted value
    if (character === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    // New column
    if (character === "," && !insideQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    // New row
    if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") {
        index++;
      }

      row.push(value);
      value = "";

      if (row.some((cell) => cell.trim() !== "")) {
        rows.push(row);
      }

      row = [];
      continue;
    }

    value += character;
  }

  // Add final row
  if (value !== "" || row.length > 0) {
    row.push(value);

    if (row.some((cell) => cell.trim() !== "")) {
      rows.push(row);
    }
  }

  return rows;
}

// Validate row
function isValidCardRow(row) {
  return (
    Array.isArray(row) &&
    row.length >= 2 &&
    String(row[0]).trim() !== "" &&
    String(row[1]).trim() !== ""
  );
}

// Load cards from a specific sheet
export async function loadSheetCards(sheetName) {
  const csvUrl = SHEET_URLS[sheetName];

  if (!csvUrl) {
    throw new Error(`No URL found for ${sheetName}`);
  }

  const response = await fetch(csvUrl);

  if (!response.ok) {
    throw new Error(`Unable to load sheet: ${sheetName}`);
  }

  const csvText = await response.text();

  const rows = parseCSV(csvText);

  return rows
    .slice(HEADER_ROWS_TO_SKIP)
    .filter(isValidCardRow)
    .map(([front, back]) => ({
      front: String(front).trim(),
      back: String(back).trim(),
    }));
}
