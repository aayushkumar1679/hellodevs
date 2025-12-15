"use client";

import React, { useState } from "react";

type FormProps = {
  title?: string;
  fields?: string[];
  submitText?: string;
};

export const Form = ({
  title = "Contact Us",
  fields = ["Name", "Email", "Message"],
  submitText = "Submit",
}: FormProps) => {
  const [formData, setFormData] = useState<Record<string, string>>({});

  return (
    <section className="w-full py-12 px-6 bg-white">
      <div className="max-w-md mx-auto">
        <h2 className="text-3xl font-bold mb-6">{title}</h2>
        <form className="space-y-4">
          {fields.map((field) => (
            <div key={field}>
              <label className="block text-sm font-medium mb-1">{field}</label>
              <input
                type={field.toLowerCase() === "email" ? "email" : "text"}
                placeholder={field}
                className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
          <button
            type="submit"
            className="w-full py-2 bg-blue-600 text-white font-bold rounded hover:bg-blue-700 transition"
          >
            {submitText}
          </button>
        </form>
      </div>
    </section>
  );
};
