"use client";

import Link from "next/link";
import { LucideChevronLeft, LucideShieldAlert, LucideInfo } from "lucide-react";

export default function RulesPage() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto w-full">
      <div className="flex items-center gap-3 mb-2 md:mb-6">
        <Link href="/student" className="btn-3d-secondary p-2 rounded-full flex items-center justify-center">
          <LucideChevronLeft size={24} className="text-foreground" />
        </Link>
        <div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-foreground drop-shadow-sm">Rules & Regulations</h2>
          <p className="text-sm text-muted-foreground mt-1">Please adhere to the following guidelines.</p>
        </div>
      </div>

      <div className="card-3d p-6 md:p-8 flex flex-col gap-8">
        <section>
          <h3 className="text-xl font-extrabold text-foreground mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">schedule</span>
            1. Meal Timings
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground font-medium">
            <li><strong className="text-foreground">Breakfast:</strong> 07:30 AM – 09:30 AM</li>
            <li><strong className="text-foreground">Lunch:</strong> 12:30 PM – 02:30 PM</li>
            <li><strong className="text-foreground">Dinner:</strong> 07:30 PM – 09:30 PM</li>
            <li>Strict adherence to meal timings is expected. Service will not be available outside these hours.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-extrabold text-foreground mb-4 flex items-center gap-2">
            <span className="material-symbols-outlined text-orange-500">restaurant</span>
            2. Dining Etiquette & Hygiene
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground font-medium">
            <li>Wash hands before and after meals.</li>
            <li>Maintain queue discipline while taking food.</li>
            <li>Do not waste food. Take only what you can eat; you can always go for second servings.</li>
            <li>Return used plates, glasses, and cutlery to the designated washing area.</li>
            <li>Do not take mess utensils to your hostel rooms.</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-extrabold text-foreground mb-4 flex items-center gap-2">
            <LucideShieldAlert className="text-destructive" size={24} />
            3. Disciplinary Rules
          </h3>
          <ul className="list-disc pl-6 space-y-2 text-muted-foreground font-medium">
            <li>Carry your valid Student ID card to the mess at all times. The QR code must be scanned for attendance.</li>
            <li>Entry without proper attire (e.g., nightwear, sleeveless shirts, or bathroom slippers) is strictly prohibited.</li>
            <li>Misbehavior with mess staff or fellow students will lead to strict disciplinary action.</li>
            <li>Outside food or guests are not allowed in the mess area without prior permission from the Warden.</li>
          </ul>
        </section>

        <div className="bg-primary/10 border-l-4 border-primary p-4 rounded-r-xl mt-4 flex gap-4">
          <LucideInfo className="text-primary shrink-0" size={24} />
          <p className="text-sm font-semibold text-primary/80">
            Violation of these rules may result in fine imposition, temporary suspension from the mess, or other disciplinary actions as deemed fit by the Authority.
          </p>
        </div>
      </div>
    </div>
  );
}
