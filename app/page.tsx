import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Header from "@/components/components/layout/header";
import HeroSection from "@/components/components/dashboard/hero-section";
import DailyTasks from "@/components/components/dashboard/daily-tasks";
import DailyAchievements from "@/components/components/dashboard/daily-achievements";
import LogList from "@/components/components/dashboard/log-list";
import WeeklyThreadTracker from "@/components/components/dashboard/weekly-thread-tracker";
import PomodoroTimer from "@/components/components/dashboard/pomodoro-timer";
import MonthlyGoals from "@/components/components/dashboard/monthly-goals";
import Analytics from "@/components/components/dashboard/analytics";
import StreakCalendar from "@/components/components/dashboard/streak-calendar";
import ThoughtLogsFAB from "@/components/components/thought-logs/thought-logs-fab";

export default async function Home() {
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
        <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
          <HeroSection />
          <DailyTasks />
          <DailyAchievements />
          <StreakCalendar />
          <LogList
            title="Airdrop Logs"
            description="Track your airdrop activities."
            tableName="airdrop_logs"
          />
          <WeeklyThreadTracker />
          <PomodoroTimer />
        </div>
        <MonthlyGoals />
        <Analytics />
      </main>
      <ThoughtLogsFAB />
    </div>
  );
}
