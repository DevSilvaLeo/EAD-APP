import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Aceita e-mail válido ou CPF com 11 dígitos. */
export function emailOuCpfValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const raw = (control.value as string | null | undefined)?.trim() ?? '';
    if (!raw) {
      return { required: true };
    }
    if (EMAIL_RE.test(raw)) {
      return null;
    }
    const digits = raw.replace(/\D/g, '');
    if (!/^\d{11}$/.test(digits)) {
      return { emailOuCpf: true };
    }
    return null;
  };
}

export function cpfSomenteValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const digits = (control.value as string | null | undefined)?.replace(/\D/g, '') ?? '';
    if (!digits) {
      return { required: true };
    }
    if (!/^\d{11}$/.test(digits)) {
      return { cpfInvalido: true };
    }
    return null;
  };
}
