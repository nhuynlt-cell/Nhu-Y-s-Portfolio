import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  getDocs, 
  getDoc,
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc,
  writeBatch,
  query,
  orderBy
} from 'firebase/firestore';
import { Project, PortfolioContent, ContactMessage } from '../types';

// Read config from injected values or fallback to json
const firebaseConfig = {
  apiKey: "AIzaSyBOv8EcmF8mcOv8DjI98KlGvoUc2bbettg",
  authDomain: "sodium-sublime-7wrl4.firebaseapp.com",
  projectId: "sodium-sublime-7wrl4",
  storageBucket: "sodium-sublime-7wrl4.firebasestorage.app",
  messagingSenderId: "691858397543",
  appId: "1:691858397543:web:0b8f5a618894340bc5f7c2"
};

const app = initializeApp(firebaseConfig);
// Use the specific firestoreDatabaseId from config
export const db = getFirestore(app, "ai-studio-videoeditorportf-4cb9ae5e-d0f5-4f71-9641-258ef0ddc474");

// Initial data to populate when Firestore is empty
const defaultProjects: Project[] = [
  {
    id: 'showreel-2026',
    category: 'showreel',
    title: 'Bản Thân',
    year: '2026',
    platform: 'YouTube',
    roles: ['Editor', 'Colorist', 'Sound Design'],
    description: 'Tháng 12 năm ấy, giữa một chuyến đi xa, tôi chợt nhận ra mình không còn là cô gái 17 tuổi của những năm trước nữa. Tuổi 20 đã lặng lẽ tìm đến, mang theo bao điều chưa kịp gọi tên — một chút chững chạc, một chút hoang mang, và cả những niềm tin mới mẻ về chính mình. "Bản Thân" là thước phim ghi lại khoảnh khắc chuyển giao ấy: hành trình nhìn lại, chấp nhận và ôm lấy một phiên bản trưởng thành hơn của chính mình.',
    embedUrl: 'https://youtu.be/1LdZ2n_R-L4',
    link: 'https://youtu.be/1LdZ2n_R-L4',
    ratio: '16-9',
    order: 1
  },
  {
    id: 'social-1',
    category: 'social',
    title: 'Reel Quán Cà Phê Đà Nẵng',
    year: '2026',
    platform: 'YouTube Shorts',
    roles: ['Editor', 'Color Grading'],
    description: 'Video ngắn giới thiệu không gian quán cà phê tại Đà Nẵng. Sử dụng nhịp cắt nhanh theo nhạc, color grading ấm áp và typography bắt mắt để tạo sự hấp dẫn trên Instagram.',
    embedUrl: 'https://youtube.com/shorts/ahVH-kY5p1I?feature=share',
    link: 'https://youtube.com/shorts/ahVH-kY5p1I?feature=share',
    ratio: '9-16',
    order: 2
  },
  {
    id: 'social-2',
    category: 'social',
    title: 'Skincare Brand Reel',
    year: '2026',
    platform: 'YouTube Shorts',
    roles: ['Editor', 'Motion Graphics'],
    description: 'Reel quảng cáo cho thương hiệu skincare. Kết hợp motion graphics tinh tế, hiệu ứng chuyển cảnh mượt mà và nhạc nền trendy để tăng engagement.',
    embedUrl: 'https://youtube.com/shorts/o7jBGxjfdpc?feature=share',
    link: 'https://youtube.com/shorts/o7jBGxjfdpc?feature=share',
    ratio: '9-16',
    order: 3
  },
  {
    id: 'social-3',
    category: 'social',
    title: 'Food Short (Cooking)',
    year: '2025',
    platform: 'YouTube Shorts',
    roles: ['Editor', 'Sound Design'],
    description: 'Video nấu ăn ngắn với phong cách ASMR cooking. Chú trọng âm thanh thu trực tiếp, nhịp cắt theo từng bước nấu và color grading ấm để tăng cảm giác ngon miệng.',
    embedUrl: 'https://youtube.com/shorts/NxWB6QumdEg?feature=share',
    link: 'https://youtube.com/shorts/NxWB6QumdEg?feature=share',
    ratio: '9-16',
    order: 4
  },
  {
    id: 'social-4',
    category: 'social',
    title: 'Travel Reel Hội An',
    year: '2025',
    platform: 'YouTube Shorts',
    roles: ['Editor', 'Colorist', 'Sound Design'],
    description: 'Reel du lịch Hội An với hình ảnh đèn lồng, phố cổ và ẩm thực địa phương. Sử dụng cinematic color grading và nhạc nền acoustic để tạo cảm xúc hoài niệm.',
    embedUrl: 'https://youtube.com/shorts/i4LSkvU5TAY',
    link: 'https://youtube.com/shorts/i4LSkvU5TAY',
    ratio: '9-16',
    order: 5
  },
  {
    id: 'social-5',
    category: 'social',
    title: 'Deal with failure',
    year: '2026',
    platform: 'YouTube Shorts',
    roles: ['Editor'],
    description: 'Short video chia sẻ cách đối mặt với thất bại. Sử dụng hiệu ứng text và nhịp điệu nhanh.',
    embedUrl: 'https://youtube.com/shorts/eSo4IGu7A4s?feature=share',
    link: 'https://youtube.com/shorts/eSo4IGu7A4s?feature=share',
    ratio: '9-16',
    order: 5.1
  },
  {
    id: 'social-6',
    category: 'social',
    title: 'Resilient leadership',
    year: '2026',
    platform: 'YouTube Shorts',
    roles: ['Editor'],
    description: 'Nội dung chia sẻ về phong cách lãnh đạo kiên cường.',
    embedUrl: 'https://youtube.com/shorts/ixq2bVZPGTE?feature=share',
    link: 'https://youtube.com/shorts/ixq2bVZPGTE?feature=share',
    ratio: '9-16',
    order: 5.2
  },
  {
    id: 'social-7',
    category: 'social',
    title: 'Recap class',
    year: '2026',
    platform: 'YouTube Shorts',
    roles: ['Editor'],
    description: 'Tổng hợp lại những khoảnh khắc nổi bật trong lớp học.',
    embedUrl: 'https://youtube.com/shorts/vLScZMBVqDE?feature=share',
    link: 'https://youtube.com/shorts/vLScZMBVqDE?feature=share',
    ratio: '9-16',
    order: 5.3
  },
  {
    id: 'social-8',
    category: 'social',
    title: 'Talking head',
    year: '2026',
    platform: 'YouTube Shorts',
    roles: ['Editor'],
    description: 'Video dạng talking head chia sẻ kiến thức trực tiếp.',
    embedUrl: 'https://youtube.com/shorts/fu8vLgs4Xhk?feature=share',
    link: 'https://youtube.com/shorts/fu8vLgs4Xhk?feature=share',
    ratio: '9-16',
    order: 5.4
  },
  {
    id: 'social-9',
    category: 'social',
    title: 'Relax day with us',
    year: '2026',
    platform: 'YouTube Shorts',
    roles: ['Editor'],
    description: 'Vlog thư giãn cuối tuần.',
    embedUrl: 'https://youtube.com/shorts/Jwk28310IB0?feature=share',
    link: 'https://youtube.com/shorts/Jwk28310IB0?feature=share',
    ratio: '9-16',
    order: 5.5
  },
  {
    id: 'social-10',
    category: 'social',
    title: 'Artisan Le Duc Ha',
    year: '2026',
    platform: 'YouTube Shorts',
    roles: ['Editor'],
    description: 'Câu chuyện về nghệ nhân Lê Đức Hạ.',
    embedUrl: 'https://youtube.com/shorts/BUnJqMiVXUA?feature=share',
    link: 'https://youtube.com/shorts/BUnJqMiVXUA?feature=share',
    ratio: '9-16',
    order: 5.6
  },
  {
    id: 'social-11',
    category: 'social',
    title: 'What makes each region of Vietnam unique?',
    year: '2026',
    platform: 'YouTube Shorts',
    roles: ['Editor'],
    description: 'Video du lịch khám phá vẻ đẹp độc đáo của các vùng miền Việt Nam.',
    embedUrl: 'https://youtube.com/shorts/qMEdo2BrtC8',
    link: 'https://youtube.com/shorts/qMEdo2BrtC8',
    ratio: '9-16',
    order: 5.7
  },
  {
    id: 'social-12',
    category: 'social',
    title: 'Mi Quang',
    year: '2026',
    platform: 'YouTube Shorts',
    roles: ['Editor'],
    description: 'Video giới thiệu đặc sản Mì Quảng truyền thống.',
    embedUrl: 'https://youtube.com/shorts/9_fTRHTobXE',
    link: 'https://youtube.com/shorts/9_fTRHTobXE',
    ratio: '9-16',
    order: 5.8
  },
  {
    id: 'podcast-1',
    category: 'podcast',
    title: 'VÔ THẦN - BƯỚC NGOẶT CHẤN ĐỘNG TRONG NIỀM TIN',
    year: '2026',
    platform: 'YouTube',
    roles: ['Editor', 'Sound Design', 'Graphics'],
    description: 'Tập podcast đầu tiên. Xử lý âm thanh đa kênh, thêm lower thirds, chèn B-roll minh họa và tạo intro/outro motion graphics chuyên nghiệp.',
    embedUrl: 'https://youtu.be/WL5OYMaOnt4',
    link: 'https://youtu.be/WL5OYMaOnt4',
    ratio: '16-9',
    order: 6
  },
  {
    id: 'podcast-2',
    category: 'podcast',
    title: 'NGƯỜI THÁNH THIỆN CHƯA CHẮC ĐÃ TỐT? TỈNH THỨC - EP 14',
    year: '2025',
    platform: 'YouTube',
    roles: ['Editor', 'Multi-cam'],
    description: 'Dựng đoạn cắt hay nhất từ talk show. Xử lý multi-cam, chuyển góc mượt mà, thêm subtitle và hiệu ứng zoom để giữ chân người xem trên social media.',
    embedUrl: 'https://youtu.be/BYp3ZW5Ke9M',
    link: 'https://youtu.be/BYp3ZW5Ke9M',
    ratio: '16-9',
    order: 7
  },
  {
    id: 'personal-1',
    category: 'personal',
    title: 'The Fate of Ophelia - Taylor Swift | Vietsub',
    year: '2026',
    platform: 'YouTube',
    roles: ['Translator', 'Subtitle Editor', 'Video Editor'],
    description: 'Sản phẩm vietsub bài hát đầy chất nghệ thuật "The Fate of Ophelia" của Taylor Swift. Tập trung vào biên dịch uyển chuyển, khớp nhịp cảm xúc và căn chỉnh phụ đề tinh tế, giúp người xem trọn vẹn cảm nhận từng câu chữ.',
    embedUrl: 'https://youtu.be/tm1h80zIYk8',
    link: 'https://youtu.be/tm1h80zIYk8',
    ratio: '16-9',
    order: 8
  },
  {
    id: 'personal-2',
    category: 'personal',
    title: 'Thực trạng rác thải | Tiếng Nhật',
    year: '2026',
    platform: 'YouTube',
    roles: ['Video Editor', 'Subtitle Editor', 'Voiceover'],
    description: 'Video thuyết trình chủ đề thực trạng rác thải sinh hoạt và công nghiệp, sử dụng tiếng Nhật cùng hệ thống phụ đề song ngữ rõ ràng. Kết hợp đồ họa thông tin trực quan để làm nổi bật thông điệp môi trường ý nghĩa.',
    embedUrl: 'https://youtu.be/_CAeWrfnW9Q',
    link: 'https://youtu.be/_CAeWrfnW9Q',
    ratio: '16-9',
    order: 9
  },
  {
    id: 'personal-3',
    category: 'personal',
    title: 'Hành trình đập đi xây lại | Storytelling',
    year: '2026',
    platform: 'YouTube',
    roles: ['Storyteller', 'Video Editor', 'Colorist'],
    description: 'Sản phẩm video dạng Storytelling (kể chuyện) chân thực, chia sẻ về hành trình tự đổi mới và kiến tạo lại bản thân từ con số không. Sử dụng nhịp phim sâu lắng, kỹ thuật dựng cinematic kết hợp audio truyền cảm hứng.',
    embedUrl: 'https://youtu.be/KUC2gm9OpDM',
    link: 'https://youtu.be/KUC2gm9OpDM',
    ratio: '16-9',
    order: 10
  },
  {
    id: 'personal-4',
    category: 'personal',
    title: 'Thăm Huế',
    year: '2026',
    platform: 'YouTube',
    roles: ['Video Editor'],
    description: 'Video ngắn ghi lại kỷ niệm chuyến đi thăm Huế mộng mơ.',
    embedUrl: 'https://youtu.be/i9RSBMzakiA',
    link: 'https://youtu.be/i9RSBMzakiA',
    ratio: '16-9',
    order: 11
  },
  {
    id: 'personal-5',
    category: 'personal',
    title: 'Kungfu Panda',
    year: '2026',
    platform: 'YouTube',
    roles: ['Video Editor'],
    description: 'Dựng phim ngắn chủ đề Kungfu Panda.',
    embedUrl: 'https://youtu.be/PBROmXIo2QQ',
    link: 'https://youtu.be/PBROmXIo2QQ',
    ratio: '16-9',
    order: 12
  }
];

// Fetch all projects, optionally populating default ones if Firestore is empty
export async function getProjects(): Promise<Project[]> {
  const colRef = collection(db, 'projects');
  const q = query(colRef, orderBy('order', 'asc'));
  const snapshot = await getDocs(q);
  
  if (snapshot.empty) {
    // Populate default projects
    const batch = writeBatch(db);
    defaultProjects.forEach((proj) => {
      const docRef = doc(db, 'projects', proj.id);
      batch.set(docRef, proj);
    });
    // Set default admin passcode
    const passcodeRef = doc(db, 'config', 'admin');
    batch.set(passcodeRef, { passcode: '123456' }); // Default passcode
    
    await batch.commit();
    return defaultProjects;
  }
  
  const existingIds = new Set<string>();
  const projects: Project[] = [];
  snapshot.forEach((docSnap) => {
    existingIds.add(docSnap.id);
    const data = docSnap.data() as Project;
    if (data.category === 'showreel') {
      let needsUpdate = false;
      const updates: Partial<Project> = {};

      if (!data.embedUrl || data.embedUrl === '') {
        data.embedUrl = 'https://youtu.be/1LdZ2n_R-L4';
        data.link = 'https://youtu.be/1LdZ2n_R-L4';
        updates.embedUrl = 'https://youtu.be/1LdZ2n_R-L4';
        updates.link = 'https://youtu.be/1LdZ2n_R-L4';
        needsUpdate = true;
      }

      if (data.title !== 'Bản Thân') {
        data.title = 'Bản Thân';
        updates.title = 'Bản Thân';
        needsUpdate = true;
      }

      const desc = 'Tháng 12 năm ấy, giữa một chuyến đi xa, tôi chợt nhận ra mình không còn là cô gái 17 tuổi của những năm trước nữa. Tuổi 20 đã lặng lẽ tìm đến, mang theo bao điều chưa kịp gọi tên — một chút chững chạc, một chút hoang mang, và cả những niềm tin mới mẻ về chính mình. "Bản Thân" là thước phim ghi lại khoảnh khắc chuyển giao ấy: hành trình nhìn lại, chấp nhận và ôm lấy một phiên bản trưởng thành hơn của chính mình.';
      if (data.description !== desc) {
        data.description = desc;
        updates.description = desc;
        needsUpdate = true;
      }

      if (data.year !== '2026') {
        data.year = '2026';
        updates.year = '2026';
        needsUpdate = true;
      }

      if (JSON.stringify(data.roles) !== JSON.stringify(['Editor', 'Colorist', 'Sound Design'])) {
        data.roles = ['Editor', 'Colorist', 'Sound Design'];
        updates.roles = ['Editor', 'Colorist', 'Sound Design'];
        needsUpdate = true;
      }

      if (needsUpdate) {
        updateDoc(docSnap.ref, updates as any).catch(console.error);
      }
    }

    if (docSnap.id.startsWith('social-')) {
      let needsUpdate = false;
      const updates: Partial<Project> = {};
      const socialLinks: Record<string, string> = {
        'social-1': 'https://youtube.com/shorts/ahVH-kY5p1I?feature=share',
        'social-2': 'https://youtube.com/shorts/o7jBGxjfdpc?feature=share',
        'social-3': 'https://youtube.com/shorts/NxWB6QumdEg?feature=share',
        'social-4': 'https://youtube.com/shorts/i4LSkvU5TAY',
        'social-5': 'https://youtube.com/shorts/eSo4IGu7A4s?feature=share',
        'social-6': 'https://youtube.com/shorts/ixq2bVZPGTE?feature=share',
        'social-7': 'https://youtube.com/shorts/vLScZMBVqDE?feature=share',
        'social-8': 'https://youtube.com/shorts/fu8vLgs4Xhk?feature=share',
        'social-9': 'https://youtube.com/shorts/Jwk28310IB0?feature=share',
        'social-10': 'https://youtube.com/shorts/BUnJqMiVXUA?feature=share',
        'social-11': 'https://youtube.com/shorts/qMEdo2BrtC8',
        'social-12': 'https://youtube.com/shorts/9_fTRHTobXE'
      };
      
      const link = socialLinks[docSnap.id];
      if (link) {
        if (data.embedUrl !== link) {
          data.embedUrl = link;
          updates.embedUrl = link;
          needsUpdate = true;
        }
        if (data.link !== link) {
          data.link = link;
          updates.link = link;
          needsUpdate = true;
        }
        if (data.platform !== 'YouTube Shorts') {
          data.platform = 'YouTube Shorts';
          updates.platform = 'YouTube Shorts';
          needsUpdate = true;
        }
        if (needsUpdate) {
          updateDoc(docSnap.ref, updates as any).catch(console.error);
        }
      }
    }

    if (docSnap.id === 'podcast-1') {
      let needsUpdate = false;
      const updates: Partial<Project> = {};
      if (data.title !== 'VÔ THẦN - BƯỚC NGOẶT CHẤN ĐỘNG TRONG NIỀM TIN') {
        data.title = 'VÔ THẦN - BƯỚC NGOẶT CHẤN ĐỘNG TRONG NIỀM TIN';
        updates.title = 'VÔ THẦN - BƯỚC NGOẶT CHẤN ĐỘNG TRONG NIỀM TIN';
        needsUpdate = true;
      }
      if (data.embedUrl !== 'https://youtu.be/WL5OYMaOnt4') {
        data.embedUrl = 'https://youtu.be/WL5OYMaOnt4';
        updates.embedUrl = 'https://youtu.be/WL5OYMaOnt4';
        needsUpdate = true;
      }
      if (data.link !== 'https://youtu.be/WL5OYMaOnt4') {
        data.link = 'https://youtu.be/WL5OYMaOnt4';
        updates.link = 'https://youtu.be/WL5OYMaOnt4';
        needsUpdate = true;
      }
      if (needsUpdate) {
        updateDoc(docSnap.ref, updates as any).catch(console.error);
      }
    }

    if (docSnap.id === 'podcast-2') {
      let needsUpdate = false;
      const updates: Partial<Project> = {};
      if (data.title !== 'NGƯỜI THÁNH THIỆN CHƯA CHẮC ĐÃ TỐT? TỈNH THỨC - EP 14') {
        data.title = 'NGƯỜI THÁNH THIỆN CHƯA CHẮC ĐÃ TỐT? TỈNH THỨC - EP 14';
        updates.title = 'NGƯỜI THÁNH THIỆN CHƯA CHẮC ĐÃ TỐT? TỈNH THỨC - EP 14';
        needsUpdate = true;
      }
      if (data.embedUrl !== 'https://youtu.be/BYp3ZW5Ke9M') {
        data.embedUrl = 'https://youtu.be/BYp3ZW5Ke9M';
        updates.embedUrl = 'https://youtu.be/BYp3ZW5Ke9M';
        needsUpdate = true;
      }
      if (data.link !== 'https://youtu.be/BYp3ZW5Ke9M') {
        data.link = 'https://youtu.be/BYp3ZW5Ke9M';
        updates.link = 'https://youtu.be/BYp3ZW5Ke9M';
        needsUpdate = true;
      }
      if (needsUpdate) {
        updateDoc(docSnap.ref, updates as any).catch(console.error);
      }
    }

    if (docSnap.id === 'personal-1') {
      let needsUpdate = false;
      const updates: Partial<Project> = {};
      
      if (data.title !== 'The Fate of Ophelia - Taylor Swift | Vietsub') {
        data.title = 'The Fate of Ophelia - Taylor Swift | Vietsub';
        updates.title = 'The Fate of Ophelia - Taylor Swift | Vietsub';
        needsUpdate = true;
      }
      if (data.embedUrl !== 'https://youtu.be/tm1h80zIYk8') {
        data.embedUrl = 'https://youtu.be/tm1h80zIYk8';
        updates.embedUrl = 'https://youtu.be/tm1h80zIYk8';
        needsUpdate = true;
      }
      if (data.link !== 'https://youtu.be/tm1h80zIYk8') {
        data.link = 'https://youtu.be/tm1h80zIYk8';
        updates.link = 'https://youtu.be/tm1h80zIYk8';
        needsUpdate = true;
      }
      if (data.year !== '2026') {
        data.year = '2026';
        updates.year = '2026';
        needsUpdate = true;
      }
      if (data.platform !== 'YouTube') {
        data.platform = 'YouTube';
        updates.platform = 'YouTube';
        needsUpdate = true;
      }
      if (JSON.stringify(data.roles) !== JSON.stringify(['Translator', 'Subtitle Editor', 'Video Editor'])) {
        data.roles = ['Translator', 'Subtitle Editor', 'Video Editor'];
        updates.roles = ['Translator', 'Subtitle Editor', 'Video Editor'];
        needsUpdate = true;
      }
      const desc1 = 'Sản phẩm vietsub bài hát đầy chất nghệ thuật "The Fate of Ophelia" của Taylor Swift. Tập trung vào biên dịch uyển chuyển, khớp nhịp cảm xúc và căn chỉnh phụ đề tinh tế, giúp người xem trọn vẹn cảm nhận từng câu chữ.';
      if (data.description !== desc1) {
        data.description = desc1;
        updates.description = desc1;
        needsUpdate = true;
      }
      if (needsUpdate) {
        updateDoc(docSnap.ref, updates as any).catch(console.error);
      }
    }

    if (docSnap.id === 'personal-2') {
      let needsUpdate = false;
      const updates: Partial<Project> = {};
      
      if (data.title !== 'Thực trạng rác thải | Tiếng Nhật') {
        data.title = 'Thực trạng rác thải | Tiếng Nhật';
        updates.title = 'Thực trạng rác thải | Tiếng Nhật';
        needsUpdate = true;
      }
      if (data.embedUrl !== 'https://youtu.be/_CAeWrfnW9Q') {
        data.embedUrl = 'https://youtu.be/_CAeWrfnW9Q';
        updates.embedUrl = 'https://youtu.be/_CAeWrfnW9Q';
        needsUpdate = true;
      }
      if (data.link !== 'https://youtu.be/_CAeWrfnW9Q') {
        data.link = 'https://youtu.be/_CAeWrfnW9Q';
        updates.link = 'https://youtu.be/_CAeWrfnW9Q';
        needsUpdate = true;
      }
      if (data.year !== '2026') {
        data.year = '2026';
        updates.year = '2026';
        needsUpdate = true;
      }
      if (data.platform !== 'YouTube') {
        data.platform = 'YouTube';
        updates.platform = 'YouTube';
        needsUpdate = true;
      }
      if (JSON.stringify(data.roles) !== JSON.stringify(['Video Editor', 'Subtitle Editor', 'Voiceover'])) {
        data.roles = ['Video Editor', 'Subtitle Editor', 'Voiceover'];
        updates.roles = ['Video Editor', 'Subtitle Editor', 'Voiceover'];
        needsUpdate = true;
      }
      const desc2 = 'Video thuyết trình chủ đề thực trạng rác thải sinh hoạt và công nghiệp, sử dụng tiếng Nhật cùng hệ thống phụ đề song ngữ rõ ràng. Kết hợp đồ họa thông tin trực quan để làm nổi bật thông điệp môi trường ý nghĩa.';
      if (data.description !== desc2) {
        data.description = desc2;
        updates.description = desc2;
        needsUpdate = true;
      }
      if (needsUpdate) {
        updateDoc(docSnap.ref, updates as any).catch(console.error);
      }
    }

    if (docSnap.id === 'personal-3') {
      let needsUpdate = false;
      const updates: Partial<Project> = {};
      
      if (data.title !== 'Hành trình đập đi xây lại | Storytelling') {
        data.title = 'Hành trình đập đi xây lại | Storytelling';
        updates.title = 'Hành trình đập đi xây lại | Storytelling';
        needsUpdate = true;
      }
      if (data.embedUrl !== 'https://youtu.be/KUC2gm9OpDM') {
        data.embedUrl = 'https://youtu.be/KUC2gm9OpDM';
        updates.embedUrl = 'https://youtu.be/KUC2gm9OpDM';
        needsUpdate = true;
      }
      if (data.link !== 'https://youtu.be/KUC2gm9OpDM') {
        data.link = 'https://youtu.be/KUC2gm9OpDM';
        updates.link = 'https://youtu.be/KUC2gm9OpDM';
        needsUpdate = true;
      }
      if (data.year !== '2026') {
        data.year = '2026';
        updates.year = '2026';
        needsUpdate = true;
      }
      if (data.platform !== 'YouTube') {
        data.platform = 'YouTube';
        updates.platform = 'YouTube';
        needsUpdate = true;
      }
      if (JSON.stringify(data.roles) !== JSON.stringify(['Storyteller', 'Video Editor', 'Colorist'])) {
        data.roles = ['Storyteller', 'Video Editor', 'Colorist'];
        updates.roles = ['Storyteller', 'Video Editor', 'Colorist'];
        needsUpdate = true;
      }
      const desc3 = 'Sản phẩm video dạng Storytelling (kể chuyện) chân thực, chia sẻ về hành trình tự đổi mới và kiến tạo lại bản thân từ con số không. Sử dụng nhịp phim sâu lắng, kỹ thuật dựng cinematic kết hợp audio truyền cảm hứng.';
      if (data.description !== desc3) {
        data.description = desc3;
        updates.description = desc3;
        needsUpdate = true;
      }
      if (needsUpdate) {
        updateDoc(docSnap.ref, updates as any).catch(console.error);
      }
    }

    if (docSnap.id === 'personal-4') {
      let needsUpdate = false;
      const updates: Partial<Project> = {};
      
      if (data.title !== 'Thăm Huế') {
        data.title = 'Thăm Huế';
        updates.title = 'Thăm Huế';
        needsUpdate = true;
      }
      if (data.embedUrl !== 'https://youtu.be/i9RSBMzakiA') {
        data.embedUrl = 'https://youtu.be/i9RSBMzakiA';
        updates.embedUrl = 'https://youtu.be/i9RSBMzakiA';
        needsUpdate = true;
      }
      if (data.link !== 'https://youtu.be/i9RSBMzakiA') {
        data.link = 'https://youtu.be/i9RSBMzakiA';
        updates.link = 'https://youtu.be/i9RSBMzakiA';
        needsUpdate = true;
      }
      if (data.year !== '2026') {
        data.year = '2026';
        updates.year = '2026';
        needsUpdate = true;
      }
      if (data.platform !== 'YouTube') {
        data.platform = 'YouTube';
        updates.platform = 'YouTube';
        needsUpdate = true;
      }
      if (JSON.stringify(data.roles) !== JSON.stringify(['Video Editor'])) {
        data.roles = ['Video Editor'];
        updates.roles = ['Video Editor'];
        needsUpdate = true;
      }
      const desc4 = 'Video ngắn ghi lại kỷ niệm chuyến đi thăm Huế mộng mơ.';
      if (data.description !== desc4) {
        data.description = desc4;
        updates.description = desc4;
        needsUpdate = true;
      }
      if (needsUpdate) {
        updateDoc(docSnap.ref, updates as any).catch(console.error);
      }
    }

    if (docSnap.id === 'personal-5') {
      let needsUpdate = false;
      const updates: Partial<Project> = {};
      
      if (data.title !== 'Kungfu Panda') {
        data.title = 'Kungfu Panda';
        updates.title = 'Kungfu Panda';
        needsUpdate = true;
      }
      if (data.embedUrl !== 'https://youtu.be/PBROmXIo2QQ') {
        data.embedUrl = 'https://youtu.be/PBROmXIo2QQ';
        updates.embedUrl = 'https://youtu.be/PBROmXIo2QQ';
        needsUpdate = true;
      }
      if (data.link !== 'https://youtu.be/PBROmXIo2QQ') {
        data.link = 'https://youtu.be/PBROmXIo2QQ';
        updates.link = 'https://youtu.be/PBROmXIo2QQ';
        needsUpdate = true;
      }
      if (data.year !== '2026') {
        data.year = '2026';
        updates.year = '2026';
        needsUpdate = true;
      }
      if (data.platform !== 'YouTube') {
        data.platform = 'YouTube';
        updates.platform = 'YouTube';
        needsUpdate = true;
      }
      if (JSON.stringify(data.roles) !== JSON.stringify(['Video Editor'])) {
        data.roles = ['Video Editor'];
        updates.roles = ['Video Editor'];
        needsUpdate = true;
      }
      const desc5 = 'Dựng phim ngắn chủ đề Kungfu Panda.';
      if (data.description !== desc5) {
        data.description = desc5;
        updates.description = desc5;
        needsUpdate = true;
      }
      if (needsUpdate) {
        updateDoc(docSnap.ref, updates as any).catch(console.error);
      }
    }

    projects.push({ id: docSnap.id, ...data });
  });

  // Ensure any newly added default projects are inserted into Firestore and returned
  const loadedIds = new Set(projects.map(p => p.id));
  const missingProjects = defaultProjects.filter(p => !loadedIds.has(p.id));
  if (missingProjects.length > 0) {
    const batch = writeBatch(db);
    missingProjects.forEach(proj => {
      const docRef = doc(db, 'projects', proj.id);
      batch.set(docRef, proj);
      projects.push(proj);
    });
    await batch.commit();
    projects.sort((a, b) => a.order - b.order);
  }

  // Ensure missing items are added
  const missingProjects2 = defaultProjects.filter(p => p.id.startsWith('social-') && parseInt(p.id.split('-')[1]) >= 9 && !projects.some(ex => ex.title === p.title));
  
  if (missingProjects2.length > 0) {
    for (const p of missingProjects2) {
      await setDoc(doc(db, 'projects', p.id), p);
      projects.push(p);
    }
  }

  // Update existing items that might have random IDs instead of 'social-*'
  for (let i = 0; i < projects.length; i++) {
    const p = projects[i];
    const defaultP = defaultProjects.find(dp => dp.title === p.title);
    if (defaultP && (p.embedUrl !== defaultP.embedUrl || p.platform !== defaultP.platform)) {
      projects[i] = { ...p, embedUrl: defaultP.embedUrl, link: defaultP.link, platform: defaultP.platform };
      await setDoc(doc(db, 'projects', p.id), projects[i], { merge: true });
    }
  }

  return projects.sort((a, b) => a.order - b.order);
}

// Save or Update a single project
export async function saveProject(project: Project): Promise<void> {
  const docRef = doc(db, 'projects', project.id);
  await setDoc(docRef, project, { merge: true });
}

// Delete a project
export async function deleteProject(id: string): Promise<void> {
  const docRef = doc(db, 'projects', id);
  await deleteDoc(docRef);
}

// Check admin passcode
export async function verifyPasscode(enteredPasscode: string): Promise<boolean> {
  const colRef = collection(db, 'config');
  const snapshot = await getDocs(colRef);
  if (snapshot.empty) {
    // Initialize passcode
    const passcodeRef = doc(db, 'config', 'admin');
    await setDoc(passcodeRef, { passcode: '123456' });
    return enteredPasscode === '123456';
  }
  
  let valid = false;
  snapshot.forEach((doc) => {
    if (doc.id === 'admin' && doc.data().passcode === enteredPasscode) {
      valid = true;
    }
  });
  return valid;
}

// Update passcode
export async function updatePasscode(newPasscode: string): Promise<void> {
  const passcodeRef = doc(db, 'config', 'admin');
  await setDoc(passcodeRef, { passcode: newPasscode }, { merge: true });
}

// Fetch Portfolio Content (About, Skills, etc.)
export async function getPortfolioContent(): Promise<Omit<PortfolioContent, 'projects'>> {
  const docRef = doc(db, 'content', 'main');
  const snap = await getDoc(docRef);
  
  const defaultContent: Omit<PortfolioContent, 'projects'> = {
    about: {
      greeting: "Hello! 👋",
      bioParagraphs: [
        "Xin chào, tôi là **Nhu Y Nguyen** — Video Editor đang sinh sống và làm việc tại thành phố biển Đà Nẵng năng động, Việt Nam. Với tâm huyết dựng phim sâu sắc cùng ước mơ kể chuyện bằng ngôn ngữ hình ảnh cuốn hút, tôi liên tục dấn thân để sáng tạo ra những giải pháp đột phá nâng tầm truyền tải thông điệp.",
        "Dù là các clip ngắn sôi động tăng tương tác, những tập podcast sâu sắc hay phim ngắn đậm tính điện ảnh — tôi cam kết đặt toàn bộ tinh hoa trong việc lựa chọn khoảnh khắc vàng, màu sắc và âm thanh để làm nên giá trị vượt bậc và chất lượng chuyên nghiệp xuất sắc nhất cho đối tác."
      ],
      closingMessage: "Hy vọng bạn sẽ thích portfolio của tôi!",
      imageUrl: "/y_dream.png"
    },
    skillCategories: [
      {
        title: "PHẠM VI ĐẢM NHIỆM",
        items: ["Dựng phim hoàn thiện", "Color Grading", "Sound Design", "Motion Graphics"]
      },
      {
        title: "PHẦN MỀM & CÔNG CỤ",
        items: ["Premiere Pro", "DaVinci Resolve", "After Effects", "CapCut PC/Mobile"]
      }
    ],
    skillTags: [
      "Video Editing", "Color Grading", "Sound Design", "Motion Graphics",
      "Social Content", "Podcast Editing", "Short-form Video", "Storytelling"
    ],
    contactInfo: {
      email: "nguyennhuy.nlt@gmail.com",
      tiktok: "@nhuy_work",
      location: "Đà Nẵng, Việt Nam",
      footerText: "© 2024 Nhu Y Nguyen. All rights reserved."
    },
    globalSettings: {
      headingFont: "'Space Grotesk', sans-serif",
      bodyFont: "'Inter', sans-serif"
    }
  };

  if (!snap.exists()) {
    await setDoc(docRef, defaultContent);
    return defaultContent;
  }

  const data = snap.data() as Omit<PortfolioContent, 'projects'>;
  
  // Merge with defaults in case of missing new fields
  return {
    ...defaultContent,
    ...data,
    about: data.about || defaultContent.about,
    skillCategories: data.skillCategories || defaultContent.skillCategories,
    skillTags: data.skillTags || defaultContent.skillTags,
    contactInfo: data.contactInfo || defaultContent.contactInfo,
    globalSettings: data.globalSettings || defaultContent.globalSettings,
  };
}

// Save Portfolio Content
export async function savePortfolioContent(content: Omit<PortfolioContent, 'projects'>): Promise<void> {
  const docRef = doc(db, 'content', 'main');
  await setDoc(docRef, content, { merge: true });
}

// Get contact messages
export async function getContacts(): Promise<ContactMessage[]> {
  const colRef = collection(db, 'contacts');
  const q = query(colRef, orderBy('createdAt', 'desc'));
  const snapshot = await getDocs(q);
  
  const messages: ContactMessage[] = [];
  snapshot.forEach((docSnap) => {
    messages.push({ id: docSnap.id, ...docSnap.data() } as ContactMessage);
  });
  
  return messages;
}

// Delete a contact message
export async function deleteContact(id: string): Promise<void> {
  const docRef = doc(db, 'contacts', id);
  await deleteDoc(docRef);
}

