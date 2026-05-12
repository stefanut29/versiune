// NameItem primește două props:
//   name    — string-ul cu numele afișat
//   onDelete — callback apelat la click pe butonul de ștergere
//             (undefined în lista sortată → butonul nu se afișează)
//   index   — poziția în listă (afișată ca număr)
export default function NameItem({ name, onDelete, index }) {
  return (
    <div className="flex items-center justify-between bg-white rounded-lg
                    shadow-sm hover:shadow-md transition-shadow duration-200
                    px-4 py-2.5 border border-gray-100">
      <div className="flex items-center gap-3">
        {/* Numărul ordinii */}
        <span className="text-xs font-semibold text-indigo-500 bg-indigo-50
                         w-6 h-6 rounded-full flex items-center justify-center
                         flex-shrink-0">
          {index + 1}
        </span>
        {/* Numele */}
        <span className="text-sm text-gray-700">{name}</span>
      </div>

      {/* Butonul de ștergere — apare doar dacă există callback */}
      {onDelete && (
        <button
          onClick={() => onDelete(index)}
          className="text-xs px-2 py-1 rounded-lg text-red-500
                     hover:bg-red-50 transition-colors duration-200"
          title="Șterge acest nume"
        >
          ✕
        </button>
      )}
    </div>
  );
}
