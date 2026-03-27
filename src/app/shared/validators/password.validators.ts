import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** 8–13 caracteres, 1 maiúscula, 1 minúscula, 1 número, 1 especial (!@#$%) */
export function loginPasswordValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const v = control.value as string | null | undefined;
    if (v == null || v === '') {
      return null;
    }
    const len = v.length >= 8 && v.length <= 13;
    const upper = /[A-Z]/.test(v);
    const lower = /[a-z]/.test(v);
    const num = /\d/.test(v);
    const special = /[!@#$%]/.test(v);
    if (len && upper && lower && num && special) {
      return null;
    }
    return {
      loginPassword: true,
    };
  };
}

export function matchFieldValidator(otherFieldName: string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const parent = control.parent;
    if (!parent) {
      return null;
    }
    const other = parent.get(otherFieldName);
    if (!other) {
      return null;
    }
    return other.value === control.value ? null : { mismatch: true };
  };
}
