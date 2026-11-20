const SupportTicket = require('../models/SupportTicket');

const emailPattern = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/;
const supportStatuses = ['Pending', 'In Progress', 'Resolved'];

const createTicket = async (req, res) => {
  try {
    const { name, email, subject, message } = req.body || {};
    if (
      typeof name !== 'string' ||
      typeof email !== 'string' ||
      typeof subject !== 'string' ||
      typeof message !== 'string' ||
      !name.trim() ||
      !subject.trim() ||
      !message.trim() ||
      !emailPattern.test(email.trim())
    ) {
      return res.status(400).json({ message: 'Provide your name, a valid email, subject, and message.' });
    }
    if (subject.trim().length > 160 || message.trim().length > 5000) {
      return res.status(400).json({ message: 'Subject or message is too long.' });
    }

    const ticket = await SupportTicket.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      subject: subject.trim(),
      message: message.trim(),
    });
    return res.status(201).json({
      id: ticket._id,
      status: ticket.status,
      createdAt: ticket.createdAt,
    });
  } catch (error) {
    return res.status(500).json({ message: 'Could not submit your support request' });
  }
};

const getCustomerTicket = async (req, res) => {
  try {
    const email = typeof req.query.email === 'string' ? req.query.email.trim().toLowerCase() : '';
    const ticket = await SupportTicket.findOne({ _id: req.params.id, email });
    if (!ticket) return res.status(404).json({ message: 'Support request not found' });
    return res.json({
      id: ticket._id,
      subject: ticket.subject,
      status: ticket.status,
      replies: ticket.replies,
      updatedAt: ticket.updatedAt,
    });
  } catch (error) {
    return res.status(404).json({ message: 'Support request not found' });
  }
};

const getSupportTickets = async (req, res) => {
  try {
    return res.json(await SupportTicket.find().sort({ updatedAt: -1 }));
  } catch (error) {
    return res.status(500).json({ message: 'Could not load support requests' });
  }
};

const updateSupportTicket = async (req, res) => {
  try {
    const { status, reply } = req.body || {};
    if (status && !supportStatuses.includes(status)) {
      return res.status(400).json({ message: 'Choose a valid support status.' });
    }
    if (reply !== undefined && (typeof reply !== 'string' || !reply.trim())) {
      return res.status(400).json({ message: 'Reply cannot be empty.' });
    }

    const ticket = await SupportTicket.findById(req.params.id);
    if (!ticket) return res.status(404).json({ message: 'Support request not found' });
    if (status) ticket.status = status;
    if (reply !== undefined) {
      ticket.replies.push({ message: reply.trim(), author: 'admin' });
      if (!status && ticket.status === 'Pending') ticket.status = 'In Progress';
    }
    await ticket.save();
    return res.json(ticket);
  } catch (error) {
    return res.status(400).json({ message: 'Could not update support request' });
  }
};

module.exports = {
  createTicket,
  getCustomerTicket,
  getSupportTickets,
  updateSupportTicket,
};
