import mongoose from "mongoose";
const { Schema } = mongoose;

const growthRecordSchema = new Schema(
  {
    patient_id: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },
    clinic_id: {
      type: Schema.Types.ObjectId,
      ref: "Clinic",
      required: true,
      index: true,
    },
    recorded_date: {
      type: Date,
      default: Date.now,
    },
    age_in_months: {
      type: Number,
      required: true,
      min: 0,
      max: 240, // Up to 20 years
    },
    weight_kg: {
      type: Number,
      min: 0.5,
      max: 200,
    },
    height_cm: {
      type: Number,
      min: 20,
      max: 250,
    },
    head_circumference_cm: {
      type: Number,
      min: 10,
      max: 100,
    },
    bmi: {
      type: Number,
      min: 5,
      max: 90,
    },
    weight_percentile: {
      type: Number,
      default: 50,
    },
    height_percentile: {
      type: Number,
      default: 50,
    },
    head_percentile: {
      type: Number,
      default: 50,
    },
    developmental_milestones: {
      type: [String],
      default: [],
    },
    nutritional_status: {
      type: String,
      enum: ["Normal", "Mild Underweight", "Moderate Underweight", "Severe Underweight", "Overweight", "Obese"],
      default: "Normal",
    },
    notes: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

// Auto-calculate BMI before saving
growthRecordSchema.pre("save", function () {
  if (this.weight_kg && this.height_cm) {
    const heightInMeters = this.height_cm / 100;
    this.bmi = parseFloat((this.weight_kg / (heightInMeters * heightInMeters)).toFixed(1));
  }
});

growthRecordSchema.index({ patient_id: 1, recorded_date: 1 });

const GrowthRecord = mongoose.model("GrowthRecord", growthRecordSchema);
export default GrowthRecord;
