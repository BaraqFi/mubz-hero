import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MonthlyGoal } from '@/lib/data-service';
import TargetList from './target-list';

interface GoalCardProps {
  goal: MonthlyGoal;
}

export default function GoalCard({ goal }: GoalCardProps) {
  return (
    <Accordion type="single" collapsible>
      <AccordionItem value={goal.id}>
        <AccordionTrigger>{goal.goal}</AccordionTrigger>
        <AccordionContent>
          <TargetList goalId={goal.id} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
