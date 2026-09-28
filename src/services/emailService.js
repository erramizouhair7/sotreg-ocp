import emailjs from "@emailjs/browser";

export async function sendEmailNotification({
  subject,
  message,
  type = "Information",
}) {
  const serviceId =
    import.meta.env
      .VITE_EMAILJS_SERVICE_ID;

  const templateId =
    import.meta.env
      .VITE_EMAILJS_TEMPLATE_ID;

  const publicKey =
    import.meta.env
      .VITE_EMAILJS_PUBLIC_KEY;

  const destination =
    import.meta.env
      .VITE_NOTIFICATION_EMAIL;

  if (
    !serviceId ||
    !templateId ||
    !publicKey ||
    !destination
  ) {
    console.warn(
      "EmailJS n'est pas encore configuré."
    );

    return {
      success: false,
      skipped: true,
    };
  }

  try {
    const result =
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: destination,
          subject,
          notification_type: type,
          message,
          sent_at:
            new Date().toLocaleString(
              "fr-FR"
            ),
        },
        {
          publicKey,
        }
      );

    return {
      success: true,
      result,
    };
  } catch (error) {
    console.error(
      "Erreur EmailJS :",
      error
    );

    return {
      success: false,
      error,
    };
  }
}