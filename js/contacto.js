import { initBaseLayout, escapeHtml, showToast } from "./main.js";

const form = document.querySelector("[data-contact-form]");
const successBox = document.querySelector("[data-contact-success]");

const validators = {
  name(value) {
    const trimmed = value.trim();
    if (!trimmed) return "Por favor escribe tu nombre completo.";
    if (trimmed.length < 3) return "El nombre debe tener al menos 3 caracteres.";
    if (!/^[a-zA-ZÁÉÍÓÚÜÑáéíóúüñ\s.'-]+$/.test(trimmed)) {
      return "El nombre solo debe contener letras y espacios.";
    }
    return "";
  },
  email(value) {
    const trimmed = value.trim();
    if (!trimmed) return "El correo electrónico es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(trimmed)) {
      return "Ingresa un correo electrónico válido (ej. usuario@dominio.com).";
    }
    return "";
  },
  topic(value) {
    if (!value) return "Selecciona un motivo de consulta.";
    return "";
  },
  message(value) {
    const trimmed = value.trim();
    if (!trimmed) return "Escribe un mensaje para tu consulta.";
    if (trimmed.length < 15) return "Escribe al menos 15 caracteres para darte mejor contexto.";
    return "";
  }
};

function setFieldState(fieldName, errorMessage) {
  const input = form?.elements[fieldName];
  const errorEl = form?.querySelector(`[data-error-for="${fieldName}"]`);

  if (input) {
    input.classList.toggle("is-invalid", Boolean(errorMessage));
    input.setAttribute("aria-invalid", String(Boolean(errorMessage)));
  }
  if (errorEl) {
    errorEl.textContent = errorMessage;
  }
}

function validateField(fieldName) {
  const input = form?.elements[fieldName];
  const rule = validators[fieldName];
  if (!input || !rule) return true;

  const message = rule(input.value);
  setFieldState(fieldName, message);
  return !message;
}

function validateAll() {
  return Object.keys(validators).every((fieldName) => validateField(fieldName));
}

function initContactForm() {
  initBaseLayout();
  if (!form) return;

  Object.keys(validators).forEach((fieldName) => {
    const input = form.elements[fieldName];
    input?.addEventListener("input", () => {
      if (successBox) successBox.innerHTML = "";
      validateField(fieldName);
    });
    input?.addEventListener("blur", () => validateField(fieldName));
  });

  form.addEventListener("reset", () => {
    Object.keys(validators).forEach((fieldName) => setFieldState(fieldName, ""));
    if (successBox) successBox.innerHTML = "";
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    if (successBox) successBox.innerHTML = "";

    if (!validateAll()) {
      const firstInvalid = form.querySelector(".is-invalid");
      firstInvalid?.focus();
      showToast("Revisa los campos marcados en el formulario");
      return;
    }

    const senderName = form.elements.name.value.trim();
    const senderEmail = form.elements.email.value.trim();

    if (successBox) {
      successBox.innerHTML = `
        <div class="alert-success">
          Gracias, ${escapeHtml(senderName)}. Tu mensaje fue validado y registrado para respuesta a ${escapeHtml(senderEmail)}.
        </div>
      `;
    }

    showToast("Mensaje enviado correctamente");
    form.reset();
  });
}

initContactForm();