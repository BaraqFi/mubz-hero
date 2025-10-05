import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/components/layout/header";
import GymWorkouts from "@/components/components/gym/gym-workouts";
import StreakTracker from "@/components/components/gym/streak-tracker";
import WorkoutHistory from "@/components/components/gym/workout-history";

export default async function GymPage() {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return redirect("/login");
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
        <div className="space-y-6">
          <GymWorkouts />
          <div className="grid gap-4 md:grid-cols-2">
            <StreakTracker />
            <WorkoutHistory />
          </div>
        </div>
      </main>
    </div>
  );
}
