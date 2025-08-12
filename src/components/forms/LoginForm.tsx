"use client";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { FormEvent } from "react";

export default function LoginForm() {
  const router = useRouter();
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const response = await signIn("credentials", {
      email: formData.get("email"),
      password: formData.get("password"),
      redirect: false,
    });
    console.log(response);
    if (!response?.error) {
      router.push("/dashboard");
      router.refresh();
    }
  };
  return (
    <div>
      <form
        onSubmit={handleSubmit}
        action=""
        className="flex flex-col gap-2 mx-auto mt-10 items-center justify-center"
      >
        <input
          name="email"
          type="email"
          placeholder="email"
          className="border border-black text-center"
        />
        <input
          type="password"
          placeholder="password"
          name="password"
          className="border border-black text-center"
        />
        <button
          type="submit"
          className="border border-black p-5 rounded-full cursor-pointer"
        >
          Login
        </button>
      </form>
    </div>
  );
}
