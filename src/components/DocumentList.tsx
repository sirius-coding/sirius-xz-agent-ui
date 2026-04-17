import type { KnowledgeDocument } from '../types/api';

type DocumentListProps = {
  documents: KnowledgeDocument[];
  selectedId: string;
  onSelect: (document: KnowledgeDocument) => void;
};

export function DocumentList({ documents, selectedId, onSelect }: DocumentListProps) {
  return (
    <div className="document-list">
      {documents.map((document) => (
        <button
          key={document.id}
          type="button"
          className={`document-list__item ${selectedId === document.id ? 'document-list__item--active' : ''}`}
          onClick={() => onSelect(document)}
        >
          <div className="document-list__title-row">
            <strong>{document.title}</strong>
            <span className="document-list__id">{document.id}</span>
          </div>
          <p>{document.content}</p>
          <div className="tag-row">
            {document.tags.map((tag) => (
              <span key={tag} className="tag">
                {tag}
              </span>
            ))}
          </div>
        </button>
      ))}
    </div>
  );
}
