import { Link } from 'react-router-dom';
import { Cog, FileText } from 'lucide-react';

const AdminSidebar = () => {
  return (
    <div className="w-64 bg-white shadow-lg min-h-screen">
      <div className="p-4">
        <h2 className="text-xl font-bold text-gray-800 mb-4">管理メニュー</h2>
        <nav className="space-y-2">
          <Link
            to="/admin"
            className="flex items-center space-x-2 text-gray-700 hover:bg-gray-100 rounded p-2"
          >
            <FileText className="w-5 h-5" />
            <span>PDF一覧</span>
          </Link>
          <div className="py-2">
            <div className="flex items-center space-x-2 text-gray-500 px-2 mb-2">
              <Cog className="w-5 h-5" />
              <span>設定</span>
            </div>
            <div className="pl-7 space-y-2">
              <Link
                to="/admin/settings/models"
                className="block text-gray-700 hover:bg-gray-100 rounded p-2"
              >
                モデル設定
              </Link>
              <Link
                to="/admin/settings/dictionary"
                className="block text-gray-700 hover:bg-gray-100 rounded p-2"
              >
                辞書設定
              </Link>
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
};

export default AdminSidebar; 