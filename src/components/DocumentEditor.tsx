import type { DocumentInput } from '../types/api';

type DocumentEditorProps = {
  value: DocumentInput;
  onChange: (next: DocumentInput) => void;
  onSave: () => void;
  isSaving: boolean;
};

export function DocumentEditor({ value, onChange, onSave, isSaving }: DocumentEditorProps) {
  return (
    <div className="editor">
      <div className="editor__grid">
        <label className="field">
          <span>文档 ID</span>
          <input
            value={value.id}
            onChange={(event) => onChange({ ...value, id: event.target.value })}
            placeholder="knowledge-flow"
          />
        </label>
        <label className="field">
          <span>标题</span>
          <input
            value={value.title}
            onChange={(event) => onChange({ ...value, title: event.target.value })}
            placeholder="Knowledge Flow"
          />
        </label>
        <label className="field field--full">
          <span>标签，使用逗号分隔</span>
          <input
            value={value.tags.join(', ')}
            onChange={(event) =>
              onChange({
                ...value,
                tags: event.target.value
                  .split(',')
                  .map((tag) => tag.trim())
                  .filter(Boolean)
              })
            }
            placeholder="rag, knowledge, ui"
          />
        </label>
        <label className="field field--full">
          <span>正文</span>
          <textarea
            rows={10}
            value={value.content}
            onChange={(event) => onChange({ ...value, content: event.target.value })}
            placeholder="Write knowledge document content..."
          />
        </label>
      </div>
      <div className="editor__actions">
        <button className="button button--primary" type="button" onClick={onSave} disabled={isSaving}>
          {isSaving ? '保存中...' : '保存文档'}
        </button>
      </div>
    </div>
  );
}
