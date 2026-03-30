import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { bikesApi } from "../api/bikes";
import { s } from "../styles";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const YEARS = Array.from({ length: 8 }, (_, i) => 2024 - i);

interface Props {
  comp: any;
  onClose: () => void;
  onSave: () => void;
}

export default function UpdateModal({ comp, onClose, onSave }: Props) {
  const [step, setStep] = useState(1);
  const [sameComp, setSameComp] = useState<boolean | null>(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [newBrand, setNewBrand] = useState("");

  const mutation = useMutation({
    mutationFn: () => {
      const date = new Date(parseInt(year), parseInt(month), 1);
      return bikesApi.updateComponent(comp.id, {
        purchaseDate: date.toISOString().split("T")[0],
        ...(newBrand ? { brand: newBrand } : {}),
      });
    },
    onSuccess: onSave,
  });

  return (
    <div style={s.overlay} onClick={onClose}>
      <div style={s.modal} onClick={(e) => e.stopPropagation()}>
        <h3 style={{ color: "#363636", marginTop: 0, marginBottom: 20 }}>
          Update {comp.meta?.icon} {comp.meta?.name}
        </h3>

        {step === 1 && (
          <div>
            <p style={s.label}>Was this component replaced at a Trek store?</p>
            <div style={{ display: "flex", gap: 12 }}>
              <button style={s.optionBtn} onClick={() => setStep(2)}>Yes</button>
              <button style={s.optionBtn} onClick={() => setStep(2)}>No</button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={s.label}>Was it replaced with the same component?</p>
            <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
              <button style={{ ...s.optionBtn, ...(sameComp === true ? s.optionBtnActive : {}) }} onClick={() => setSameComp(true)}>Yes</button>
              <button style={{ ...s.optionBtn, ...(sameComp === false ? s.optionBtnActive : {}) }} onClick={() => setSameComp(false)}>No — different model</button>
            </div>

            {sameComp === false && (
              <div style={{ marginBottom: 16 }}>
                <label style={s.label}>Select new model</label>
                <select style={s.select} value={newBrand} onChange={(e) => setNewBrand(e.target.value)}>
                  <option value="">Select brand / model</option>
                  {comp.meta?.brands?.map((b: string) => <option key={b} value={b}>{b}</option>)}
                </select>
              </div>
            )}

            {sameComp !== null && (
              <div>
                <label style={{ ...s.label, marginTop: 8 }}>Replacement date</label>
                <div style={{ display: "flex", gap: 8 }}>
                  <select style={s.select} value={month} onChange={(e) => setMonth(e.target.value)}>
                    <option value="">Month</option>
                    {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                  </select>
                  <select style={s.select} value={year} onChange={(e) => setYear(e.target.value)}>
                    <option value="">Year</option>
                    {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            )}

            {month && year && (
              <button style={{ ...s.primaryBtn, marginTop: 20 }} onClick={() => mutation.mutate()} disabled={mutation.isPending}>
                {mutation.isPending ? "Saving…" : "Save Update ✅"}
              </button>
            )}
          </div>
        )}

        <button style={{ ...s.resetBtn, marginTop: 20, display: "block" }} onClick={onClose}>Cancel</button>
      </div>
    </div>
  );
}
