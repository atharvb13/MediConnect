const Availability = require('../models/availability');
const Appointment = require('../models/appointments');

exports.addAvailability = async (req, res) => {
  const { doctorId, slots } = req.body; // slots: ["2023-10-25T10:00:00", ...]
  try {
    const availabilityData = slots.map(s => ({ doctorId, slot: s }));
    await Availability.insertMany(availabilityData);
    res.json({ message: "Availability updated" });
  } catch (err) { res.status(500).send(err); }
};

exports.getAvailableSlots = async (req, res) => {
  const { doctorId } = req.params;
  const slots = await Availability.find({ doctorId, isBooked: false }).sort({ slot: 1 });
  res.json(slots);
};

exports.bookAppointment = async (req, res) => {
  const { doctorId, patientId, slotId } = req.body;
  try {
    const slot = await Availability.findOneAndUpdate(
      { _id: slotId, isBooked: false }, 
      { isBooked: true }
    );
    if (!slot) return res.status(400).json({ message: "Slot taken" });

    const appt = new Appointment({ doctorId, patientId, slotId });
    await appt.save();
    res.json(appt);
  } catch (err) { res.status(500).send(err); }
};

// Get all appointments for a patient
// ...existing code...

// Get all appointments for a patient
exports.getPatientAppointments = async (req, res) => {
  const { patientId } = req.params;
  try {
    const appts = await Appointment.find({ patientId })
      .populate('doctorId', 'name profession')
      .populate('slotId');
    // Only send required fields
    const result = appts.map(app => ({
      slot: app.slotId?.slot,
      doctorName: app.doctorId?.name,
      doctorProfession: app.doctorId?.profession,
      status: app.status
    }));
    res.json(result);
  } catch (err) { res.status(500).send(err); }
};

// Get all appointments for a doctor
exports.getDoctorAppointments = async (req, res) => {
  const { doctorId } = req.params;
  try {
    const appts = await Appointment.find({ doctorId })
      .populate('patientId', 'name email')
      .populate('slotId');
    // Only send required fields
    const result = appts.map(app => ({
      slot: app.slotId?.slot,
      patientName: app.patientId?.name,
      patientEmail: app.patientId?.email,
      status: app.status
    }));
    res.json(result);
  } catch (err) { res.status(500).send(err); }
};