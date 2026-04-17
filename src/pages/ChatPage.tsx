import { SectionCard } from '../components/SectionCard';
import { ChatPanel } from '../components/ChatPanel';
import type { AgentAnswer } from '../types/api';

type ChatPageProps = {
  question: string;
  onQuestionChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  answer: AgentAnswer | null;
  error?: string | null;
};

export function ChatPage({ question, onQuestionChange, onSubmit, isSubmitting, answer, error }: ChatPageProps) {
  return (
    <SectionCard title="Ask the Agent" description="输入问题后查看结构化回答、来源和命中词。">
      <ChatPanel
        question={question}
        onQuestionChange={onQuestionChange}
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        answer={answer}
        error={error}
        promptHint="优先问与系统设计、知识库内容、接口行为相关的问题，便于验证当前后端能力。"
      />
    </SectionCard>
  );
}
