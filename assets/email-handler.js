// Secure email functionality for Beyryl website using Formspree
class EmailHandler {
  constructor() {
    // Formspree endpoint - safe to expose publicly
    this.formspreeEndpoint = 'https://formspree.io/f/mwpqayaw'; // Replace with your Formspree form ID
    this.init();
  }

  init() {
    console.log('Email handler initialized with Formspree');
  }

  async sendEmail(email, formType = 'general') {
    try {
      const response = await fetch(this.formspreeEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: email,
          formType: formType,
          message: `New access request from ${formType} form`,
          timestamp: new Date().toISOString(),
          _replyto: email,
          _subject: `Beyryl Access Request from ${formType} form`,
        }),
      });

      if (response.ok) {
        return { success: true, response };
      } else {
        throw new Error('Failed to submit form');
      }
    } catch (error) {
      console.error('Failed to send email:', error);
      return { success: false, error };
    }
  }

  // Show success/error messages to user
  showMessage(form, success, message) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `mt-4 p-3 rounded-md text-sm ${
      success 
        ? 'bg-green-900/20 border border-green-500/30 text-green-400' 
        : 'bg-red-900/20 border border-red-500/30 text-red-400'
    }`;
    messageDiv.textContent = message;

    // Remove any existing message
    const existingMessage = form.querySelector('.email-message');
    if (existingMessage) {
      existingMessage.remove();
    }

    messageDiv.classList.add('email-message');
    form.appendChild(messageDiv);

    // Auto-remove message after 5 seconds
    setTimeout(() => {
      if (messageDiv.parentNode) {
        messageDiv.remove();
      }
    }, 5000);
  }

  // Handle form submission
  async handleFormSubmit(event, formType) {
    event.preventDefault();
    
    const form = event.target;
    const emailInput = form.querySelector('input[type="email"]');
    const submitButton = form.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;

    if (!emailInput || !emailInput.value) {
      this.showMessage(form, false, 'Please enter a valid email address.');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailInput.value)) {
      this.showMessage(form, false, 'Please enter a valid email address.');
      return;
    }

    // Check for business email (exclude public domains)
    const email = emailInput.value.toLowerCase();
    const publicDomains = [
      'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
      'icloud.com', 'me.com', 'mac.com', 'live.com', 'msn.com',
      'yahoo.co.uk', 'yahoo.ca', 'yahoo.in', 'googlemail.com',
      'protonmail.com', 'tutanota.com', 'zoho.com', 'mail.com'
    ];

    const domain = email.split('@')[1];
    if (publicDomains.includes(domain)) {
      this.showMessage(form, false, 'Please use your work email address. Personal email addresses are not accepted.');
      return;
    }

    // Update button to show loading state
    submitButton.textContent = 'Sending...';
    submitButton.disabled = true;

    try {
      const result = await this.sendEmail(emailInput.value, formType);
      
      if (result.success) {
        this.showMessage(form, true, 'Thank you! Your access request has been sent. We\'ll be in touch soon!');
        emailInput.value = ''; // Clear the form
      } else {
        this.showMessage(form, false, 'Sorry, there was an error sending your request. Please try again or contact mo@beyryl.com directly.');
      }
    } catch (error) {
      this.showMessage(form, false, 'Sorry, there was an error sending your request. Please try again or contact mo@beyryl.com directly.');
    } finally {
      // Reset button state
      submitButton.textContent = originalButtonText;
      submitButton.disabled = false;
    }
  }
}

// Initialize email handler when page loads
let emailHandler;

document.addEventListener('DOMContentLoaded', function() {
  emailHandler = new EmailHandler();
  
  // Wait for components to load, then attach form handlers
  setTimeout(() => {
    // Find and attach handlers to all forms
    const heroForm = document.querySelector('#hero form');
    const ctaForm = document.querySelector('#contact form');
    
    if (heroForm) {
      heroForm.addEventListener('submit', (e) => emailHandler.handleFormSubmit(e, 'hero'));
    }
    
    if (ctaForm) {
      ctaForm.addEventListener('submit', (e) => emailHandler.handleFormSubmit(e, 'cta'));
    }
  }, 1000); // Wait 1 second for components to load
});
