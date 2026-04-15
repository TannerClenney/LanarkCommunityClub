"use server";

export async function registerUser(formData: FormData) {
  void formData;

  return {
    success: false,
    error: "Membership is invite-only. Please contact the club if you need access.",
  };
}
