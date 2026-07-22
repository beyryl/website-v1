/**
 * Handles Beyryl Vessel private briefing submissions.
 *
 * The Formspree endpoint is intentionally public because requests are submitted
 * directly from the browser. Do not place API secrets or private credentials in
 * this file.
 */
class PrivateBriefingFormHandler {
  constructor() {
    // Existing Beyryl Formspree form endpoint.
    this.formspreeEndpoint = "https://formspree.io/f/mwpqayaw";

    // Personal email providers are rejected because this is a business inquiry.
    this.publicEmailDomains = new Set([
      "gmail.com",
      "googlemail.com",
      "yahoo.com",
      "yahoo.co.uk",
      "yahoo.ca",
      "yahoo.in",
      "hotmail.com",
      "outlook.com",
      "live.com",
      "msn.com",
      "aol.com",
      "icloud.com",
      "me.com",
      "mac.com",
      "protonmail.com",
      "proton.me",
      "tutanota.com",
      "tuta.com",
      "zoho.com",
      "mail.com",
    ]);

    this.form = document.getElementById("briefingForm");

    if (!this.form) {
      console.warn(
        "Private briefing form was not found. Expected #briefingForm.",
      );
      return;
    }

    this.submitButton = this.form.querySelector('button[type="submit"]');
    this.originalButtonText =
      this.submitButton?.textContent?.trim() || "Request briefing";

    this.form.addEventListener("submit", (event) => {
      this.handleSubmit(event);
    });
  }

  /**
   * Reads and normalizes the values from the private briefing form.
   */
  getFormValues() {
    return {
      name: this.getInputValue("name"),
      email: this.getInputValue("work-email").toLowerCase(),
      company: this.getInputValue("company-name"),
      role: this.getInputValue("role"),
      brief: this.getInputValue("brief"),
    };
  }

  /**
   * Returns a trimmed value from an input or textarea.
   */
  getInputValue(elementId) {
    const element = document.getElementById(elementId);

    if (!element) {
      return "";
    }

    return element.value.trim();
  }

  /**
   * Performs client-side validation before sending anything to Formspree.
   */
  validate(values) {
    if (!values.name) {
      return {
        valid: false,
        fieldId: "name",
        message: "Please enter your name.",
      };
    }

    if (!values.email) {
      return {
        valid: false,
        fieldId: "work-email",
        message: "Please enter your work email address.",
      };
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(values.email)) {
      return {
        valid: false,
        fieldId: "work-email",
        message: "Please enter a valid work email address.",
      };
    }

    const emailDomain = values.email.split("@")[1];

    if (this.publicEmailDomains.has(emailDomain)) {
      return {
        valid: false,
        fieldId: "work-email",
        message:
          "Please use your company email address. Personal email addresses are not accepted.",
      };
    }

    if (!values.company) {
      return {
        valid: false,
        fieldId: "company-name",
        message: "Please enter your company name.",
      };
    }

    if (values.name.length > 100) {
      return {
        valid: false,
        fieldId: "name",
        message: "Please keep your name under 100 characters.",
      };
    }

    if (values.email.length > 254) {
      return {
        valid: false,
        fieldId: "work-email",
        message: "Please keep your email address under 254 characters.",
      };
    }

    if (values.company.length > 160) {
      return {
        valid: false,
        fieldId: "company-name",
        message: "Please keep the company name under 160 characters.",
      };
    }

    if (values.role.length > 160) {
      return {
        valid: false,
        fieldId: "role",
        message: "Please keep the role under 160 characters.",
      };
    }

    if (values.brief.length > 2000) {
      return {
        valid: false,
        fieldId: "brief",
        message: "Please keep the briefing description under 2,000 characters.",
      };
    }

    return {
      valid: true,
      fieldId: null,
      message: "",
    };
  }

  /**
   * Sends all private briefing fields to Formspree.
   */
  async submitToFormspree(values) {
    const response = await fetch(this.formspreeEndpoint, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: values.name,
        email: values.email,
        company: values.company,
        role: values.role || "Not provided",
        briefing_request: values.brief || "No additional details provided",
        form_type: "Beyryl Vessel private briefing",
        source_page: window.location.href,
        submitted_at: new Date().toISOString(),

        // Formspree-supported metadata.
        _replyto: values.email,
        _subject: `Beyryl Vessel private briefing request — ${values.company}`,
      }),
    });

    if (!response.ok) {
      let errorMessage = "Formspree rejected the briefing request.";

      try {
        const responseBody = await response.json();

        if (Array.isArray(responseBody.errors)) {
          errorMessage = responseBody.errors
            .map((error) => error.message)
            .filter(Boolean)
            .join(" ");
        }
      } catch {
        // Formspree did not return JSON. Keep the default error message.
      }

      throw new Error(errorMessage);
    }

    return response;
  }

  /**
   * Processes a form submission.
   */
  async handleSubmit(event) {
    event.preventDefault();

    this.removeMessage();

    const values = this.getFormValues();
    const validation = this.validate(values);

    if (!validation.valid) {
      this.showMessage("error", validation.message);

      const invalidField = document.getElementById(validation.fieldId);

      if (invalidField) {
        invalidField.focus();
      }

      return;
    }

    this.setSubmitting(true);

    try {
      await this.submitToFormspree(values);

      this.form.reset();

      this.showMessage(
        "success",
        "Thank you. Your private briefing request has been received. The Beyryl team will contact you shortly.",
      );
    } catch (error) {
      console.error("Private briefing submission failed:", error);

      this.showMessage(
        "error",
        "We could not submit your request. Please try again or contact mo@beyryl.com.",
      );
    } finally {
      this.setSubmitting(false);
    }
  }

  /**
   * Enables or disables the form while the request is in progress.
   */
  setSubmitting(isSubmitting) {
    if (!this.submitButton) {
      return;
    }

    this.submitButton.disabled = isSubmitting;
    this.submitButton.textContent = isSubmitting
      ? "Submitting..."
      : this.originalButtonText;

    this.submitButton.setAttribute(
      "aria-busy",
      isSubmitting ? "true" : "false",
    );

    this.submitButton.style.opacity = isSubmitting ? "0.72" : "";
    this.submitButton.style.cursor = isSubmitting ? "wait" : "";
  }

  /**
   * Displays a message inside the modal beneath the submit button.
   */
  showMessage(type, message) {
    this.removeMessage();

    const messageElement = document.createElement("div");
    const isSuccess = type === "success";

    messageElement.className = "briefing-form-message";
    messageElement.setAttribute("role", isSuccess ? "status" : "alert");
    messageElement.setAttribute("aria-live", isSuccess ? "polite" : "assertive");
    messageElement.textContent = message;

    Object.assign(messageElement.style, {
      marginTop: "14px",
      border: `1px solid ${
        isSuccess
          ? "rgba(80, 200, 120, 0.34)"
          : "rgba(248, 113, 113, 0.38)"
      }`,
      borderRadius: "14px",
      padding: "12px 14px",
      color: isSuccess ? "#9be8b3" : "#fca5a5",
      background: isSuccess
        ? "rgba(80, 200, 120, 0.08)"
        : "rgba(248, 113, 113, 0.08)",
      fontSize: "0.86rem",
      lineHeight: "1.5",
    });

    this.form.appendChild(messageElement);
  }

  /**
   * Removes the previous success or error message.
   */
  removeMessage() {
    const existingMessage = this.form.querySelector(
      ".briefing-form-message",
    );

    if (existingMessage) {
      existingMessage.remove();
    }
  }
}

/**
 * The updated homepage contains the form in the initial HTML, so there is no
 * need for the old one-second timeout used by the component-based website.
 */
function initializePrivateBriefingForm() {
  new PrivateBriefingFormHandler();
}

if (document.readyState === "loading") {
  document.addEventListener(
    "DOMContentLoaded",
    initializePrivateBriefingForm,
    { once: true },
  );
} else {
  initializePrivateBriefingForm();
}