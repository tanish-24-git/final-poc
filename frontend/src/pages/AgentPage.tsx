import { ChatInterface } from '../components/agent/ChatInterface';
import { DocumentUpload } from '../components/agent/DocumentUpload';

export function AgentPage() {
  return (
    <div>
      <ChatInterface />
      <div style={{ marginTop: '20px' }}>
        <DocumentUpload />
      </div>
    </div>
  );
}
