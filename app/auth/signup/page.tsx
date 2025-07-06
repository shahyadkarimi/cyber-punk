import SignupForm from "@/components/auth/signup-form";
import { Suspense } from "react";

export default function SignupPage() {
  return (
    <div className="min-h-screen bg-[#0d0d0f] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Suspense>
          <SignupForm />
        </Suspense>
      </div>
    </div>
  );
}
