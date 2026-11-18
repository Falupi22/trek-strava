import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { bikesApi, type Bike } from "../api/bikes";
import { bikeLabel } from "../bikeOptions";
import { useI18n } from "../i18n";
import BikeForm, {
  draftFromBike,
  draftToFields,
  isDraftValid,
  useStravaGear,
} from "./BikeForm";

interface Props {
  bike: Bike;
  allBikes: Bike[];
  onClose: () => void;
  onSaved: () => void;
  onDeleted: () => void;
}

export default function EditBikeModal({ bike, allBikes, onClose, onSaved, onDeleted }: Props) {
  const { t } = useI18n();
  const e = t.editBike;
  const gear = useStravaGear();
  const [draft, setDraft] = useState(() => draftFromBike(bike));
  const [confirmDelete, setConfirmDelete] = useState(false);
  const name = bikeLabel(bike, t.common.yourBike);

  const takenGearIds = new Set(
    allBikes
      .filter((b) => b.id !== bike.id)
      .map((b) => b.stravaGearId)
      .filter((id): id is string => !!id),
  );

  const save = useMutation({
    mutationFn: () => {
      const fields = draftToFields(draft, gear.data?.bikes);
      // Keep the cached Strava name if the gear list couldn't be loaded.
      if (fields.stravaGearId === bike.stravaGearId && !fields.stravaGearName) {
        fields.stravaGearName = bike.stravaGearName;
      }
      return bikesApi.update(bike.id, fields);
    },
    onSuccess: onSaved,
  });

  const remove = useMutation({
    mutationFn: () => bikesApi.deleteBike(bike.id),
    onSuccess: onDeleted,
  });

  const failed = save.isError || remove.isError;

  return (
    <div className="overlay" onClick={onClose}>
      <div
        className="modal modal-wide"
        role="dialog"
        aria-modal="true"
        aria-labelledby="edit-bike-title"
        onClick={(ev) => ev.stopPropagation()}
      >
        <p className="eyebrow">{e.eyebrow}</p>
        <h3 id="edit-bike-title">{name}</h3>

        {confirmDelete ? (
          <div className="fade-in">
            <p>
              {e.confirmBefore}
              <strong>{name}</strong>
              {e.confirmAfter}
            </p>
            <div className="modal-actions">
              <button className="btn btn-ghost" onClick={() => setConfirmDelete(false)}>
                {e.keep}
              </button>
              <button
                className="btn btn-danger"
                onClick={() => remove.mutate()}
                disabled={remove.isPending}
              >
                {remove.isPending ? e.deleting : e.delete}
              </button>
            </div>
          </div>
        ) : (
          <>
            <BikeForm
              draft={draft}
              onChange={setDraft}
              takenGearIds={takenGearIds}
              idPrefix={`edit-${bike.id}`}
            />
            <p className="field-hint">{e.replacedHint}</p>

            {failed && (
              <div className="notice notice-error" style={{ marginTop: 12 }}>
                <span className="notice-icon">⚠️</span>
                {t.common.genericError}
              </div>
            )}

            <div className="modal-actions modal-actions-split">
              <button className="btn btn-link btn-danger-text" onClick={() => setConfirmDelete(true)}>
                {e.delete}
              </button>
              <div className="modal-actions-group">
                <button className="btn btn-ghost" onClick={onClose}>
                  {t.common.cancel}
                </button>
                <button
                  className="btn btn-primary"
                  onClick={() => save.mutate()}
                  disabled={!isDraftValid(draft, false) || save.isPending}
                >
                  {save.isPending ? t.common.saving : e.save}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
