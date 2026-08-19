import RxTemplate from "../models/RxTemplateModel.js";
import { AppError } from "../utils/AppError.js";

const DEFAULT_DOCTOR_TEMPLATES = [
  {
    title: "Pediatric Viral Fever (3-6 yrs)",
    specialization: "Pediatrics",
    chief_complaints: ["Fever for 2 days (up to 101°F)", "Mild throat congestion", "Loss of appetite"],
    diagnosis: ["Acute Viral Upper Respiratory Infection"],
    medicines: [
      { name: "Calpol 250", generic_name: "Paracetamol (250mg/5ml)", dosage_form: "Syrup", dose: "5 ml", frequency: "1-1-1", timing: "After Food", duration_days: 3, instructions: "Give 5ml thrice daily if temp > 100°F." },
      { name: "Montair-LC Kid", generic_name: "Montelukast (4mg) + Levocetirizine (2.5mg)", dosage_form: "Syrup", dose: "5 ml", frequency: "0-0-1", timing: "At Bedtime", duration_days: 5, instructions: "Give 5ml once at night for cold & congestion." },
      { name: "Nasoclear", generic_name: "Saline Nasal Drops", dosage_form: "Drops", dose: "2 drops", frequency: "1-1-1", timing: "As Needed (SOS)", duration_days: 5, instructions: "2 drops in each nostril before meals/sleep." },
    ],
    investigations: ["Complete Blood Count (CBC) if fever persists > 3 days"],
    advice: "Tepid sponging with lukewarm water if temp > 101°F. Encourage plenty of fluids (coconut water, dal soup, ORS).",
  },
  {
    title: "Acute Gastroenteritis (AGE) / Loose Stools",
    specialization: "Pediatrics & General",
    chief_complaints: ["Watery loose motions 4-5 episodes", "Nausea & vomiting", "Abdominal cramps"],
    diagnosis: ["Acute Gastroenteritis with Mild Dehydration"],
    medicines: [
      { name: "Electral", generic_name: "Oral Rehydration Salts (WHO Formula)", dosage_form: "Powder", dose: "1 Sachet in 1L Water", frequency: "SOS", timing: "With Food", duration_days: 3, instructions: "Give 100-200ml sip by sip after each loose stool." },
      { name: "Emeset 4", generic_name: "Ondansetron (4mg)", dosage_form: "Tablet", dose: "1 Tab", frequency: "1-0-1", timing: "Before Food", duration_days: 2, instructions: "Take 30 mins before meals if nausea/vomiting." },
      { name: "Sporlac", generic_name: "Lactobacillus Probiotic", dosage_form: "Sachet", dose: "1 Sachet", frequency: "1-0-1", timing: "With Food", duration_days: 5, instructions: "Mix in plain water or curd." },
      { name: "O2", generic_name: "Ofloxacin + Ornidazole", dosage_form: "Tablet", dose: "1 Tab", frequency: "1-0-1", timing: "After Food", duration_days: 5, instructions: "Take after meals for 5 days." },
    ],
    investigations: ["Stool Routine & Microscopy", "Serum Electrolytes (if severe)"],
    advice: "Avoid dairy, oily/spicy food. Eat light diet: Khichdi, curd-rice, banana, boiled potatoes.",
  },
  {
    title: "Adult URI / Bronchitis & Pharyngitis",
    specialization: "General Medicine",
    chief_complaints: ["Dry hacking cough", "Throat irritation & pain on swallowing", "Low grade fever"],
    diagnosis: ["Acute Pharyngitis / Upper Respiratory Infection"],
    medicines: [
      { name: "Augmentin 625 Duo", generic_name: "Amoxicillin (500mg) + Clavulanic Acid (125mg)", dosage_form: "Tablet", dose: "1 Tab", frequency: "1-0-1", timing: "After Food", duration_days: 5, instructions: "Complete full 5 days antibiotic course." },
      { name: "Pan-D", generic_name: "Pantoprazole (40mg) + Domperidone (30mg)", dosage_form: "Capsule", dose: "1 Cap", frequency: "1-0-0", timing: "Empty Stomach", duration_days: 5, instructions: "Take 30 mins before breakfast." },
      { name: "Ascoril D Plus", generic_name: "Dextromethorphan + Phenylephrine", dosage_form: "Syrup", dose: "10 ml", frequency: "1-0-1", timing: "After Food", duration_days: 5, instructions: "Take after meals for dry cough." },
      { name: "Dolo 650", generic_name: "Paracetamol (650mg)", dosage_form: "Tablet", dose: "1 Tab", frequency: "1-0-1", timing: "After Food", duration_days: 3, instructions: "For fever and throat ache." },
    ],
    investigations: ["Complete Blood Count (CBC)"],
    advice: "Warm saline gargles 3-4 times daily. Steam inhalation twice daily. Avoid chilled beverages.",
  },
];

/**
 * Get doctor's custom templates (seeds defaults on first fetch)
 */
export const getDoctorTemplatesService = async ({ doctorId }) => {
  let templates = await RxTemplate.find({ doctor_id: doctorId });

  if (templates.length === 0) {
    const defaultTemplatesWithDoctor = DEFAULT_DOCTOR_TEMPLATES.map((t) => ({
      ...t,
      doctor_id: doctorId,
    }));
    await RxTemplate.insertMany(defaultTemplatesWithDoctor);
    templates = await RxTemplate.find({ doctor_id: doctorId });
  }

  return templates;
};

/**
 * Create new custom Rx template
 */
export const createTemplateService = async ({ doctorId, data }) => {
  const template = await RxTemplate.create({
    ...data,
    doctor_id: doctorId,
  });
  return template;
};

/**
 * Update existing Rx template
 */
export const updateTemplateService = async ({ templateId, doctorId, data }) => {
  const template = await RxTemplate.findOneAndUpdate(
    { _id: templateId, doctor_id: doctorId },
    data,
    { new: true, runValidators: true }
  );

  if (!template) {
    throw new AppError("Template not found or unauthorized", 404);
  }

  return template;
};

/**
 * Delete Rx template
 */
export const deleteTemplateService = async ({ templateId, doctorId }) => {
  const template = await RxTemplate.findOneAndDelete({ _id: templateId, doctor_id: doctorId });
  if (!template) {
    throw new AppError("Template not found or unauthorized", 404);
  }
  return true;
};
