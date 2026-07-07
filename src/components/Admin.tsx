import React, { useState, useEffect } from 'react';
import { Project, PortfolioContent, SkillCategory, ContactMessage } from '../types';
import { 
  getProjects, 
  saveProject, 
  deleteProject, 
  verifyPasscode, 
  updatePasscode,
  getPortfolioContent,
  savePortfolioContent,
  getContacts,
  deleteContact
} from '../lib/firebase';
import { 
  Plus, Trash2, Edit3, Save, X, Key, ExternalLink, HelpCircle,
  Video, ListOrdered, Eye, CheckCircle, AlertCircle, User, Award, Inbox
} from 'lucide-react';

interface AdminProps {
  onBackToPortfolio: () => void;
  onRefreshPortfolio: () => void;
}

export default function Admin({ onBackToPortfolio, onRefreshPortfolio }: AdminProps) {
  const [passcode, setPasscode] = useState('');
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  const [activeTab, setActiveTab] = useState<'projects'|'about'|'skills'|'contact'|'inbox'|'settings'>('projects');

  const [projects, setProjects] = useState<Project[]>([]);
  const [content, setContent] = useState<Omit<PortfolioContent, 'projects'> | null>(null);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Projects Form State
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  
  const [newPasscode, setNewPasscode] = useState('');
  const [isChangingPasscode, setIsChangingPasscode] = useState(false);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !content) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 800;
        const MAX_HEIGHT = 800;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);
        
        // compress to jpeg
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        setContent({...content, about: {...content.about, imageUrl: dataUrl}});
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [projData, contData, msgData] = await Promise.all([
        getProjects(),
        getPortfolioContent(),
        getContacts()
      ]);
      setProjects(projData);
      setContent(contData);
      setMessages(msgData);
    } catch (err) {
      console.error(err);
      setErrorMsg('Lỗi tải dữ liệu!');
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    try {
      const authorized = await verifyPasscode(passcode);
      if (authorized) {
        setIsAuthorized(true);
        loadAdminData();
      } else {
        setErrorMsg('Mật mã truy cập không chính xác.');
      }
    } catch (err) {
      setErrorMsg('Lỗi kết nối cơ sở dữ liệu!');
    }
  };

  const handlePasscodeChangeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    if (!newPasscode || newPasscode.length < 4) {
      setErrorMsg('Mật mã mới phải có ít nhất 4 ký tự!');
      return;
    }
    try {
      await updatePasscode(newPasscode);
      setSuccessMsg('Đã thay đổi mật mã thành công!');
      setNewPasscode('');
      setIsChangingPasscode(false);
    } catch (err) {
      setErrorMsg('Không thể đổi mật mã!');
    }
  };

  // --- Projects Management ---
  const handleInitNewProject = () => {
    const nextOrder = projects.length > 0 ? Math.max(...projects.map(p => p.order)) + 1 : 1;
    setEditingProject({
      id: `project-${Date.now()}`,
      category: 'social',
      title: 'Dự án mới',
      year: new Date().getFullYear().toString(),
      platform: 'YouTube',
      roles: ['Editor'],
      description: '',
      embedUrl: '',
      link: '',
      ratio: '16-9',
      order: nextOrder
    });
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleStartEdit = (proj: Project) => {
    setEditingProject({ ...proj });
    setSuccessMsg('');
    setErrorMsg('');
  };

  const handleSaveProjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProject) return;
    setErrorMsg(''); setSuccessMsg(''); setLoading(true);
    try {
      const cleanedProj: Project = {
        ...editingProject,
        id: editingProject.id.trim().toLowerCase().replace(/\s+/g, '-'),
        roles: Array.isArray(editingProject.roles) 
          ? editingProject.roles 
          : typeof editingProject.roles === 'string'
            ? (editingProject.roles as string).split(',').map(r => r.trim()).filter(Boolean)
            : ['Editor']
      };
      await saveProject(cleanedProj);
      setSuccessMsg('Lưu dự án thành công!');
      setEditingProject(null);
      await loadAdminData();
      onRefreshPortfolio();
    } catch (err) {
      setErrorMsg('Không thể lưu dự án!');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!window.confirm(`Xóa "${title}"?`)) return;
    setLoading(true);
    try {
      await deleteProject(id);
      setSuccessMsg('Đã xóa thành công!');
      if (editingProject?.id === id) setEditingProject(null);
      await loadAdminData();
      onRefreshPortfolio();
    } catch (err) {
      setErrorMsg('Lỗi xóa video!');
    } finally {
      setLoading(false);
    }
  };

  // --- Content Management (About & Skills) ---
  const handleSaveContent = async () => {
    if (!content) return;
    setLoading(true); setErrorMsg(''); setSuccessMsg('');
    try {
      await savePortfolioContent(content);
      setSuccessMsg('Đã lưu nội dung thành công!');
      onRefreshPortfolio();
    } catch (err) {
      setErrorMsg('Lỗi lưu nội dung!');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteMessage = async (id: string) => {
    if (!window.confirm('Xóa tin nhắn này vĩnh viễn?')) return;
    setLoading(true);
    try {
      await deleteContact(id);
      setSuccessMsg('Đã xóa tin nhắn!');
      await loadAdminData();
    } catch (err) {
      setErrorMsg('Lỗi xóa tin nhắn!');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-[var(--bg)] flex items-center justify-center px-4 relative">
        <button onClick={onBackToPortfolio} className="absolute top-6 left-6 text-xs font-mono text-[var(--text-secondary)] border border-[var(--border)] px-3 py-1.5 rounded-[var(--radius)] bg-[var(--bg-secondary)] cursor-pointer">
          ← Quay lại
        </button>
        <div className="max-w-md w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-8 shadow-2xl">
          <div className="text-center mb-8">
            <Key className="w-8 h-8 text-[var(--accent)] mx-auto mb-4" />
            <h1 className="font-heading text-2xl font-extrabold uppercase">Admin</h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-4">
            <input 
              type="password" value={passcode} onChange={(e) => setPasscode(e.target.value)}
              placeholder="Nhập mã pin..."
              className="w-full bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg py-3 px-4 font-mono text-center outline-none focus:border-[var(--accent)] text-[var(--text)]"
            />
            {errorMsg && <div className="text-red-400 text-xs text-center">{errorMsg}</div>}
            <button type="submit" className="w-full py-3 bg-[var(--accent)] hover:bg-[var(--accent2)] text-white font-bold rounded-lg cursor-pointer transition-all">Xác thực</button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--text)] py-20 px-4 md:px-10">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-8 border-b border-[var(--border)] pb-6">
          <div>
            <h1 className="font-heading text-3xl font-extrabold uppercase">Quản trị nội dung</h1>
            <p className="text-sm text-[var(--text-secondary)]">Lưu trực tiếp vào Cloud Firestore.</p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setIsChangingPasscode(!isChangingPasscode)} className="px-4 py-2 border border-[var(--border)] rounded-lg text-sm cursor-pointer hover:bg-[var(--bg-card)] transition-colors text-[var(--text)]">Đổi mã pin</button>
            <button onClick={onBackToPortfolio} className="px-4 py-2 bg-[var(--accent)] text-white font-bold rounded-lg cursor-pointer hover:bg-opacity-90 transition-all shadow-md">← Xem Portfolio</button>
          </div>
        </div>

        {/* Change Passcode */}
        {isChangingPasscode && (
          <form onSubmit={handlePasscodeChangeSubmit} className="mb-8 p-4 border border-[var(--border)] rounded-lg max-w-sm bg-[var(--bg-card)]">
            <input type="password" value={newPasscode} onChange={e => setNewPasscode(e.target.value)} placeholder="Mã pin mới (ít nhất 4 ký tự)..." className="w-full p-2 mb-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded text-[var(--text)] text-sm" />
            <button type="submit" className="px-4 py-2 bg-[var(--accent)] text-white rounded cursor-pointer text-sm font-bold w-full">Cập nhật mã</button>
          </form>
        )}

        {/* Notifications */}
        {successMsg && <div className="mb-6 p-4 bg-emerald-900/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-sm flex items-center gap-2"><CheckCircle className="w-5 h-5"/> {successMsg}</div>}
        {errorMsg && <div className="mb-6 p-4 bg-red-900/30 text-red-300 border border-red-500/30 rounded-lg text-sm flex items-center gap-2"><AlertCircle className="w-5 h-5"/> {errorMsg}</div>}

        {/* Tabs */}
        <div className="flex gap-4 mb-8 border-b border-[var(--border)] overflow-x-auto">
          <button onClick={() => setActiveTab('projects')} className={`pb-3 font-bold uppercase tracking-wider text-sm border-b-2 whitespace-nowrap transition-colors cursor-pointer ${activeTab==='projects' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]'}`}>Dự án (Video)</button>
          <button onClick={() => setActiveTab('about')} className={`pb-3 font-bold uppercase tracking-wider text-sm border-b-2 whitespace-nowrap transition-colors cursor-pointer ${activeTab==='about' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]'}`}>Giới thiệu</button>
          <button onClick={() => setActiveTab('skills')} className={`pb-3 font-bold uppercase tracking-wider text-sm border-b-2 whitespace-nowrap transition-colors cursor-pointer ${activeTab==='skills' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]'}`}>Kỹ năng</button>
          <button onClick={() => setActiveTab('contact')} className={`pb-3 font-bold uppercase tracking-wider text-sm border-b-2 whitespace-nowrap transition-colors cursor-pointer ${activeTab==='contact' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]'}`}>Liên hệ</button>
          <button onClick={() => setActiveTab('inbox')} className={`pb-3 font-bold uppercase tracking-wider text-sm border-b-2 whitespace-nowrap transition-colors cursor-pointer flex items-center gap-2 ${activeTab==='inbox' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]'}`}>
            Hộp thư {messages.length > 0 && <span className="bg-[var(--accent)] text-white text-[10px] px-1.5 py-0.5 rounded-full">{messages.length}</span>}
          </button>
          <button onClick={() => setActiveTab('settings')} className={`pb-3 font-bold uppercase tracking-wider text-sm border-b-2 whitespace-nowrap transition-colors cursor-pointer ${activeTab==='settings' ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent text-[var(--text-secondary)] hover:text-[var(--text)]'}`}>Cài đặt</button>
        </div>

        {loading && <div className="text-center py-10"><span className="animate-pulse text-[var(--accent)]">Đang tải...</span></div>}

        {/* PROJECTS TAB */}
        {activeTab === 'projects' && !loading && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-5 order-2 lg:order-1">
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6 md:p-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-heading font-bold text-lg uppercase">{editingProject ? 'Sửa Video' : 'Thêm Video Mới'}</h2>
                  {editingProject && <button onClick={()=>setEditingProject(null)} className="text-xs text-[var(--text-secondary)] hover:text-white cursor-pointer flex items-center gap-1"><X className="w-4 h-4"/> Hủy sửa</button>}
                </div>
                {editingProject ? (
                  <form onSubmit={handleSaveProjectSubmit} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">Tiêu đề</label>
                      <input type="text" value={editingProject.title} onChange={e=>setEditingProject({...editingProject, title: e.target.value})} className="w-full mt-1 p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text)] outline-none focus:border-[var(--accent)]" required />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">Chuyên mục</label>
                        <select value={editingProject.category} onChange={e=>setEditingProject({...editingProject, category: e.target.value as any})} className="w-full mt-1 p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text)] outline-none focus:border-[var(--accent)]">
                          <option value="showreel">01 — Showreel</option>
                          <option value="social">02 — Social/Short</option>
                          <option value="podcast">03 — Podcast</option>
                          <option value="personal">04 — Personal</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">Năm</label>
                        <input type="text" value={editingProject.year} onChange={e=>setEditingProject({...editingProject, year: e.target.value})} className="w-full mt-1 p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text)] outline-none focus:border-[var(--accent)]" />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">Link (YouTube/Vimeo/TikTok)</label>
                      <input type="url" value={editingProject.link} onChange={e=>setEditingProject({...editingProject, link: e.target.value, embedUrl: e.target.value})} placeholder="https://..." className="w-full mt-1 p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text)] outline-none focus:border-[var(--accent)]" required />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">Vai trò (Phân cách bởi dấu phẩy)</label>
                      <input type="text" value={typeof editingProject.roles === 'string' ? editingProject.roles : editingProject.roles.join(', ')} onChange={e=>setEditingProject({...editingProject, roles: e.target.value as any})} placeholder="vd: Editor, Colorist" className="w-full mt-1 p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text)] outline-none focus:border-[var(--accent)]" />
                    </div>
                    <div>
                      <label className="text-[10px] font-mono text-[var(--text-secondary)] uppercase">Mô tả dự án</label>
                      <textarea value={editingProject.description} onChange={e=>setEditingProject({...editingProject, description: e.target.value})} className="w-full mt-1 p-3 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-[var(--text)] h-28 outline-none focus:border-[var(--accent)]" />
                    </div>
                    <button type="submit" className="w-full py-3 bg-[var(--accent)] text-white font-bold rounded-lg cursor-pointer flex justify-center items-center gap-2"><Save className="w-4 h-4"/> Lưu Video</button>
                  </form>
                ) : (
                  <button onClick={handleInitNewProject} className="w-full py-8 border-2 border-dashed border-[var(--border)] text-[var(--text-secondary)] rounded-xl hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors cursor-pointer flex flex-col items-center justify-center gap-2">
                    <Plus className="w-8 h-8"/> 
                    <span className="font-bold">Bấm để thêm video mới</span>
                  </button>
                )}
              </div>
            </div>
            <div className="lg:col-span-7 order-1 lg:order-2">
              <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6 md:p-8">
                <h2 className="font-heading font-bold text-lg uppercase mb-6">Danh sách Video ({projects.length})</h2>
                <div className="space-y-3 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                  {projects.map(p => (
                    <div key={p.id} className="flex items-center justify-between p-4 border border-[var(--border)] rounded-xl bg-[var(--bg-secondary)] hover:border-[var(--accent)]/50 transition-colors group">
                      <div className="truncate pr-4 flex-1">
                        <div className="font-bold text-[var(--text)] group-hover:text-[var(--accent)] transition-colors truncate">{p.title}</div>
                        <div className="text-xs text-[var(--text-secondary)] font-mono mt-1 uppercase">{p.category} • {p.year}</div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button onClick={()=>handleStartEdit(p)} className="w-8 h-8 flex items-center justify-center bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-[var(--accent)] hover:border-[var(--accent)] cursor-pointer transition-all"><Edit3 className="w-4 h-4"/></button>
                        <button onClick={()=>handleDelete(p.id, p.title)} className="w-8 h-8 flex items-center justify-center bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text-secondary)] hover:text-red-400 hover:border-red-400 cursor-pointer transition-all"><Trash2 className="w-4 h-4"/></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {activeTab === 'about' && !loading && content && (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6 lg:p-10 shadow-xl max-w-4xl mx-auto">
            <h2 className="font-heading font-extrabold text-2xl mb-8 uppercase text-[var(--text)] flex items-center gap-3">
              <User className="w-6 h-6 text-[var(--accent)]" /> Thẻ điều khiển: Phần Giới Thiệu
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-mono mb-2 text-[var(--text-secondary)] uppercase">Câu Chào (Greeting)</label>
                <input type="text" value={content.about.greeting} onChange={e => setContent({...content, about: {...content.about, greeting: e.target.value}})} className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text)] outline-none focus:border-[var(--accent)]" placeholder="vd: Hello! 👋" />
              </div>
              <div>
                <label className="block text-xs font-mono mb-2 text-[var(--text-secondary)] uppercase">Đoạn văn giới thiệu (Cách nhau bởi 2 lần xuống dòng)</label>
                <textarea rows={8} value={content.about.bioParagraphs.join('\n\n')} onChange={e => setContent({...content, about: {...content.about, bioParagraphs: e.target.value.split('\n\n').filter(p=>p.trim())}})} className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text)] outline-none focus:border-[var(--accent)] leading-relaxed" placeholder="Đoạn 1...&#10;&#10;Đoạn 2..." />
              </div>
              <div>
                <label className="block text-xs font-mono mb-2 text-[var(--text-secondary)] uppercase">Câu kết (Closing)</label>
                <input type="text" value={content.about.closingMessage} onChange={e => setContent({...content, about: {...content.about, closingMessage: e.target.value}})} className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text)] outline-none focus:border-[var(--accent)]" placeholder="vd: Hy vọng bạn sẽ thích portfolio của tôi!" />
              </div>
              <div>
                <label className="block text-xs font-mono mb-2 text-[var(--text-secondary)] uppercase">Ảnh chân dung</label>
                <div className="flex items-center gap-4">
                  {content.about.imageUrl && (
                    <img src={content.about.imageUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border-2 border-[var(--border)]" />
                  )}
                  <input type="file" accept="image/*" onChange={handleImageUpload} className="text-sm text-[var(--text-secondary)] file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-[var(--accent)] file:text-white hover:file:bg-[var(--accent2)] cursor-pointer" />
                </div>
              </div>
              <div className="pt-6 border-t border-[var(--border)]">
                <button onClick={handleSaveContent} className="px-8 py-3 bg-[var(--accent)] text-white font-bold rounded-xl cursor-pointer flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-md"><Save className="w-5 h-5"/> Lưu Cập Nhật Giới Thiệu</button>
              </div>
            </div>
          </div>
        )}

        {/* SKILLS TAB */}
        {activeTab === 'skills' && !loading && content && (
          <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6 lg:p-10 shadow-xl">
              <h2 className="font-heading font-extrabold text-xl mb-6 uppercase text-[var(--text)] flex items-center gap-3">
                <Award className="w-5 h-5 text-[var(--accent2)]" /> Thẻ điều khiển: Kỹ năng tổng quan (Tags)
              </h2>
              <p className="text-sm text-[var(--text-secondary)] mb-4 font-body">Nhập các kỹ năng hiển thị ở phần "Có thể giúp bạn với", cách nhau bởi dấu phẩy.</p>
              <textarea rows={3} value={content.skillTags.join(', ')} onChange={e => setContent({...content, skillTags: e.target.value.split(',').map(s=>s.trim()).filter(Boolean)})} placeholder="vd: Video Editing, Color Grading, Sound Design..." className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text)] mb-6 outline-none focus:border-[var(--accent)]" />
              <button onClick={handleSaveContent} className="px-6 py-3 bg-[var(--bg)] border border-[var(--border)] hover:border-[var(--accent2)] hover:text-[var(--accent2)] font-bold rounded-xl cursor-pointer flex items-center gap-2 transition-all"><Save className="w-4 h-4"/> Lưu Tags Kỹ Năng</button>
            </div>
            
            <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6 lg:p-10 shadow-xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-heading font-extrabold text-xl uppercase text-[var(--text)] flex items-center gap-3">
                  <ListOrdered className="w-5 h-5 text-[var(--accent)]" /> Các nhóm kỹ năng chi tiết
                </h2>
                <button onClick={() => setContent({...content, skillCategories: [...content.skillCategories, { title: 'NHÓM MỚI', items: [] }]})} className="text-xs px-3 py-1.5 bg-[var(--accent)]/10 text-[var(--accent)] border border-[var(--accent)]/30 rounded-lg font-bold cursor-pointer hover:bg-[var(--accent)] hover:text-white transition-colors flex items-center gap-1"><Plus className="w-3 h-3"/> Thêm nhóm</button>
              </div>
              <div className="space-y-6">
                {content.skillCategories.map((cat, i) => (
                  <div key={i} className="p-6 border border-[var(--border)] rounded-xl bg-[var(--bg-secondary)] relative group">
                    <button onClick={() => {
                      if(!window.confirm('Xóa nhóm này?')) return;
                      const newCats = [...content.skillCategories];
                      newCats.splice(i, 1);
                      setContent({...content, skillCategories: newCats});
                    }} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-[var(--bg)] rounded text-[var(--text-secondary)] hover:text-red-400 hover:border-red-400 border border-[var(--border)] cursor-pointer transition-colors"><Trash2 className="w-4 h-4"/></button>
                    
                    <div className="mb-4 pr-12">
                      <label className="block text-[10px] font-mono mb-2 text-[var(--text-secondary)] uppercase">Tên nhóm</label>
                      <input type="text" value={cat.title} onChange={e => {
                        const newCats = [...content.skillCategories];
                        newCats[i].title = e.target.value;
                        setContent({...content, skillCategories: newCats});
                      }} className="w-full p-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] font-bold uppercase tracking-wide outline-none focus:border-[var(--accent)]" />
                    </div>
                    <div>
                      <label className="block text-[10px] font-mono mb-2 text-[var(--text-secondary)] uppercase">Các mục (Cách nhau bởi dấu phẩy)</label>
                      <textarea rows={2} value={cat.items.join(', ')} onChange={e => {
                        const newCats = [...content.skillCategories];
                        newCats[i].items = e.target.value.split(',').map(s=>s.trim()).filter(Boolean);
                        setContent({...content, skillCategories: newCats});
                      }} className="w-full p-3 bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] outline-none focus:border-[var(--accent)]" placeholder="vd: Dựng phim, Chỉnh màu..." />
                    </div>
                  </div>
                ))}
              </div>
              <div className="pt-8 mt-8 border-t border-[var(--border)]">
                <button onClick={handleSaveContent} className="px-8 py-3 bg-[var(--accent)] text-white font-bold rounded-xl cursor-pointer flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-md"><Save className="w-5 h-5"/> Lưu Tất Cả Kỹ Năng</button>
              </div>
            </div>
          </div>
        )}
        {/* CONTACT TAB */}
        {activeTab === 'contact' && !loading && content && content.contactInfo && (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6 lg:p-10 shadow-xl max-w-4xl mx-auto">
            <h2 className="font-heading font-extrabold text-2xl mb-8 uppercase text-[var(--text)] flex items-center gap-3">
              <User className="w-6 h-6 text-[var(--accent)]" /> Thẻ điều khiển: Liên hệ & Footer
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-mono mb-2 text-[var(--text-secondary)] uppercase">Email liên hệ</label>
                <input type="email" value={content.contactInfo.email} onChange={e => setContent({...content, contactInfo: {...content.contactInfo!, email: e.target.value}})} className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text)] outline-none focus:border-[var(--accent)]" placeholder="vd: nguyennhuy.nlt@gmail.com" />
              </div>
              <div>
                <label className="block text-xs font-mono mb-2 text-[var(--text-secondary)] uppercase">Tài khoản TikTok</label>
                <input type="text" value={content.contactInfo.tiktok} onChange={e => setContent({...content, contactInfo: {...content.contactInfo!, tiktok: e.target.value}})} className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text)] outline-none focus:border-[var(--accent)]" placeholder="vd: @nhuy_work" />
              </div>
              <div>
                <label className="block text-xs font-mono mb-2 text-[var(--text-secondary)] uppercase">Vị trí địa lý</label>
                <input type="text" value={content.contactInfo.location} onChange={e => setContent({...content, contactInfo: {...content.contactInfo!, location: e.target.value}})} className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text)] outline-none focus:border-[var(--accent)]" placeholder="vd: Đà Nẵng, Việt Nam" />
              </div>
              <div>
                <label className="block text-xs font-mono mb-2 text-[var(--text-secondary)] uppercase">Dòng chữ Footer (Copyright)</label>
                <input type="text" value={content.contactInfo.footerText} onChange={e => setContent({...content, contactInfo: {...content.contactInfo!, footerText: e.target.value}})} className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text)] outline-none focus:border-[var(--accent)]" placeholder="vd: © 2024 Nhu Y Nguyen" />
              </div>
              <div className="pt-6 border-t border-[var(--border)]">
                <button onClick={handleSaveContent} className="px-8 py-3 bg-[var(--accent)] text-white font-bold rounded-xl cursor-pointer flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-md"><Save className="w-5 h-5"/> Lưu Thông Tin Liên Hệ</button>
              </div>
            </div>
          </div>
        )}

        {/* INBOX TAB */}
        {activeTab === 'inbox' && !loading && (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6 lg:p-10 shadow-xl max-w-4xl mx-auto">
            <div className="flex justify-between items-center mb-8">
              <h2 className="font-heading font-extrabold text-2xl uppercase text-[var(--text)] flex items-center gap-3">
                <Inbox className="w-6 h-6 text-[var(--accent)]" /> Hộp Thư Khách Hàng
              </h2>
              <button onClick={loadAdminData} className="text-xs text-[var(--accent)] hover:underline">Làm mới</button>
            </div>
            
            {messages.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-[var(--border)] rounded-xl text-[var(--text-secondary)]">
                Chưa có tin nhắn nào từ khách hàng.
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map(msg => (
                  <div key={msg.id} className="p-6 border border-[var(--border)] rounded-xl bg-[var(--bg-secondary)] relative group">
                    <button 
                      onClick={() => handleDeleteMessage(msg.id)}
                      className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center bg-[var(--bg)] rounded text-[var(--text-secondary)] hover:text-red-400 hover:border-red-400 border border-[var(--border)] cursor-pointer transition-colors"
                      title="Xóa tin nhắn"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <div className="flex justify-between items-start mb-4 pr-10">
                      <div>
                        <h3 className="font-bold text-[var(--text)] text-lg">{msg.name}</h3>
                        <a href={`mailto:${msg.email}`} className="text-sm text-[var(--accent)] hover:underline">{msg.email}</a>
                      </div>
                      <span className="text-xs font-mono text-[var(--text-secondary)] bg-[var(--bg)] px-2 py-1 rounded">
                        {new Date(msg.createdAt).toLocaleString('vi-VN')}
                      </span>
                    </div>
                    <div className="bg-[var(--bg)] p-4 rounded-lg text-sm leading-relaxed border border-[var(--border)] whitespace-pre-line text-[var(--text-secondary)]">
                      {msg.message}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* SETTINGS TAB */}
        {activeTab === 'settings' && !loading && content && content.globalSettings && (
          <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-[var(--radius)] p-6 lg:p-10 shadow-xl max-w-4xl mx-auto">
            <h2 className="font-heading font-extrabold text-2xl mb-8 uppercase text-[var(--text)] flex items-center gap-3">
              <User className="w-6 h-6 text-[var(--accent)]" /> Cài Đặt Chung
            </h2>
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-mono mb-2 text-[var(--text-secondary)] uppercase">Font chữ tiêu đề (Heading Font)</label>
                <input type="text" value={content.globalSettings.headingFont} onChange={e => setContent({...content, globalSettings: {...content.globalSettings!, headingFont: e.target.value}})} className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text)] outline-none focus:border-[var(--accent)]" placeholder="vd: 'Space Grotesk', sans-serif" />
                <p className="text-xs text-[var(--text-secondary)] mt-2">Chỉ sử dụng font có sẵn từ Google Fonts (vd: 'Space Grotesk', 'Playfair Display', 'Outfit').</p>
              </div>
              <div>
                <label className="block text-xs font-mono mb-2 text-[var(--text-secondary)] uppercase">Font chữ nội dung (Body Font)</label>
                <input type="text" value={content.globalSettings.bodyFont} onChange={e => setContent({...content, globalSettings: {...content.globalSettings!, bodyFont: e.target.value}})} className="w-full p-4 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-xl text-[var(--text)] outline-none focus:border-[var(--accent)]" placeholder="vd: 'Inter', sans-serif" />
              </div>
              <div className="pt-6 border-t border-[var(--border)]">
                <button onClick={handleSaveContent} className="px-8 py-3 bg-[var(--accent)] text-white font-bold rounded-xl cursor-pointer flex items-center gap-2 hover:bg-opacity-90 transition-all shadow-md"><Save className="w-5 h-5"/> Lưu Cài Đặt</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
