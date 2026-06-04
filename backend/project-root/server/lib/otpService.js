/**
 * OTP Service
 * Handles OTP generation, storage, and verification.
 * Uses Fast2SMS API to send real SMS to Indian phone numbers.
 */

// In-memory OTP store (keyed by phone number)
// Each entry: { otp: string, expiresAt: number, attempts: number }
const otpStore = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const MAX_VERIFY_ATTEMPTS = 5;
const OTP_LENGTH = 6;

/**
 * Generate a random numeric OTP
 */
function generateOTP() {
  let otp = "";
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += Math.floor(Math.random() * 10).toString();
  }
  return otp;
}

/**
 * Normalize phone to digits only (remove spaces, dashes, +91 prefix)
 */
function normalizePhone(phone) {
  let digits = phone.replace(/[\s\-\(\)]/g, "");
  // Remove +91 or 91 prefix if present
  if (digits.startsWith("+91")) digits = digits.slice(3);
  else if (digits.startsWith("91") && digits.length === 12) digits = digits.slice(2);
  return digits;
}

/**
 * Send OTP via Fast2SMS API
 * Docs: https://docs.fast2sms.com/
 */
async function sendOTPviaSMS(phone, otp) {
  const apiKey = process.env.FAST2SMS_API_KEY;

  if (!apiKey) {
    console.warn("FAST2SMS_API_KEY not set — OTP will be logged to console only");
    console.log(`[OTP DEBUG] Phone: ${phone}, OTP: ${otp}`);
    return { success: true, simulated: true };
  }

  try {
    const response = await fetch("https://www.fast2sms.com/dev/bulkV2", {
      method: "POST",
      headers: {
        "authorization": apiKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        route: "otp",
        variables_values: otp,
        flash: "0",
        numbers: phone,
      }),
    });

    const data = await response.json();
    console.log("[Fast2SMS Response]", JSON.stringify(data));

    if (data.return === true || data.status_code === 200) {
      return { success: true, simulated: false };
    } else {
      console.error("[Fast2SMS Error]", data.message || data);
      return { success: false, error: data.message || "SMS delivery failed" };
    }
  } catch (err) {
    console.error("[Fast2SMS Network Error]", err.message);
    return { success: false, error: "Failed to connect to SMS service" };
  }
}

/**
 * Create and send OTP for a phone number
 */
async function createAndSendOTP(phone) {
  const normalized = normalizePhone(phone);

  if (normalized.length !== 10 || !/^\d{10}$/.test(normalized)) {
    return { success: false, message: "Invalid phone number. Please enter a valid 10-digit Indian mobile number." };
  }

  // Rate limit: check if OTP was sent recently (cooldown 30s)
  const existing = otpStore.get(normalized);
  if (existing && (Date.now() - (existing.createdAt || 0)) < 30000) {
    return { success: false, message: "Please wait 30 seconds before requesting a new OTP." };
  }

  const otp = generateOTP();

  // Store OTP
  otpStore.set(normalized, {
    otp,
    expiresAt: Date.now() + OTP_EXPIRY_MS,
    attempts: 0,
    createdAt: Date.now(),
  });

  // Send via SMS
  const sendResult = await sendOTPviaSMS(normalized, otp);

  if (!sendResult.success) {
    return { success: false, message: sendResult.error || "Failed to send OTP" };
  }

  return {
    success: true,
    message: sendResult.simulated
      ? `OTP logged to server console (API key not configured). Check server logs.`
      : `OTP sent successfully to +91 ${normalized.slice(0, 3)}****${normalized.slice(7)}`,
    simulated: sendResult.simulated || false,
  };
}

/**
 * Verify OTP for a phone number
 */
function verifyOTP(phone, userOtp) {
  const normalized = normalizePhone(phone);
  const entry = otpStore.get(normalized);

  if (!entry) {
    return { success: false, message: "No OTP was sent to this number. Please request a new one." };
  }

  if (Date.now() > entry.expiresAt) {
    otpStore.delete(normalized);
    return { success: false, message: "OTP has expired. Please request a new one." };
  }

  if (entry.attempts >= MAX_VERIFY_ATTEMPTS) {
    otpStore.delete(normalized);
    return { success: false, message: "Too many failed attempts. Please request a new OTP." };
  }

  entry.attempts += 1;

  if (entry.otp !== userOtp.toString().trim()) {
    return {
      success: false,
      message: `Incorrect OTP. ${MAX_VERIFY_ATTEMPTS - entry.attempts} attempt(s) remaining.`,
    };
  }

  // OTP verified — clean up
  otpStore.delete(normalized);
  return { success: true, message: "Phone number verified successfully!" };
}

module.exports = {
  createAndSendOTP,
  verifyOTP,
  normalizePhone,
};
