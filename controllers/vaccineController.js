import {
  getPatientVaccineScheduleService,
  markVaccineGivenService,
} from "../services/vaccineService.js";
import { sendSuccess } from "../utils/responseUtil.js";

export const getPatientVaccineSchedule = async (req, res, next) => {
  try {
    const data = await getPatientVaccineScheduleService({
      patientId: req.params.patientId,
    });
    return sendSuccess(res, "Vaccine schedule fetched successfully", data, 200);
  } catch (error) {
    next(error);
  }
};

export const markVaccineGiven = async (req, res, next) => {
  try {
    const record = await markVaccineGivenService({
      vaccineRecordId: req.params.id,
      doctorId: req.user.userId,
      givenDate: req.body.given_date,
      brandName: req.body.brand_name,
      batchNumber: req.body.batch_number,
      notes: req.body.notes,
    });
    return sendSuccess(res, "Vaccine marked as given successfully", { record }, 200);
  } catch (error) {
    next(error);
  }
};
