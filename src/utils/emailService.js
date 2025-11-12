import emailjs from "emailjs-com";

export const sendUnfreezeEmail = async (email, verification_code) => {
  try {
    const verification_link = `https://yourwebsite.com/unfreeze?code=${verification_code}`;

    const templateParams = {
      email,
      verification_code,
      verification_link,
    };

    await emailjs.send(
      "service_x1nzoem",    // Replace with your EmailJS service ID
      "template_osjkopj",   // Replace with your template ID
      templateParams,
      "mYs6Nk0Xjzs1vN-5z"     // Replace with your EmailJS public key
    );

    console.log("✅ Unfreeze email sent to:", email);
  } catch (error) {
    console.error("❌ Failed to send email:", error);
  }
};
