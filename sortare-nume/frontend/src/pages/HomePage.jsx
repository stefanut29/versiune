import { useState } from "react";
import NameItem from "../components/NameItem";
import FileImport from "../components/FileImport";
import { sortNames } from "../api/namesApi";
import { useFormValidation } from "../hooks/useFormValidation";

// Reguli de validare pentru câmpul „nume nou"
// Definite în afara componentei pentru a nu se recrea la fiecare render.
const VALIDATION_RULES = {
  name: {
    required:    true,
    requiredMsg: "Introduceți un nume.",
    minLength:   2,
    minLengthMsg:"Numele trebuie să aibă cel puțin 2 caractere.",
    maxLength:   100,
    maxLengthMsg:"Numele poate avea maxim 100 de caractere.",
  },
};

export default function HomePage() {
  // ── Stări principale ─────────────────────────────────────────
  // `names` — lista introdusă de utilizator (în ordinea introducerii)
  const [names, setNames] = useState([]);

  // `formData` — valoarea câmpului de input (controlată)
  const [formData, setFormData] = useState({ name: "" });

  // `result` — răspunsul de la backend după sortare
  //   { sorted, fileUrl, fileName, count }
  const [result, setResult] = useState(null);

  // `loading` — true cât timp backend-ul procesează cererea
  const [loading, setLoading] = useState(false);

  // `feedback` — banner cu mesaj (succes sau eroare)
  const [feedback, setFeedback] = useState({ message: "", type: "" });

  // Hook de validare
  const { errors, validate, clearErrors } = useFormValidation(VALIDATION_RULES);

  // ── Handler-e formular ───────────────────────────────────────
  function handleChange(e) {
    setFormData({ name: e.target.value });
  }

  // Adăugare nume în listă (Enter sau click pe buton)
  function handleAddName(e) {
    e.preventDefault();

    // Validare locală
    if (!validate(formData)) return;

    // Adăugăm numele și resetăm câmpul
    setNames(prev => [...prev, formData.name.trim()]);
    setFormData({ name: "" });
    clearErrors();

    // Dacă există un rezultat anterior, îl invalidăm
    // (lista s-a schimbat de la ultima sortare)
    if (result) setResult(null);
  }

  // Ștergere nume după index
  function handleDeleteName(index) {
    setNames(prev => prev.filter((_, i) => i !== index));
    if (result) setResult(null);
  }

  // Import nume dintr-un fișier .txt (apelat de FileImport prin callback).
  // Numele citite din fișier se ADAUGĂ la lista existentă — nu o suprascriu.
  // Astfel utilizatorul poate combina import fișier + adăugare manuală.
  function handleImportFromFile(importedNames) {
    setNames(prev => [...prev, ...importedNames]);
    if (result) setResult(null);
    showFeedback(
      `${importedNames.length} ${importedNames.length === 1 ? "nume importat" : "nume importate"} din fișier.`,
      "success"
    );
  }

  // Trimitere către backend pentru sortare
  async function handleSort() {
    if (names.length === 0) {
      showFeedback("Adăugați cel puțin un nume înainte de sortare.", "error");
      return;
    }

    setLoading(true);
    try {
      const data = await sortNames(names);
      setResult(data);
      showFeedback(
        `Lista a fost sortată cu succes (${data.count} nume).`,
        "success"
      );
    } catch (err) {
      showFeedback(err.message, "error");
      setResult(null);
    } finally {
      setLoading(false);
    }
  }

  // Resetare completă (pentru a începe o listă nouă)
  function handleReset() {
    setNames([]);
    setFormData({ name: "" });
    setResult(null);
    clearErrors();
    setFeedback({ message: "", type: "" });
  }

  function showFeedback(message, type) {
    setFeedback({ message, type });
    setTimeout(() => setFeedback({ message: "", type: "" }), 3000);
  }

  // Clase CSS pentru input — culoare de bordură schimbă la eroare
  const inputClass = `w-full px-4 py-2 border rounded-lg text-sm
                      focus:outline-none focus:ring-2 transition
                      ${errors.name
                        ? "border-red-400 focus:ring-red-300 bg-red-50"
                        : "border-gray-300 focus:ring-indigo-300 bg-white"}`;

  return (
    <div className="min-h-screen bg-indigo-50">
      {/* ── Header ── */}
      <header className="sticky top-0 z-10 bg-white shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-indigo-600">
              📋 Sortare Nume
            </h1>
            <p className="text-sm text-gray-500">
              {names.length === 0
                ? "Adaugă nume pentru a începe"
                : `${names.length} ${names.length === 1 ? "nume introdus" : "nume introduse"}`}
            </p>
          </div>

          {names.length > 0 && (
            <button
              onClick={handleReset}
              className="px-4 py-2 text-sm font-medium text-gray-600
                         border border-gray-300 rounded-lg
                         hover:bg-gray-100 transition-colors duration-200"
            >
              ↻ Resetează
            </button>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-8">
        {/* ── Banner feedback ── */}
        {feedback.message && (
          <div className={`px-4 py-3 rounded-lg text-sm font-medium
                           ${feedback.type === "success"
                             ? "bg-green-50 text-green-700 border border-green-200"
                             : "bg-red-50 text-red-700 border border-red-200"}`}>
            {feedback.type === "success" ? "✅ " : "⚠️ "} {feedback.message}
          </div>
        )}

        {/* ── Import din fișier .txt ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-indigo-600 mb-4">
            📁 Import dintr-un fișier
          </h2>
          <FileImport onImport={handleImportFromFile} />
        </section>

        {/* ── Formular adăugare nume ── */}
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-lg font-semibold text-indigo-600 mb-4">
            ➕ Sau introdu nume manual
          </h2>

          <form onSubmit={handleAddName} className="flex gap-3" noValidate>
            <div className="flex-1">
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="ex. Ling, Mai"
                className={inputClass}
                autoFocus
              />
              {errors.name && (
                <p className="mt-1 text-xs text-red-500 flex items-center gap-1">
                  <span>⚠</span> {errors.name}
                </p>
              )}
            </div>

            <button type="submit"
                    className="px-6 py-2 text-sm font-semibold text-white
                               bg-indigo-600 rounded-lg hover:bg-indigo-700
                               transition-colors duration-200">
              Adaugă
            </button>
          </form>

          <p className="text-xs text-gray-400 mt-2 italic">
            Apasă <kbd className="px-1.5 py-0.5 bg-gray-100 rounded">Enter</kbd> sau
            butonul „Adaugă" pentru a introduce numele în listă.
          </p>
        </section>

        {/* ── Lista nume introduse (în ordinea introducerii) ── */}
        {names.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-700">
                📝 Lista introdusă
                <span className="ml-2 text-sm font-normal text-gray-400">
                  (în ordinea adăugării)
                </span>
              </h2>

              <button
                onClick={handleSort}
                disabled={loading}
                className="px-5 py-2 text-sm font-semibold text-white
                           bg-green-600 rounded-lg hover:bg-green-700
                           disabled:opacity-50 disabled:cursor-not-allowed
                           transition-colors duration-200"
              >
                {loading ? "⏳ Se sortează..." : "🔠 Sortează și salvează"}
              </button>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {names.map((name, i) => (
                <NameItem
                  key={`${name}-${i}`}
                  name={name}
                  index={i}
                  onDelete={handleDeleteName}
                />
              ))}
            </div>
          </section>
        )}

        {/* ── Rezultatul sortării ── */}
        {result && (
          <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-green-700">
                ✅ Listă sortată
              </h2>

              {/* Link de descărcare a fișierului generat */}
              <a
                href={`${import.meta.env.VITE_API_URL}${result.fileUrl}`}
                download={result.fileName}
                className="px-4 py-2 text-sm font-medium text-white
                           bg-indigo-600 rounded-lg hover:bg-indigo-700
                           transition-colors duration-200"
              >
                📥 Descarcă fișier
              </a>
            </div>

            {/* Previzualizare fișier — formatul exact din enunț */}
            <pre className="bg-gray-50 border border-gray-200 rounded-lg p-4
                            text-sm font-mono text-gray-700 whitespace-pre-wrap
                            overflow-x-auto">
{`Lista contine ${result.count} nume
${"- ".repeat(Math.ceil(`Lista contine ${result.count} nume`.length / 2)).trim()}
${result.sorted.join("\n")}`}
            </pre>

            <p className="text-xs text-gray-400 mt-3 italic">
              📁 Fișier salvat pe server: <code className="text-indigo-500">{result.fileName}</code>
            </p>
          </section>
        )}

        {/* ── Stare goală ── */}
        {names.length === 0 && !result && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg mb-2">
              Lista este goală.
            </p>
            <p className="text-gray-400 text-sm">
              Încarcă un fișier .txt sau adaugă numele manual, unul câte unul.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
