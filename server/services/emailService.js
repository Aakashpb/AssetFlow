export const sendVerificationEmail = async (email, name, link) => {
  console.log(`✉️ Email Verification Dispatched:
  To: ${email} (${name})
  Subject: Verify Your AssetFlow Account
  Link: ${link}
  `);
  return true;
};

export const sendResetPasswordEmail = async (email, link) => {
  console.log(`✉️ Password Reset Dispatched:
  To: ${email}
  Subject: Recovery Request - AssetFlow Account
  Link: ${link}
  `);
  return true;
};
