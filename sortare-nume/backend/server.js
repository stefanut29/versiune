// ─────────────────────────────────────────────────────────────
// Backend Express pentru aplicația „Sortare Nume"
// Primește o listă de nume, le sortează, le scrie într-un fișier
// și returnează URL-ul de descărcare.
// ─────────────────────────────────────────────────────────────

require("dotenv").config();

const express = require("express");
const cors = require("cors");
const Joi = require("joi");
const fs = require("fs");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());

// ─────────────────────────────────────────────────────────────
// Rută statică pentru fișierele de ieșire generate
// ─────────────────────────────────────────────────────────────
const OUTPUT_DIR = path.join(__dirname, "output");

// Creăm directorul /output dacă nu există deja
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

app.use("/output", express.static(OUTPUT_DIR));

// ─────────────────────────────────────────────────────────────
// Schema Joi pentru validarea cererii
// names = array de string-uri, fiecare cu minim 2 caractere
// Constrângere din enunț: NU codăm numărul de nume — acceptăm orice n >= 1
// ─────────────────────────────────────────────────────────────
const namesSchema = Joi.object({
  names: Joi.array()
    .items(Joi.string().trim().min(2).required())
    .min(1)
    .required(),
});

// ─────────────────────────────────────────────────────────────
// Ruta de test
// ─────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({
    message: "Sortare Nume API functioneaza...",
    endpoints: {
      sort: "POST /api/names/sort",
      output: "GET /output/<filename>",
    },
  });
});

// ─────────────────────────────────────────────────────────────
// POST /api/names/sort
// Primește { names: [...] }, sortează alfabetic și scrie în fișier.
// Returnează { sorted, fileUrl, fileName, count }.
// ─────────────────────────────────────────────────────────────
app.post("/api/names/sort", (req, res) => {
  // Validăm cu Joi
  const { error } = namesSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: error.details[0].message,
      errors: error.details.map(d => d.message),
    });
  }

  try {
    const { names } = req.body;

    // Sortare alfabetică folosind Array.prototype.sort()
    // localeCompare gestionează corect diacriticele și caracterele speciale.
    const sorted = [...names].sort((a, b) => a.localeCompare(b, "ro"));

    // ── Construim conținutul fișierului ──
    // Formatul respectă exemplul din enunț:
    //   Lista contine 7 nume
    //   - - - - - - - - - - -
    //   Ling, Mai
    //   Johnson, Jim
    //   ...
    const header = `Lista contine ${sorted.length} nume`;
    // Linia de separare — repetăm "- " de același număr de ori ca lungimea header-ului
    const separator = "- ".repeat(Math.ceil(header.length / 2)).trim();

    const content = [header, separator, ...sorted].join("\n");

    // Scriem fișierul cu un nume unic bazat pe timestamp
    // pentru a evita conflicte între cereri simultane
    const timestamp = Date.now();
    const fileName = `nume_sortate_${timestamp}.txt`;
    const filePath = path.join(OUTPUT_DIR, fileName);

    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`Fișier generat: ${fileName} (${sorted.length} nume)`);

    res.status(200).json({
      sorted,
      fileUrl: `/output/${fileName}`,
      fileName,
      count: sorted.length,
    });
  } catch (err) {
    console.error("Eroare la sortare:", err.message);
    res.status(500).json({ error: "Nu s-a putut genera fișierul." });
  }
});

// ─────────────────────────────────────────────────────────────
// Pornim serverul
// ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Serverul ruleaza la http://localhost:${PORT}`);
  console.log(`Fișiere generate în: ${OUTPUT_DIR}`);
});
