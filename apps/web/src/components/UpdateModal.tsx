import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { bikesApi } from "../api/bikes";
import { keepMonthIfValid, monthIndexesFor, yearsFrom, type YearMonth } from "../bikeOptions";
import { useI18n } from "../i18n";

interface Props {
  comp: any;
  /** The bike's purchase month: a replacement can't be dated before it. */
  purchase?: YearMonth;
  onClose: () => void;
  onSave: () => void;
}

export default function UpdateModal({ comp, purchase, onClose, onSave }: Props) {
  const { t } = useI18n();
  const u = t.updateComp;
  const [step, setStep] = useState(1);
  const [sameComp, setSameComp] = useState<boolean | null>(null);
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [newBrand, setNewBrand] = useState("");

  const mutation = useMutation({
    mutationFn: () => {
      // YYYY-MM-01 built directly: toISOString() on a local date can land
      // on the previous day east of UTC.
      const purchaseDate = `${year}-${String(parseInt(month) + 1).padStart(2, "0")}-01`;
      return bikesApi.updateComponent(comp.id, {
        purchaseDate,
        ...(newBrand ? { brand: newBrand } : {}),
      });
    },
    onSuccess: onSave,
  });

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-title"
        onClick={(e) => e.stopPropagation()}
      >
        <p className="eyebrow">{u.eyebrow}</p>
        <h3 id="update-title">
          {comp.meta?.icon} {t.components[comp.type]}
        </h3>

        {step === 1 && (
          <div className="field fade-in">
            <span className="field-label">
              {u.trekStoreQ}
            </span>
            <div className="choices">
              <button className="choice" onClick={() => setStep(2)}>
                {t.common.yes}
              </button>
              <button className="choice" onClick={() => setStep(2)}>
                {t.common.no}
              </button>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="fade-in">
            <div className="field">
              <span className="field-label">
                {u.sameQ}
              </span>
              <div className="choices">
                <button
                  className="choice"
                  aria-pressed={sameComp === true}
                  onClick={() => setSameComp(true)}
                >
                  {t.common.yes}
                </button>
                <button
                  className="choice"
                  aria-pressed={sameComp === false}
                  onClick={() => setSameComp(false)}
                >
                  {u.different}
                </button>
              </div>
            </div>

            {sameComp === false && (
              <div className="field fade-in">
                <label className="field-label" htmlFor="new-brand">
                  {u.newModel}
                </label>
                <select
                  id="new-brand"
                  className="select"
                  value={newBrand}
                  onChange={(e) => setNewBrand(e.target.value)}
                >
                  <option value="">{u.selectBrand}</option>
                  {comp.meta?.brands?.map((b: string) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {sameComp !== null && (
              <div className="field fade-in">
                <span className="field-label">{u.replacementDate}</span>
                <div className="row">
                  <select
                    className="select"
                    aria-label={t.common.month}
                    value={month}
                    onChange={(e) => setMonth(e.target.value)}
                  >
                    <option value="">{t.common.month}</option>
                    {monthIndexesFor(year, purchase).map((i) => (
                      <option key={i} value={i}>
                        {t.months[i]}
                      </option>
                    ))}
                  </select>
                  <select
                    className="select"
                    aria-label={t.common.year}
                    value={year}
                    onChange={(e) => {
                      setYear(e.target.value);
                      setMonth((m) => keepMonthIfValid(e.target.value, m, purchase));
                    }}
                  >
                    <option value="">{t.common.year}</option>
                    {yearsFrom(purchase).map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="modal-actions">
          <button className="btn btn-ghost" onClick={onClose}>
            {t.common.cancel}
          </button>
          {step === 2 && (
            <button
              className="btn btn-primary"
              onClick={() => mutation.mutate()}
              disabled={!month || !year || mutation.isPending}
            >
              {mutation.isPending ? t.common.saving : u.save}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
