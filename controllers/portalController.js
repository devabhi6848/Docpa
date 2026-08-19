import { getPatientPortalDataService } from "../services/portalService.js";
import { sendSuccess } from "../utils/responseUtil.js";

export const getPatientPortalData = async (req, res, next) => {
  try {
    const data = await getPatientPortalDataService({
      patientId: req.params.patientId,
    });
    return sendSuccess(res, "Patient portal data fetched successfully", data, 200);
  } catch (error) {
    next(error);
  }
};
