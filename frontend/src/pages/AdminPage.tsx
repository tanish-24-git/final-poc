import { ContentList } from '../components/admin/ContentList';

export function AdminPage() {
  return (
    <div>
      <h1 style={{ marginBottom: '20px' }}>Admin Dashboard</h1>
      <ContentList />
    </div>
  );
}
