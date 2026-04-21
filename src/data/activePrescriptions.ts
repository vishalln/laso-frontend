// ─────────────────────────────────────────────────────────────────────────────
// activePrescriptions.ts
//
// Single source of truth for the patient's active prescriptions.
// Maps CatalogItem.id → prescriptionId issued by the doctor.
//
// Shape mirrors a real backend response:
//   GET /patient/:id/active-prescriptions
//   → [{ itemId, prescriptionId, prescribedBy, prescribedOn, expiresOn }]
// ─────────────────────────────────────────────────────────────────────────────

export interface ActivePrescription {
  readonly itemId: string;
  readonly prescriptionId: string;
  readonly prescribedBy: string;
  readonly prescribedOn: string;        // ISO date
  readonly expiresOn: string;           // ISO date
}

/** All currently active prescriptions for the mock patient. */
export const ACTIVE_PRESCRIPTIONS: readonly ActivePrescription[] = [
  {
    itemId: "rx-001",
    prescriptionId: "RX-2026-001",
    prescribedBy: "Dr. Meera Nair",
    prescribedOn: "2026-04-14",
    expiresOn: "2026-07-14",
  },
  {
    itemId: "rx-003",
    prescriptionId: "RX-2026-002",
    prescribedBy: "Dr. Meera Nair",
    prescribedOn: "2026-04-14",
    expiresOn: "2026-07-14",
  },
  {
    itemId: "rx-004",
    prescriptionId: "RX-2026-003",
    prescribedBy: "Dr. Meera Nair",
    prescribedOn: "2026-04-14",
    expiresOn: "2026-07-14",
  },
];

/** Lookup: itemId → ActivePrescription (O(1)) */
export const PRESCRIPTION_BY_ITEM_ID: Readonly<Record<string, ActivePrescription>> =
  Object.fromEntries(ACTIVE_PRESCRIPTIONS.map((p) => [p.itemId, p]));
