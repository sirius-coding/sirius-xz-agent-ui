import type { AgentAnswer } from '../types/api';
import { StatusPill } from './StatusPill';

type ChatPanelProps = {
  question: string;
  onQuestionChange: (value: string) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  answer: AgentAnswer | null;
  error?: string | null;
  promptHint?: string;
};

export function ChatPanel({ question, onQuestionChange, onSubmit, isSubmitting, answer, error, promptHint }: ChatPanelProps) {
  return (
    <div className="chat-panel">
      <div className="chat-panel__composer">
        <textarea
          rows={4}
          value={question}
          onChange={(event) => onQuestionChange(event.target.value)}
          placeholder="输入问题，例如：这个系统如何做知识库管理？"
        />
        {promptHint ? <p className="chat-panel__hint">{promptHint}</p> : null}
        <div className="editor__actions">
          <button className="button button--primary" type="button" onClick={onSubmit} disabled={isSubmitting}>
            {isSubmitting ? '生成中...' : '发送问题'}
          </button>
        </div>
      </div>

      {error ? <div className="notice notice--error">{error}</div> : null}

      {answer ? (
        <div className="answer-panel">
          <div className="answer-panel__headline">
            <h3>回答</h3>
            <StatusPill tone={answer.confidence >= 70 ? 'success' : answer.confidence >= 40 ? 'warning' : 'danger'}>
              置信度 {answer.confidence}%
            </StatusPill>
          </div>
          <p className="answer-panel__text">{answer.answer}</p>

          <div className="answer-panel__section">
            <h4>来源文档</h4>
            <div className="source-list">
              {answer.sources.length > 0 ? (
                answer.sources.map((source) => (
                  <article key={source.id} className="source-card">
                    <strong>{source.title}</strong>
                    <span>{source.id}</span>
                    <p>{source.content}</p>
                    <div className="tag-row">
                      {source.tags.map((tag) => (
                        <span key={tag} className="tag">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </article>
                ))
              ) : (
                <p className="empty-state">当前没有可展示的来源文档。</p>
              )}
            </div>
          </div>

          <div className="answer-panel__section">
            <h4>命中词</h4>
            {answer.matchedTokens.length > 0 ? (
              <div className="tag-row">
                {answer.matchedTokens.map((token) => (
                  <span key={token} className="tag tag--accent">
                    {token}
                  </span>
                ))}
              </div>
            ) : (
              <p className="empty-state">未命中明显关键词。</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
