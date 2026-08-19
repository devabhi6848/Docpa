import PatientVaccine from "../models/PatientVaccineModel.js";
import Patient from "../models/PatientModel.js";
import { AppError } from "../utils/AppError.js";

export const IAP_STANDARD_SCHEDULE = [
  // Birth
  { name: "BCG", disease: "Tuberculosis", milestone: "Birth", days: 0, dose: "Single Dose" },
  { name: "OPV 0", disease: "Poliomyelitis", milestone: "Birth", days: 0, dose: "Dose 0" },
  { name: "Hep-B 1", disease: "Hepatitis B", milestone: "Birth", days: 0, dose: "Dose 1" },

  // 6 Weeks
  { name: "Hexavalent 1 (DTaP-IPV-HepB-Hib)", disease: "Diphtheria, Tetanus, Pertussis, Polio, Hep B, Hib", milestone: "6 Weeks", days: 42, dose: "Dose 1" },
  { name: "Rotavirus 1", disease: "Rotaviral Severe Diarrhea", milestone: "6 Weeks", days: 42, dose: "Dose 1" },
  { name: "PCV 1", disease: "Pneumococcal Pneumonia", milestone: "6 Weeks", days: 42, dose: "Dose 1" },

  // 10 Weeks
  { name: "Hexavalent 2 (DTaP-IPV-HepB-Hib)", disease: "Diphtheria, Tetanus, Pertussis, Polio, Hep B, Hib", milestone: "10 Weeks", days: 70, dose: "Dose 2" },
  { name: "Rotavirus 2", disease: "Rotaviral Severe Diarrhea", milestone: "10 Weeks", days: 70, dose: "Dose 2" },
  { name: "PCV 2", disease: "Pneumococcal Pneumonia", milestone: "10 Weeks", days: 70, dose: "Dose 2" },

  // 14 Weeks
  { name: "Hexavalent 3 (DTaP-IPV-HepB-Hib)", disease: "Diphtheria, Tetanus, Pertussis, Polio, Hep B, Hib", milestone: "14 Weeks", days: 98, dose: "Dose 3" },
  { name: "Rotavirus 3", disease: "Rotaviral Severe Diarrhea", milestone: "14 Weeks", days: 98, dose: "Dose 3" },
  { name: "PCV 3", disease: "Pneumococcal Pneumonia", milestone: "14 Weeks", days: 98, dose: "Dose 3" },

  // 6 Months
  { name: "Influenza 1 (Flu)", disease: "Seasonal Flu / Viral Pneumonia", milestone: "6 Months", days: 180, dose: "Dose 1" },

  // 7 Months
  { name: "Influenza 2 (Flu)", disease: "Seasonal Flu / Viral Pneumonia", milestone: "7 Months", days: 210, dose: "Dose 2" },

  // 9 Months
  { name: "MMR 1", disease: "Measles, Mumps, Rubella", milestone: "9 Months", days: 270, dose: "Dose 1" },
  { name: "TCV (Typhoid)", disease: "Typhoid Enteric Fever", milestone: "9 Months", days: 270, dose: "Dose 1" },

  // 12 Months
  { name: "Hepatitis A 1", disease: "Hepatitis A Liver Infection", milestone: "12 Months", days: 365, dose: "Dose 1" },

  // 15 Months
  { name: "MMR 2", disease: "Measles, Mumps, Rubella", milestone: "15 Months", days: 455, dose: "Dose 2" },
  { name: "Varicella 1 (Chickenpox)", disease: "Chickenpox", milestone: "15 Months", days: 455, dose: "Dose 1" },
  { name: "PCV Booster", disease: "Pneumococcal Booster", milestone: "15 Months", days: 455, dose: "Booster" },

  // 18 Months
  { name: "DTaP Booster 1", disease: "Diphtheria, Tetanus, Pertussis", milestone: "18 Months", days: 545, dose: "Booster 1" },
  { name: "IPV Booster 1", disease: "Polio Booster", milestone: "18 Months", days: 545, dose: "Booster 1" },
  { name: "Hib Booster", disease: "Haemophilus influenzae B", milestone: "18 Months", days: 545, dose: "Booster 1" },
  { name: "Hepatitis A 2", disease: "Hepatitis A", milestone: "18 Months", days: 545, dose: "Dose 2" },

  // 4-6 Years
  { name: "DTaP Booster 2", disease: "Diphtheria, Tetanus, Pertussis", milestone: "4-6 Years", days: 1825, dose: "Booster 2" },
  { name: "MMR 3 / Varicella 2", disease: "Measles, Mumps, Rubella & Chickenpox", milestone: "4-6 Years", days: 1825, dose: "Booster" },

  // 10-12 Years
  { name: "Tdap / Td", disease: "Tetanus, Diphtheria, Pertussis", milestone: "10-12 Years", days: 3650, dose: "Adolescent Booster" },
  { name: "HPV (2 Doses)", disease: "Human Papillomavirus / Cervical Cancer", milestone: "10-12 Years", days: 3650, dose: "Dose 1 & 2" },
];

/**
 * Get or automatically generate the complete IAP vaccine schedule for patient
 */
export const getPatientVaccineScheduleService = async ({ patientId }) => {
  const patient = await Patient.findById(patientId);
  if (!patient) {
    throw new AppError("Patient not found", 404);
  }

  let schedule = await PatientVaccine.find({ patient_id: patientId }).sort({ due_date: 1 });

  // If no vaccine schedule exists, auto-generate from patient's DOB
  if (schedule.length === 0) {
    let birthDate = patient.dob;
    if (!birthDate) {
      // Estimate from age
      const now = new Date();
      birthDate = new Date(
        now.getFullYear() - (patient.age_years || 0),
        now.getMonth() - (patient.age_months || 0),
        now.getDate() - (patient.age_days || 0)
      );
    }

    const today = new Date();

    const newVaccines = IAP_STANDARD_SCHEDULE.map((v) => {
      const dueDate = new Date(birthDate);
      dueDate.setDate(dueDate.getDate() + v.days);

      let status = "upcoming";
      if (dueDate < today) {
        status = "due";
      }

      return {
        patient_id: patient._id,
        clinic_id: patient.clinic_id,
        vaccine_name: v.name,
        disease_covered: v.disease,
        age_milestone: v.milestone,
        dose_number: v.dose,
        due_date: dueDate,
        status,
      };
    });

    await PatientVaccine.insertMany(newVaccines);
    schedule = await PatientVaccine.find({ patient_id: patientId }).sort({ due_date: 1 });
  }

  // Count summaries
  const givenCount = schedule.filter((v) => v.status === "given").length;
  const dueCount = schedule.filter((v) => v.status === "due").length;
  const upcomingCount = schedule.filter((v) => v.status === "upcoming").length;

  return {
    patient,
    summary: {
      total: schedule.length,
      given: givenCount,
      due: dueCount,
      upcoming: upcomingCount,
      completion_percentage: Math.round((givenCount / schedule.length) * 100),
    },
    schedule,
  };
};

/**
 * Mark a vaccine as administered
 */
export const markVaccineGivenService = async ({
  vaccineRecordId,
  doctorId,
  givenDate,
  brandName,
  batchNumber,
  notes,
}) => {
  const record = await PatientVaccine.findById(vaccineRecordId);
  if (!record) {
    throw new AppError("Vaccine record not found", 404);
  }

  record.status = "given";
  record.given_date = givenDate ? new Date(givenDate) : new Date();
  record.brand_name = brandName || record.brand_name;
  record.batch_number = batchNumber || record.batch_number;
  record.notes = notes || record.notes;
  record.doctor_id = doctorId || record.doctor_id;

  await record.save();
  return record;
};
