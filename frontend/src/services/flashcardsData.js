const SHEETS = [
  {
    name: "Salesforce Ecosystem",
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRD_6Fk1L-mHVpV_4Y9j671Xdh9ABEpY77T6mfA_T6UPMO-Pd4nxAetXLckjjesf0ARd_1OQ6NDfJc/pub?gid=0&single=true&output=csv",
  },
  {
    name: "Navigation",
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRD_6Fk1L-mHVpV_4Y9j671Xdh9ABEpY77T6mfA_T6UPMO-Pd4nxAetXLckjjesf0ARd_1OQ6NDfJc/pub?gid=441005967&single=true&output=csv",
  },
  {
    name: "Data Model",
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRD_6Fk1L-mHVpV_4Y9j671Xdh9ABEpY77T6mfA_T6UPMO-Pd4nxAetXLckjjesf0ARd_1OQ6NDfJc/pub?gid=1223086829&single=true&output=csv",
  },
  {
    name: "Reports and Dashboards",
    url: "https://docs.google.com/spreadsheets/d/e/2PACX-1vQRD_6Fk1L-mHVpV_4Y9j671Xdh9ABEpY77T6mfA_T6UPMO-Pd4nxAetXLckjjesf0ARd_1OQ6NDfJc/pub?gid=680117250&single=true&output=csv",
  },
];

export const TOPICS = SHEETS.map((sheet) => sheet.name);

function parseCSV(csvText) {
  const rows = [];
  let row = [];
  let value = "";
  let insideQuotes = false;

  for (let index = 0; index < csvText.length; index++) {
    const character = csvText[index];
    const nextCharacter = csvText[index + 1];

    if (character === '"' && insideQuotes && nextCharacter === '"') {
      value += '"';
      index++;
      continue;
    }

    if (character === '"') {
      insideQuotes = !insideQuotes;
      continue;
    }

    if (character === "," && !insideQuotes) {
      row.push(value);
      value = "";
      continue;
    }

    if ((character === "\n" || character === "\r") && !insideQuotes) {
      if (character === "\r" && nextCharacter === "\n") index++;
      row.push(value);
      value = "";
      if (row.some((cell) => String(cell).trim() !== "")) rows.push(row);
      row = [];
      continue;
    }

    value += character;
  }

  if (value !== "" || row.length > 0) {
    row.push(value);
    if (row.some((cell) => String(cell).trim() !== "")) rows.push(row);
  }

  return rows;
}

function getSheetByTopic(topic) {
  return SHEETS.find((sheet) => sheet.name === topic);
}

function isValidCardRow(row) {
  return (
    Array.isArray(row) &&
    row.length >= 2 &&
    String(row[0]).trim() !== "" &&
    String(row[1]).trim() !== ""
  );
}

export async function loadTopicCards(topic) {
  const sheet = getSheetByTopic(topic);

  if (!sheet) {
    throw new Error(`Topic "${topic}" was not found.`);
  }

  const response = await fetch(sheet.url);

  if (!response.ok) {
    throw new Error(`Unable to load ${topic}.`);
  }

  const csvText = await response.text();
  const rows = parseCSV(csvText);

  return rows
    .slice(2)
    .filter(isValidCardRow)
    .map(([front, back]) => ({
      front: String(front).trim(),
      back: String(back).trim(),
    }));
}