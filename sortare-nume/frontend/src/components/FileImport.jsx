import { useRef, useState } from "react";

// Componentă pentru încărcarea unui fișier .txt cu nume.
// Folosește FileReader API (recomandarea din enunțul cerinței).
//
// Format așteptat — un nume pe linie:
//   Ling, Mai
//   Johnson, Jim
//   ...
// Liniile goale sunt ignorate automat.
//
// Props:
//   onImport — callback apelat cu array-ul de nume citite din fișier
export default function FileImport({ onImport }) {
  // `fileInputRef` — referință către input-ul ascuns
  // Folosim un input ascuns + buton stilizat pentru un design uniform
  const fileInputRef = useRef(null);

  // Numele fișierului încărcat (afișat ca feedback vizual)
  const [fileName, setFileName] = useState("");

  // Mesaj de eroare local (ex. fișier gol, format greșit)
  const [error, setError] = useState("");

  // Loading în timpul citirii (FileReader e asincron)
  const [loading, setLoading] = useState(false);

  // ── Handler la selectarea unui fișier ────────────────────────
  function handleFileChange(e) {
    const file = e.target.files[0];

    // Utilizatorul a anulat selecția
    if (!file) return;

    // Validăm extensia (acceptăm doar .txt momentan)
    if (!file.name.toLowerCase().endsWith(".txt")) {
      setError("Doar fișierele .txt sunt acceptate.");
      setFileName("");
      return;
    }

    // Validăm dimensiunea (max 1MB pentru siguranță)
    if (file.size > 1024 * 1024) {
      setError("Fișierul este prea mare (max 1MB).");
      setFileName("");
      return;
    }

    setError("");
    setLoading(true);
    setFileName(file.name);

    // ── FileReader API — citește fișierul în memoria browser-ului ──
    const reader = new FileReader();

    // Callback când citirea s-a terminat cu succes
    reader.onload = (event) => {
      try {
        const text = event.target.result;

        // Spargere pe linii (acceptăm atât \n cât și \r\n)
        // Eliminăm spațiile extra și liniile goale
        const lines = text
          .split(/\r?\n/)
          .map(line => line.trim())
          .filter(line => line.length > 0);

        if (lines.length === 0) {
          setError("Fișierul este gol sau nu conține nume valide.");
          setLoading(false);
          return;
        }

        // Trimitem numele înapoi la HomePage
        onImport(lines);
        setLoading(false);
      } catch (err) {
        setError("Eroare la procesarea fișierului.");
        setLoading(false);
      }
    };

    // Callback dacă citirea a eșuat
    reader.onerror = () => {
      setError("Nu s-a putut citi fișierul.");
      setLoading(false);
      setFileName("");
    };

    // Pornim citirea ca text (UTF-8)
    reader.readAsText(file, "UTF-8");
  }

  // Resetăm input-ul pentru a permite re-încărcarea aceluiași fișier
  function handleReset() {
    if (fileInputRef.current) fileInputRef.current.value = "";
    setFileName("");
    setError("");
  }

  return (
    <div>
      {/* Input ascuns — declanșat prin click pe buton */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt"
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="flex gap-2">
        {/* Buton care declanșează file picker-ul */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="flex-1 py-2 px-4 text-sm font-medium rounded-lg border
                     border-indigo-300 text-indigo-600 bg-indigo-50
                     hover:bg-indigo-100 disabled:opacity-50
                     disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "⏳ Se citește..." : "📁 Încarcă fișier .txt"}
        </button>

        {/* Buton de reset — apare doar dacă există un fișier încărcat */}
        {fileName && !loading && (
          <button
            type="button"
            onClick={handleReset}
            className="px-3 py-2 text-sm text-gray-500 border border-gray-200
                       rounded-lg hover:bg-gray-50 transition-colors"
            title="Permite reîncărcarea aceluiași fișier"
          >
            ↻
          </button>
        )}
      </div>

      {/* Feedback: nume fișier încărcat */}
      {fileName && !error && (
        <p className="mt-2 text-xs text-gray-500">
          📄 Fișier: <span className="font-medium text-gray-700">{fileName}</span>
        </p>
      )}

      {/* Mesaj de eroare */}
      {error && (
        <p className="mt-2 text-xs text-red-500 flex items-center gap-1">
          <span>⚠</span> {error}
        </p>
      )}

      {/* Instrucțiuni format */}
      <p className="text-xs text-gray-400 mt-2 italic">
        Format așteptat: un nume pe linie. Liniile goale sunt ignorate.
      </p>
    </div>
  );
}
