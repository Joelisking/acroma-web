export type SuperAdmin = { id: string; email: string; name: string };

export type StartLoginResponse = { pendingToken: string };

export type VerifyTotpResponse = {
  token: string;
  /** ISO timestamp the session ends. */
  expiresAt: string;
  admin: SuperAdmin;
};

/** State returned by the sign-in server actions (`useActionState`). */
export type AdminFormState = { error?: string };
