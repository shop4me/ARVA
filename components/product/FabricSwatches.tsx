"use client";

import { useState, useCallback } from "react";
import type { FabricOption } from "@/lib/productDetail";

const VISIBLE_COUNT = 4;

export default function FabricSwatches({
  options,
  defaultName,
}: {
  options: FabricOption[];
  defaultName: string;
}) {
  const [selected, setSelected] = useState(defaultName);
  const [modalOpen, setModalOpen] = useState(false);

  const selectedOption = options.find((o) => o.name === selected) ?? options[0];
  const visible = options.slice(0, VISIBLE_COUNT);
  const hasMore = options.length > VISIBLE_COUNT;

  const selectColor = useCallback((name: string) => {
    setSelected(name);
    setModalOpen(false);
  }, []);

  if (!options.length) return null;

  return (
    <div className="mb-6">
      <p className="text-xs font-medium text-arva-text-muted uppercase tracking-wide mb-2">
        Fabric
      </p>
      <div className="flex items-center gap-3 flex-wrap">
        {visible.map((opt) => (
          <button
            key={opt.name}
            type="button"
            onClick={() => setSelected(opt.name)}
            className={`w-10 h-10 rounded border-2 flex-shrink-0 transition ${
              selected === opt.name
                ? "border-arva-accent ring-2 ring-arva-accent/20"
                : "border-arva-border hover:border-arva-accent/40"
            }`}
            style={{ backgroundColor: opt.hex ?? "#f5f0e8" }}
            title={opt.name}
            aria-label={`Select ${opt.name}`}
            aria-pressed={selected === opt.name}
          />
        ))}
        {hasMore && (
          <>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="text-sm text-arva-accent font-medium hover:underline"
            >
              More colors
            </button>
          </>
        )}
      </div>
      <div className="mt-2 flex items-center gap-2">
        <span className="text-sm font-medium text-arva-text">{selectedOption.name}</span>
        <span className="text-xs text-arva-text-muted">OEKO-TEX® Certified</span>
      </div>

      {/* Modal: all colors */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40"
          onClick={() => setModalOpen(false)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="fabric-modal-title"
        >
          <div
            className="bg-arva-bg rounded-xl shadow-arva-soft max-w-md w-full p-6 border border-arva-border"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 id="fabric-modal-title" className="text-lg font-semibold text-arva-text mb-4">
              Choose fabric
            </h3>
            <div className="grid grid-cols-4 gap-3 mb-6">
              {options.map((opt) => (
                <button
                  key={opt.name}
                  type="button"
                  onClick={() => selectColor(opt.name)}
                  className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border-2 transition ${
                    selected === opt.name
                      ? "border-arva-accent bg-white"
                      : "border-transparent hover:bg-white"
                  }`}
                >
                  <span
                    className="w-10 h-10 rounded border border-arva-border flex-shrink-0"
                    style={{ backgroundColor: opt.hex ?? "#f5f0e8" }}
                  />
                  <span className="text-xs text-arva-text text-center leading-tight">
                    {opt.name}
                  </span>
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="w-full py-2.5 border border-arva-border text-arva-text font-medium rounded-lg hover:bg-white transition"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
