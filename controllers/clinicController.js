import {
  createClinicService,
  getUserClinicsService,
  getClinicByIdService,
  updateClinicService,
  addStaffService,
  getClinicStaffService,
  updateStaffService,
  removeStaffService,
  switchActiveClinicService,
} from "../services/clinicService.js";
import { sendSuccess } from "../utils/responseUtil.js";

export const createClinic = async (req, res, next) => {
  try {
    const clinic = await createClinicService({
      userId: req.user.userId,
      data: req.body,
    });
    return sendSuccess(res, "Clinic created successfully", { clinic }, 201);
  } catch (error) {
    next(error);
  }
};

export const getMyClinics = async (req, res, next) => {
  try {
    const clinics = await getUserClinicsService({ userId: req.user.userId });
    return sendSuccess(res, "Clinics fetched successfully", { clinics }, 200);
  } catch (error) {
    next(error);
  }
};

export const getClinicById = async (req, res, next) => {
  try {
    const clinic = await getClinicByIdService({ clinicId: req.params.id });
    return sendSuccess(res, "Clinic details fetched successfully", { clinic }, 200);
  } catch (error) {
    next(error);
  }
};

export const updateClinic = async (req, res, next) => {
  try {
    const clinic = await updateClinicService({
      clinicId: req.params.id,
      data: req.body,
    });
    return sendSuccess(res, "Clinic updated successfully", { clinic }, 200);
  } catch (error) {
    next(error);
  }
};

export const addStaff = async (req, res, next) => {
  try {
    const staff = await addStaffService({
      clinicId: req.params.id,
      ...req.body,
    });
    return sendSuccess(res, "Staff member added successfully", { staff }, 201);
  } catch (error) {
    next(error);
  }
};

export const getClinicStaff = async (req, res, next) => {
  try {
    const staff = await getClinicStaffService({ clinicId: req.params.id });
    return sendSuccess(res, "Clinic staff fetched successfully", { staff }, 200);
  } catch (error) {
    next(error);
  }
};

export const updateStaff = async (req, res, next) => {
  try {
    const staff = await updateStaffService({
      staffId: req.params.staffId,
      data: req.body,
    });
    return sendSuccess(res, "Staff member updated successfully", { staff }, 200);
  } catch (error) {
    next(error);
  }
};

export const removeStaff = async (req, res, next) => {
  try {
    await removeStaffService({ staffId: req.params.staffId });
    return sendSuccess(res, "Staff member removed successfully", null, 200);
  } catch (error) {
    next(error);
  }
};

export const switchActiveClinic = async (req, res, next) => {
  try {
    const user = await switchActiveClinicService({
      userId: req.user.userId,
      clinicId: req.body.clinic_id,
    });
    return sendSuccess(res, "Active clinic switched successfully", { user }, 200);
  } catch (error) {
    next(error);
  }
};
