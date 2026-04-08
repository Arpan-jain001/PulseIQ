import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { AlertTriangle, Trash2 } from "lucide-react";

const TypedDeleteModal = ({
  title = "Delete Item",
  itemName,
  description,
  confirmLabel = "Delete Permanently",
  confirmationWord = "delete",
  deleting = false,
  onCancel,
  onConfirm,
}) => {
  const [value, setValue] = useState("");
  const normalizedWord = useMemo(() => confirmationWord.trim().toLowerCase(), [confirmationWord]);
  const isValid = value.trim().toLowerCase() === normalizedWord;

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onCancel} />
      <motion.div
        className="relative w-full max-w-md rounded-2xl overflow-hidden"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        style={{
          background: "linear-gradient(135deg,#0d1117,#161b22)",
          border: "1px solid #f43f8e22",
          boxShadow: "0 0 60px #00000099",
        }}
      >
        <div className="h-[2px] bg-gradient-to-r from-[#f43f8e] to-transparent" />
        <div className="p-6">
          <div className="w-12 h-12 rounded-2xl bg-[#f43f8e0a] border border-[#f43f8e30] flex items-center justify-center mx-auto mb-4">
            <Trash2 className="w-5 h-5 text-[#f43f8e]" />
          </div>
          <h3
            className="text-sm font-black text-[#e8f4ff] mb-2 uppercase text-center"
            style={{ fontFamily: "var(--font-display)" }}
          >
            {title}
          </h3>
          <p className="text-xs text-[#3d6080] mb-4 text-center" style={{ fontFamily: "var(--font-mono)" }}>
            {description}
          </p>

          <div className="rounded-xl border border-[#f59e0b20] bg-[#f59e0b08] p-3 mb-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-3.5 h-3.5 text-[#f59e0b] flex-shrink-0 mt-0.5" />
              <div className="min-w-0">
                <p className="text-[10px] text-[#f59e0b] uppercase tracking-widest mb-1" style={{ fontFamily: "var(--font-mono)" }}>
                  Permanent Delete
                </p>
                <p className="text-[11px] text-[#8ab4d4] leading-relaxed break-words" style={{ fontFamily: "var(--font-mono)" }}>
                  Name: <span className="text-[#e8f4ff]">"{itemName}"</span>
                </p>
              </div>
            </div>
          </div>

          <div className="mb-5">
            <label
              className="block text-[10px] text-[#3d6080] uppercase tracking-widest mb-2"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Type <span className="text-[#f43f8e]">{confirmationWord}</span> to confirm
            </label>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder={confirmationWord}
              className="w-full bg-[#04080f] border border-[#1a2a4a] rounded-xl px-4 py-3 text-[#e8f4ff] placeholder:text-[#1a3a6b] focus:outline-none focus:border-[#f43f8e44] text-sm"
              style={{ fontFamily: "var(--font-mono)" }}
            />
          </div>

          <div className="flex gap-3">
            <button
              onClick={onCancel}
              className="flex-1 py-2.5 rounded-xl border border-[#1a2a4a] text-[#8ab4d4] text-xs uppercase tracking-widest"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              Cancel
            </button>
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={() => onConfirm(confirmationWord)}
              disabled={!isValid || deleting}
              className="flex-1 py-2.5 rounded-xl bg-[#f43f8e] text-white font-bold text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed"
              style={{ fontFamily: "var(--font-mono)" }}
            >
              {deleting ? "Deleting..." : confirmLabel}
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default TypedDeleteModal;
