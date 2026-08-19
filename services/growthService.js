import GrowthRecord from "../models/GrowthModel.js";
import Patient from "../models/PatientModel.js";
import { AppError } from "../utils/AppError.js";

// WHO Standard Child Growth Reference Curves (0-60 Months)
export const WHO_WEIGHT_FOR_AGE_BOYS = [
  { month: 0, p3: 2.5, p50: 3.3, p97: 4.4 },
  { month: 3, p3: 5.0, p50: 6.4, p97: 8.0 },
  { month: 6, p3: 6.4, p50: 7.9, p97: 9.8 },
  { month: 9, p3: 7.1, p50: 8.9, p97: 11.0 },
  { month: 12, p3: 7.7, p50: 9.6, p97: 12.0 },
  { month: 18, p3: 8.6, p50: 10.9, p97: 13.7 },
  { month: 24, p3: 9.7, p50: 12.2, p97: 15.3 },
  { month: 36, p3: 11.3, p50: 14.3, p97: 18.3 },
  { month: 48, p3: 12.7, p50: 16.3, p97: 21.2 },
  { month: 60, p3: 14.1, p50: 18.3, p97: 24.2 },
];

export const WHO_HEIGHT_FOR_AGE_BOYS = [
  { month: 0, p3: 46.1, p50: 49.9, p97: 53.7 },
  { month: 3, p3: 57.3, p50: 61.4, p97: 65.5 },
  { month: 6, p3: 63.3, p50: 67.6, p97: 71.9 },
  { month: 9, p3: 67.5, p50: 72.0, p97: 76.5 },
  { month: 12, p3: 71.0, p50: 75.7, p97: 80.5 },
  { month: 18, p3: 76.9, p50: 82.3, p97: 87.7 },
  { month: 24, p3: 81.7, p50: 87.8, p97: 93.9 },
  { month: 36, p3: 88.7, p50: 96.1, p97: 103.5 },
  { month: 48, p3: 94.9, p50: 103.3, p97: 111.7 },
  { month: 60, p3: 100.7, p50: 110.0, p97: 119.2 },
];

/**
 * Record a growth entry for child
 */
export const recordGrowthMetricService = async ({ patientId, clinicId, data }) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  // Calculate approximate percentile vs WHO 50th median
  let nutritionalStatus = "Normal";
  if (data.weight_kg && data.age_in_months !== undefined) {
    const ref = WHO_WEIGHT_FOR_AGE_BOYS.reduce((prev, curr) =>
      Math.abs(curr.month - data.age_in_months) < Math.abs(prev.month - data.age_in_months) ? curr : prev
    );

    if (data.weight_kg < ref.p3) {
      nutritionalStatus = "Moderate Underweight";
    } else if (data.weight_kg > ref.p97) {
      nutritionalStatus = "Overweight";
    }
  }

  const record = await GrowthRecord.create({
    ...data,
    patient_id: patientId,
    clinic_id: clinicId || patient.clinic_id,
    nutritional_status: nutritionalStatus,
  });

  return record;
};

/**
 * Get full growth timeline + WHO reference standards
 */
export const getPatientGrowthHistoryService = async ({ patientId }) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  const history = await GrowthRecord.find({ patient_id: patientId }).sort({ age_in_months: 1 });

  return {
    patient,
    history,
    who_reference: {
      weight_for_age: WHO_WEIGHT_FOR_AGE_BOYS,
      height_for_age: WHO_HEIGHT_FOR_AGE_BOYS,
    },
  };
};
