import { SectionCard } from '../components/SectionCard';
import { DocumentEditor } from '../components/DocumentEditor';
import { DocumentList } from '../components/DocumentList';
import type { DocumentInput, KnowledgeDocument } from '../types/api';

type KnowledgePageProps = {
  documents: KnowledgeDocument[];
  selectedDocumentId: string;
  editorValue: DocumentInput;
  onSelect: (document: KnowledgeDocument) => void;
  onChange: (next: DocumentInput) => void;
  onSave: () => void;
  isSaving: boolean;
};

export function KnowledgePage({
  documents,
  selectedDocumentId,
  editorValue,
  onSelect,
  onChange,
  onSave,
  isSaving
}: KnowledgePageProps) {
  return (
    <div className="knowledge-layout">
      <SectionCard title="Document List" description="选择一个文档查看并编辑。">
        {documents.length > 0 ? (
          <DocumentList documents={documents} selectedId={selectedDocumentId} onSelect={onSelect} />
        ) : (
          <div className="empty-state">No knowledge documents found.</div>
        )}
      </SectionCard>

      <SectionCard title="Document Editor" description="用于创建或更新知识文档。">
        <DocumentEditor value={editorValue} onChange={onChange} onSave={onSave} isSaving={isSaving} />
      </SectionCard>
    </div>
  );
}
