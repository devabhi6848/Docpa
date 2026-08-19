import Medicine from "../models/MedicineModel.js";

const DEFAULT_INDIAN_DRUGS = [
  // Antipyretics & Pain
  { name: "Calpol 650", generic_name: "Paracetamol (650mg)", dosage_form: "Tablet", strength: "650mg", default_frequency: "1-0-1", default_timing: "After Food", default_duration_days: 3, instructions: "Take with water after meals. SOS for fever > 100°F." },
  { name: "Calpol 250", generic_name: "Paracetamol (250mg/5ml)", dosage_form: "Syrup", strength: "250mg/5ml", default_frequency: "1-1-1", default_timing: "After Food", default_duration_days: 3, instructions: "5ml thrice daily if fever > 100°F." },
  { name: "Crocin Advance", generic_name: "Paracetamol (500mg)", dosage_form: "Tablet", strength: "500mg", default_frequency: "1-0-1", default_timing: "After Food", default_duration_days: 3, instructions: "For fever and mild to moderate pain." },
  { name: "Meftal-P", generic_name: "Mefenamic Acid (100mg/5ml)", dosage_form: "Suspension", strength: "100mg/5ml", default_frequency: "SOS", default_timing: "After Food", default_duration_days: 3, instructions: "Give only if high fever (> 101°F)." },
  { name: "Combiflam", generic_name: "Ibuprofen (400mg) + Paracetamol (325mg)", dosage_form: "Tablet", strength: "400mg/325mg", default_frequency: "1-0-1", default_timing: "After Food", default_duration_days: 3, instructions: "Take after food with antacid." },
  { name: "Dolo 650", generic_name: "Paracetamol (650mg)", dosage_form: "Tablet", strength: "650mg", default_frequency: "1-0-1", default_timing: "After Food", default_duration_days: 3, instructions: "Take after food for body pain & fever." },
  { name: "Zerodol-SP", generic_name: "Aceclofenac (100mg) + Paracetamol (325mg) + Serratiopeptidase (15mg)", dosage_form: "Tablet", strength: "100/325/15mg", default_frequency: "1-0-1", default_timing: "After Food", default_duration_days: 5, instructions: "For severe pain, joint inflammation & swelling." },

  // Antibiotics
  { name: "Augmentin 625 Duo", generic_name: "Amoxicillin (500mg) + Clavulanic Acid (125mg)", dosage_form: "Tablet", strength: "625mg", default_frequency: "1-0-1", default_timing: "After Food", default_duration_days: 5, instructions: "Complete full 5 days course. Do not skip doses." },
  { name: "Augmentin DDS", generic_name: "Amoxicillin (400mg) + Clavulanic Acid (57mg/5ml)", dosage_form: "Syrup", strength: "457mg/5ml", default_frequency: "1-0-1", default_timing: "After Food", default_duration_days: 5, instructions: "Reconstitute with boiled and cooled water. Shake well." },
  { name: "Azithral 500", generic_name: "Azithromycin (500mg)", dosage_form: "Tablet", strength: "500mg", default_frequency: "1-0-0", default_timing: "Before Food", default_duration_days: 3, instructions: "Take once daily 1 hour before breakfast." },
  { name: "Azithral 200", generic_name: "Azithromycin (200mg/5ml)", dosage_form: "Suspension", strength: "200mg/5ml", default_frequency: "1-0-0", default_timing: "Before Food", default_duration_days: 3, instructions: "5ml once daily before morning meal for 3 days." },
  { name: "Taxim-O 200", generic_name: "Cefixime (200mg)", dosage_form: "Tablet", strength: "200mg", default_frequency: "1-0-1", default_timing: "After Food", default_duration_days: 5, instructions: "For bacterial infections, typhoid & UTI." },
  { name: "Taxim-O 50 Dry Syrup", generic_name: "Cefixime (50mg/5ml)", dosage_form: "Syrup", strength: "50mg/5ml", default_frequency: "1-0-1", default_timing: "After Food", default_duration_days: 5, instructions: "Shake well before giving to child." },
  { name: "Cifran 500", generic_name: "Ciprofloxacin (500mg)", dosage_form: "Tablet", strength: "500mg", default_frequency: "1-0-1", default_timing: "After Food", default_duration_days: 5, instructions: "Drink plenty of water during treatment." },
  { name: "O2", generic_name: "Ofloxacin (200mg) + Ornidazole (500mg)", dosage_form: "Tablet", strength: "200/500mg", default_frequency: "1-0-1", default_timing: "After Food", default_duration_days: 5, instructions: "For acute diarrhea, amoebiasis and mixed GI infection." },

  // Antacids & GI
  { name: "Pan 40", generic_name: "Pantoprazole (40mg)", dosage_form: "Tablet", strength: "40mg", default_frequency: "1-0-0", default_timing: "Empty Stomach", default_duration_days: 7, instructions: "Take 30 mins before breakfast." },
  { name: "Pan-D", generic_name: "Pantoprazole (40mg) + Domperidone (30mg)", dosage_form: "Capsule", strength: "40/30mg", default_frequency: "1-0-0", default_timing: "Empty Stomach", default_duration_days: 7, instructions: "Take in the morning on empty stomach." },
  { name: "Rantac 150", generic_name: "Ranitidine (150mg)", dosage_form: "Tablet", strength: "150mg", default_frequency: "1-0-1", default_timing: "Before Food", default_duration_days: 7, instructions: "For hyperacidity and heartburn." },
  { name: "Emeset 4", generic_name: "Ondansetron (4mg)", dosage_form: "Tablet", strength: "4mg", default_frequency: "1-0-1", default_timing: "Before Food", default_duration_days: 3, instructions: "Take 30 mins before meals to prevent vomiting." },
  { name: "Emeset Syrup", generic_name: "Ondansetron (2mg/5ml)", dosage_form: "Syrup", strength: "2mg/5ml", default_frequency: "SOS", default_timing: "Before Food", default_duration_days: 3, instructions: "For vomiting. Give 20 minutes before oral liquids." },
  { name: "Sporlac", generic_name: "Lactobacillus Spores", dosage_form: "Sachet", strength: "150M spores", default_frequency: "1-0-1", default_timing: "With Food", default_duration_days: 5, instructions: "Mix with normal temperature water/curd." },
  { name: "Electral", generic_name: "Oral Rehydration Salts (WHO Formula)", dosage_form: "Powder", strength: "21.8g Sachet", default_frequency: "SOS", default_timing: "With Food", default_duration_days: 3, instructions: "Dissolve entire packet in 1 liter clean drinking water." },

  // Antihistamines & Cough/Cold
  { name: "Allegra 120", generic_name: "Fexofenadine (120mg)", dosage_form: "Tablet", strength: "120mg", default_frequency: "0-0-1", default_timing: "At Bedtime", default_duration_days: 5, instructions: "Non-drowsy anti-allergic for runny nose & sneezing." },
  { name: "Montair-LC", generic_name: "Montelukast (10mg) + Levocetirizine (5mg)", dosage_form: "Tablet", strength: "10/5mg", default_frequency: "0-0-1", default_timing: "At Bedtime", default_duration_days: 7, instructions: "Take once daily at night for allergic rhinitis." },
  { name: "Montair-LC Kid", generic_name: "Montelukast (4mg) + Levocetirizine (2.5mg)", dosage_form: "Syrup", strength: "4/2.5mg per 5ml", default_frequency: "0-0-1", default_timing: "At Bedtime", default_duration_days: 5, instructions: "Give 5ml at bedtime for night cough & allergy." },
  { name: "Ascoril D Plus", generic_name: "Dextromethorphan + Phenylephrine + Chlorpheniramine", dosage_form: "Syrup", strength: "100ml", default_frequency: "1-0-1", default_timing: "After Food", default_duration_days: 5, instructions: "For dry irritating cough." },
  { name: "Ascoril LS", generic_name: "Levosalbutamol + Ambroxol + Guaiphenesin", dosage_form: "Syrup", strength: "100ml", default_frequency: "1-0-1", default_timing: "After Food", default_duration_days: 5, instructions: "For productive wet cough with chest congestion." },
  { name: "Nasoclear", generic_name: "Sodium Chloride (0.65% w/v)", dosage_form: "Nasal Spray", strength: "20ml", default_frequency: "1-1-1", default_timing: "As Needed (SOS)", default_duration_days: 5, instructions: "Instill 2 drops/puffs in each nostril before feeding/sleep." },

  // Vitamins, Minerals & Supplements
  { name: "Shelcal 500", generic_name: "Calcium (500mg) + Vitamin D3 (250 IU)", dosage_form: "Tablet", strength: "500mg", default_frequency: "0-1-0", default_timing: "After Food", default_duration_days: 30, instructions: "Take after lunch with water." },
  { name: "Becosules Z", generic_name: "B-Complex + Vitamin C + Zinc", dosage_form: "Capsule", strength: "Multi", default_frequency: "0-1-0", default_timing: "After Food", default_duration_days: 15, instructions: "For mouth ulcers, general weakness & immunity." },
  { name: "Limcee 500", generic_name: "Vitamin C (500mg)", dosage_form: "Tablet", strength: "500mg", default_frequency: "1-0-0", default_timing: "After Food", default_duration_days: 15, instructions: "Chewable tablet. Take once daily." },
  { name: "Orofer XT", generic_name: "Ferrous Ascorbate (100mg) + Folic Acid (1.5mg)", dosage_form: "Tablet", strength: "100mg/1.5mg", default_frequency: "1-0-0", default_timing: "After Food", default_duration_days: 30, instructions: "Do not take with milk or tea/coffee." },
];

/**
 * Auto-seed initial Indian drug database if empty
 */
export const seedMedicinesIfEmpty = async () => {
  const count = await Medicine.countDocuments();
  if (count === 0) {
    await Medicine.insertMany(DEFAULT_INDIAN_DRUGS);
    console.log(`[DRUG DB] Seeded ${DEFAULT_INDIAN_DRUGS.length} popular clinical medications.`);
  }
};

/**
 * Lightning fast medicine search (Brand name + Generic Composition)
 */
export const searchMedicinesService = async ({ query, doctorId }) => {
  await seedMedicinesIfEmpty();

  if (!query || query.trim().length === 0) {
    return Medicine.find({ is_custom: false }).limit(15);
  }

  const cleanQ = query.trim();
  const searchRegex = new RegExp(cleanQ, "i");

  const filter = {
    $and: [
      { $or: [{ name: searchRegex }, { generic_name: searchRegex }] },
      { $or: [{ is_custom: false }, ...(doctorId ? [{ doctor_id: doctorId }] : [])] },
    ],
  };

  const results = await Medicine.find(filter).limit(20);
  return results;
};

/**
 * Add custom doctor medicine
 */
export const createCustomMedicineService = async ({ doctorId, data }) => {
  const medicine = await Medicine.create({
    ...data,
    is_custom: true,
    doctor_id: doctorId,
  });

  return medicine;
};
