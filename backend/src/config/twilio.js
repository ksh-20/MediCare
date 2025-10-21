const twilio = require('twilio')

const accountSid = process.env.TWILIO_ACCOUNT_SID
const authToken = process.env.TWILIO_AUTH_TOKEN
const phoneNumber = process.env.TWILIO_PHONE_NUMBER

if (!accountSid || !authToken || !phoneNumber) {
  console.warn('Twilio credentials not found. SMS functionality will be disabled.')
}

const client = twilio(accountSid, authToken)

const sendSMS = async (to, message) => {
  try {
    if (!accountSid || !authToken || !phoneNumber) {
      console.log('SMS not sent - Twilio not configured:', { to, message })
      return { success: false, error: 'SMS service not configured' }
    }

    const result = await client.messages.create({
      body: message,
      from: phoneNumber,
      to: to
    })

    console.log('SMS sent successfully:', result.sid)
    return { success: true, messageId: result.sid }
  } catch (error) {
    console.error('SMS sending failed:', error)
    return { success: false, error: error.message }
  }
}

const sendMedicationReminder = async (phoneNumber, elderlyName, medicationName, scheduledTime) => {
  const message = `Medication Reminder: ${elderlyName} needs to take ${medicationName} at ${scheduledTime}. Please ensure they take their medication on time.`
  return sendSMS(phoneNumber, message)
}

const sendMissedDoseAlert = async (phoneNumber, elderlyName, medicationName, missedTime) => {
  const message = `URGENT: ${elderlyName} missed their ${medicationName} dose at ${missedTime}. Please check on them immediately.`
  return sendSMS(phoneNumber, message)
}

const sendFallAlert = async (phoneNumber, elderlyName, location) => {
  const message = `EMERGENCY: Potential fall detected for ${elderlyName}${location ? ` at ${location}` : ''}. Please check on them immediately and call emergency services if needed.`
  return sendSMS(phoneNumber, message)
}

module.exports = {
  sendSMS,
  sendMedicationReminder,
  sendMissedDoseAlert,
  sendFallAlert,
  client
}
