"use client";
import { FormEvent } from "react";

export default function RegisterForm() {
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(e.currentTarget);

    const response = await fetch(`/api/auth/register`, {
      method: "POST",
      body: JSON.stringify({
        email: formData.get("email"),
        username: formData.get("username"),
        password: formData.get("password"),
      }),
    });
    if (response.ok) {
      alert("Registration Successful");
      form.reset();
    } else {
      const error = await response.json();
      alert(error.message || "Registration failed!");
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
          name="username"
          type="username"
          placeholder="username"
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
          Register
        </button>
      </form>
    </div>
  );
}
