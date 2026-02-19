import { sendContactConfirmationEmail, sendContactFormToAdmins } from '../utils/emailService.js';

export const submitContactForm = async (req, res) => {
  try {
    const { name, email, subject, message, country, enquiryType } = req.body;

    if (!name || !name.trim()) return res.status(400).json({ success: false, message: 'Name is required.' });
    if (!email || !email.trim()) return res.status(400).json({ success: false, message: 'Email is required.' });
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return res.status(400).json({ success: false, message: 'Enter a valid email address.' });
    if (!country || !country.trim()) return res.status(400).json({ success: false, message: 'Country is required.' });
    if (!enquiryType || !enquiryType.trim()) return res.status(400).json({ success: false, message: 'Enquiry type is required.' });
    if (!message || !message.trim()) return res.status(400).json({ success: false, message: 'Message cannot be empty.' });

    await Promise.all([
      sendContactConfirmationEmail(email, name),
      sendContactFormToAdmins({ name, email, subject, message, country, enquiryType }),
    ]);

    return res.status(200).json({ success: true, message: 'Your message has been sent successfully.' });
  } catch (error) {
    console.error('[ContactForm] Error sending emails:', error);
    return res.status(500).json({ success: false, message: 'Failed to send your message. Please try again later.' });
  }
};
